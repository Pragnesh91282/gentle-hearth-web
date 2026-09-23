import { NextResponse } from "next/server";
import { CRISIS_MESSAGE, detectCrisis } from "@/lib/safetyAndIdentity";
import { jsonError, requireUser } from "@/lib/apiAuth";

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

  const isUrgent = detectCrisis(message);
  const { data: saved, error } = await admin
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: message, is_urgent: isUrgent })
    .select("id, conversation_id, sender_id, body, is_urgent, created_at")
    .single();

  if (error || !saved) {
    return jsonError("We could not send that message.", 500);
  }

  // Only the sender needs crisis resources; the other participant sees the urgent flag.
  const showResources = isUrgent && conversation.patient_id === user.id;
  return NextResponse.json({ message: saved, crisisMessage: showResources ? CRISIS_MESSAGE : undefined }, { status: 201 });
}
