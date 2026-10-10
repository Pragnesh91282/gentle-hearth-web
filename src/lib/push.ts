import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_NAME } from "@/lib/site";

// At most one notification per conversation per person in this window, so a
// quick back-and-forth doesn't buzz their phone for every message.
const QUIET_MINUTES = 5;

let configured = false;
function configure() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:notifications@thehrav-thementalhealthsupport.com", publicKey, privateKey);
    configured = true;
  }
  return true;
}

export type PushMessage = { title: string; body: string; url: string; tag: string };

// Sends a phone notification to every device the member turned them on for.
// Like the emails, it never contains message text.
export async function sendPush(admin: SupabaseClient, recipientId: string, conversationId: string, role: "patient" | "doctor", message: PushMessage) {
  if (!configure()) return;

  const { data: subscriptions } = await admin.from("push_subscriptions").select("endpoint, p256dh, auth").eq("user_id", recipientId);
  if (!subscriptions?.length) return;

  // Claims the send slot atomically, as the emails do.
  const column = role === "patient" ? "patient_pushed_at" : "doctor_pushed_at";
  const cutoff = new Date(Date.now() - QUIET_MINUTES * 60_000).toISOString();
  const { data: claimed } = await admin
    .from("conversations")
    .update({ [column]: new Date().toISOString() })
    .eq("id", conversationId)
    .or(`${column}.is.null,${column}.lt.${cutoff}`)
    .select("id");
  if (!claimed?.length) return;

  const payload = JSON.stringify(message);
  await Promise.all(subscriptions.map(async ({ endpoint, p256dh, auth }) => {
    try {
      await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, payload, { TTL: 24 * 60 * 60, urgency: "normal" });
    } catch (error) {
      // The device unsubscribed or the app was removed: forget it.
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
      } else {
        console.error("Push failed", status ?? error);
      }
    }
  }));
}

export function pushMessage(kind: "reply" | "accepted", conversationId: string): PushMessage {
  return {
    title: SITE_NAME,
    body: kind === "accepted" ? "A guide has picked up your request." : "You have a new message.",
    url: "/inbox",
    // One notification per conversation: a newer one replaces the last.
    tag: `conversation-${conversationId}`,
  };
}
