import { NextResponse } from "next/server";
import { evaluateSafety } from "@/lib/safetyAndIdentity";
import { createSupabaseServerAuthClient } from "@/lib/supabaseServerAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const conversationId = typeof body?.conversationId === "string" ? body.conversationId : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!conversationId || !message || message.length > 4000) {
    return NextResponse.json({ error: "Add a message under 4,000 characters." }, { status: 400 });
  }

  const safetyCheck = evaluateSafety(message);
  if (!safetyCheck.isValid) {
    return NextResponse.json({ error: safetyCheck.message, crisis: true }, { status: 400 });
  }

  const authClient = await createSupabaseServerAuthClient();
  const adminClient = getSupabaseServerClient();
  if (!authClient || !adminClient) {
    return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  }

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { data: conversation } = await adminClient
    .from("conversations")
    .select("id, patient_id, doctor_id, status")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation || (conversation.patient_id !== user.id && conversation.doctor_id !== user.id)) {
    return NextResponse.json({ error: "You cannot access this conversation." }, { status: 403 });
  }

  if (conversation.status !== "active") {
    return NextResponse.json({ error: "This conversation is closed." }, { status: 409 });
  }

  const { error } = await adminClient.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: message,
  });

  if (error) {
    return NextResponse.json({ error: "We could not send that message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
