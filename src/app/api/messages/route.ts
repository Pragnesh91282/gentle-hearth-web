import { after, NextResponse } from "next/server";
import { CRISIS_MESSAGE, detectCrisis } from "@/lib/safetyAndIdentity";
import { jsonError, requireUser } from "@/lib/apiAuth";
import { notifyByEmail } from "@/lib/notify";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const conversationId = typeof body?.conversationId === "string" ? body.conversationId : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!conversationId || !message || message.length > 4000) {
    return jsonError("Add a message under 4,000 characters.", 400);
  }

  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { data: conversation } = await admin
    .from("conversations")
    .select("id, patient_id, doctor_id, status")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation || (conversation.patient_id !== user.id && conversation.doctor_id !== user.id)) {
    return jsonError("You cannot access this conversation.", 403);
  }

  if (conversation.status !== "active") {
    return jsonError("This conversation is closed.", 409);
  }

  const limited = await isRateLimited(admin, "messages", "sender_id", user.id, [
    { seconds: 60, max: 15 },
    { seconds: 3600, max: 200 },
  ]);
  if (limited) {
    return jsonError("You're sending messages very quickly. Please wait a moment, then try again.", 429);
  }

  const { data: saved, error } = await admin
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: message })
    .select("id, conversation_id, sender_id, body, created_at")
    .single();

  if (error || !saved) {
    return jsonError("We could not send that message.", 500);
  }

  // Lets the other person know by email, after the response is sent.
  const recipientRole = conversation.patient_id === user.id ? "doctor" : "patient";
  after(() => notifyByEmail(admin, conversationId, recipientRole, "reply").catch((error) => console.error("Reply email failed", error)));

  // Only the member who wrote it is pointed to emergency services.
  const showResources = conversation.patient_id === user.id && detectCrisis(message);
  return NextResponse.json({ message: saved, crisisMessage: showResources ? CRISIS_MESSAGE : undefined }, { status: 201 });
}
