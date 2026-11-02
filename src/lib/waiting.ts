import type { SupabaseClient } from "@supabase/supabase-js";
import { deliverEmail } from "@/lib/notify";
import { sendPushToMember } from "@/lib/push";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Requests with no reply get one gentle check-in after a day, and close kindly
// after a week, so nobody is left waiting in silence or forever.
const CHECK_IN_AFTER_HOURS = 24;
const CLOSE_AFTER_DAYS = 7;

export async function careForWaitingRequests(admin: SupabaseClient, now = new Date()) {
  const checkInBefore = new Date(now.getTime() - CHECK_IN_AFTER_HOURS * 3_600_000).toISOString();
  const closeBefore = new Date(now.getTime() - CLOSE_AFTER_DAYS * 86_400_000).toISOString();

  // Close week-old requests first, so they don't also get a check-in.
  const { data: closed } = await admin
    .from("support_requests")
    .update({ status: "closed", closed_at: now.toISOString(), closed_reason: "expired" })
    .eq("status", "open")
    .lt("created_at", closeBefore)
    .select("id, patient_id");
  for (const request of closed ?? []) {
    await notify(admin, request.patient_id, "closed");
  }

  const { data: due } = await admin
    .from("support_requests")
    .select("id, patient_id")
    .eq("status", "open")
    .is("checkin_sent_at", null)
    .lt("created_at", checkInBefore);
  let checkedIn = 0;
  for (const request of due ?? []) {
    // Claimed atomically: a request is checked in on once, even if the job overlaps.
    const { data: claimed } = await admin
      .from("support_requests")
      .update({ checkin_sent_at: now.toISOString() })
      .eq("id", request.id)
      .eq("status", "open")
      .is("checkin_sent_at", null)
      .select("id");
    if (!claimed?.length) continue;
    await notify(admin, request.patient_id, "check-in");
    checkedIn += 1;
  }

  return { checkedIn, closed: closed?.length ?? 0 };
}

async function notify(admin: SupabaseClient, patientId: string, kind: "check-in" | "closed") {
  const checkIn = kind === "check-in";
  const results = await Promise.allSettled([
    deliverEmail(admin, patientId, checkIn
      ? {
          subject: `A note from ${SITE_NAME}`,
          lead: "We haven't forgotten you. Your request hasn't been picked up yet: guides give their time freely, so it can take a little while.",
          follow: "While you wait, a short breathing pause can help. And if you need someone right now, call Tele-MANAS on 14416 (free, 24/7).",
          button: { label: "Take a breathing pause", url: `${SITE_URL}/pause` },
        }
      : {
          subject: `Your request on ${SITE_NAME} has closed`,
          lead: "We're sorry no guide was able to reply this time. Your request has now closed, so it doesn't wait forever.",
          follow: "You're welcome to send a new one whenever you like. If you need someone right now, call Tele-MANAS on 14416 (free, 24/7).",
          button: { label: "Share what's on your mind", url: `${SITE_URL}/patients` },
        }),
    sendPushToMember(admin, patientId, checkIn
      ? { title: SITE_NAME, body: "We haven't forgotten you. A guide will reply as soon as one is free.", url: "/pause", tag: "waiting" }
      : { title: SITE_NAME, body: "Your request has closed. You're welcome to send a new one any time.", url: "/patients", tag: "waiting" }),
  ]);
  for (const result of results) {
    if (result.status === "rejected") console.error("Waiting notification failed", result.reason);
  }
}
