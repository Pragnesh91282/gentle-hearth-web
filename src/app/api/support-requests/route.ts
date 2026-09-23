import { NextResponse } from "next/server";
import { CRISIS_MESSAGE, detectCrisis, SUPPORT_OPTIONS } from "@/lib/safetyAndIdentity";
import { jsonError, requireUser } from "@/lib/apiAuth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const supportType = typeof body?.supportType === "string" ? body.supportType.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const consented = body?.consented === true;

  if (!SUPPORT_OPTIONS.includes(supportType) || !message || !consented) {
    return jsonError("Choose a support option and share a message.", 400);
  }

  if (message.length > 2000) {
    return jsonError("Please keep your message under 2,000 characters.", 400);
  }

  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { count } = await admin
    .from("support_requests")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", user.id)
    .eq("status", "open");
  if ((count ?? 0) >= 3) {
    return jsonError("You already have 3 open requests. A guide will reach out soon — you can follow them in your inbox.", 429);
  }

  const isUrgent = detectCrisis(message);
  const { error } = await admin.from("support_requests").insert({
    patient_id: user.id,
    support_type: supportType,
    message,
    status: "open",
    consented_to_guidance: consented,
    is_urgent: isUrgent,
  });

  if (error) {
    return jsonError("We could not save your request. Please try again.", 500);
  }

  return NextResponse.json({ ok: true, urgent: isUrgent, crisisMessage: isUrgent ? CRISIS_MESSAGE : undefined }, { status: 201 });
}
