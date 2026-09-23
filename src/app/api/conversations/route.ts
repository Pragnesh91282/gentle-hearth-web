import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/apiAuth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const requestId = typeof body?.requestId === "string" ? body.requestId : "";
  if (!requestId) {
    return jsonError("Choose a request to accept.", 400);
  }

  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { data: doctor } = await admin
    .from("doctor_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("verification_status", "verified")
    .maybeSingle();

  if (!doctor) {
    return jsonError("Only verified doctors can accept support requests.", 403);
  }

  // Locks the request row, so concurrent claims cannot both succeed.
  const { data: conversationId, error } = await admin.rpc("claim_support_request", {
    p_request_id: requestId,
    p_doctor_id: user.id,
  });

  if (error) {
    return jsonError("We could not start this conversation.", 500);
  }
  if (!conversationId) {
    return jsonError("This request is no longer available.", 409);
  }

  return NextResponse.json({ conversationId }, { status: 201 });
}
