import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/apiAuth";

export async function PATCH(_request: Request, context: RouteContext<"/api/conversations/[id]">) {
  const { id } = await context.params;
  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { data: closed, error } = await admin.rpc("close_conversation", {
    p_conversation_id: id,
    p_user_id: user.id,
  });

  if (error) {
    return jsonError("We could not close this conversation.", 500);
  }
  if (!closed) {
    return jsonError("This conversation is already closed or not yours to close.", 409);
  }

  return NextResponse.json({ ok: true });
}
