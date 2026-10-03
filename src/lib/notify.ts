import { createHmac, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const FROM = process.env.EMAIL_FROM ?? `${SITE_NAME} <notifications@thehrav-thementalhealthsupport.com>`;
// At most one email per conversation per person in this window.
const QUIET_HOURS = 6;
// Someone who wrote in the conversation this recently is still there.
const ACTIVE_MINUTES = 10;

type Role = "patient" | "doctor";
type Kind = "reply" | "accepted";

// Unsubscribe links are signed so they work without signing in. The key is
// derived from the service-role key, which only the server has.
function unsubscribeToken(userId: string) {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "")
    .update(`unsubscribe:${userId}`)
    .digest("base64url");
}

export function unsubscribeUrl(userId: string) {
  return `${SITE_URL}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;
}

export function isValidUnsubscribe(userId: string, token: string) {
  const expected = Buffer.from(unsubscribeToken(userId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

// Emails a participant that something happened in a conversation. Emails
// never contain message text, and the subject never mentions mental health,
// because many people share an inbox or a phone.
export async function notifyByEmail(admin: SupabaseClient, conversationId: string, recipientRole: Role, kind: Kind) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const { data: conversation } = await admin
    .from("conversations")
    .select("patient_id, doctor_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation) return;
  const recipientId: string = recipientRole === "patient" ? conversation.patient_id : conversation.doctor_id;

  const { data: profile } = await admin.from("profiles").select("email_notifications").eq("id", recipientId).maybeSingle();
  if (profile?.email_notifications === false) return;

  if (kind === "reply") {
    const since = new Date(Date.now() - ACTIVE_MINUTES * 60_000).toISOString();
    const { count } = await admin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .eq("sender_id", recipientId)
      .gte("created_at", since);
    if ((count ?? 0) > 0) return;
  }

  // Claims the send slot atomically, so two quick messages can't both email.
  const column = recipientRole === "patient" ? "patient_notified_at" : "doctor_notified_at";
  const cutoff = new Date(Date.now() - QUIET_HOURS * 3_600_000).toISOString();
  const { data: claimed } = await admin
    .from("conversations")
    .update({ [column]: new Date().toISOString() })
    .eq("id", conversationId)
    .or(`${column}.is.null,${column}.lt.${cutoff}`)
    .select("id");
  if (!claimed?.length) return;

  const { data: { user } } = await admin.auth.admin.getUserById(recipientId);
  if (!user?.email) return;

  const subject = kind === "accepted" ? `Your request on ${SITE_NAME} has been picked up` : `New message on ${SITE_NAME}`;
  const lead = kind === "accepted"
    ? "A guide has picked up your request and started a conversation with you."
    : "There's a new message in one of your conversations.";
  const inboxUrl = `${SITE_URL}/inbox`;
  const optOut = unsubscribeUrl(recipientId);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: user.email,
      subject,
      text: `${lead}\n\nOpen ${SITE_NAME} to read it, whenever you're ready: ${inboxUrl}\n\nFor your privacy, we never put messages in emails.\n\nDon't want these emails? Turn them off: ${optOut}`,
      html: emailHtml(lead, inboxUrl, optOut),
      headers: {
        "List-Unsubscribe": `<${optOut}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (!response.ok) {
    console.error("Reply email failed", response.status, await response.text().catch(() => ""));
  }
}

export function emailHtml(lead: string, inboxUrl: string, optOut: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4faf6;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #d1fae5;border-radius:20px">
<tr><td style="padding:32px">
<p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#065f46">${SITE_NAME}</p>
<p style="margin:0 0 12px;font-size:16px;line-height:1.6">${lead}</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6">Open ${SITE_NAME} to read it, whenever you're ready.</p>
<a href="${inboxUrl}" style="display:inline-block;background:#047857;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:999px">Open your inbox</a>
<p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#64748b">For your privacy, we never put messages in emails.<br><a href="${optOut}" style="color:#64748b">Turn off these emails</a></p>
</td></tr></table></td></tr></table></body></html>`;
}
