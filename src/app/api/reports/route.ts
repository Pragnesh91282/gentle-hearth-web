import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/apiAuth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const conversationId = typeof body?.conversationId === "string" ? body.conversationId : "";
  const messageId = typeof body?.messageId === "string" ? body.messageId : null;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  const block = body?.block === true;

  if (!conversationId || !reason || reason.length > 1000) {
    return jsonError("Tell us briefly what happened (under 1,000 characters).", 400);
  }

  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { data: conversation } = await admin
    .from("conversations")
    .select("id, patient_id, doctor_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation || (conversation.patient_id !== user.id && conversation.doctor_id !== user.id)) {
    return jsonError("You cannot report this conversation.", 403);
  }

  let messageExcerpt: string | null = null;
  if (messageId) {
    const { data: reported } = await admin
      .from("messages")
      .select("body")
      .eq("id", messageId)
      .eq("conversation_id", conversationId)
      .maybeSingle();
    if (!reported) {
      return jsonError("That message is not part of this conversation.", 400);
    }
    messageExcerpt = reported.body;
  }

  const { error } = await admin.from("reports").insert({
    reporter_id: user.id,
    conversation_id: conversationId,
    message_id: messageId,
    message_excerpt: messageExcerpt,
    reason,
  });

  if (error) {
    return jsonError("We could not submit this report.", 500);
  }

  if (block) {
    const otherId = conversation.patient_id === user.id ? conversation.doctor_id : conversation.patient_id;
    await admin.from("blocks").upsert({ blocker_id: user.id, blocked_id: otherId }, { ignoreDuplicates: true });
    await admin.rpc("close_conversation", { p_conversation_id: conversationId, p_user_id: user.id });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
