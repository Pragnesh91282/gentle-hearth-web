import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/apiAuth";

// Lets a patient withdraw a request nobody has picked up yet.
export async function PATCH(_request: Request, context: RouteContext<"/api/support-requests/[id]">) {
  const { id } = await context.params;
  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { data, error } = await admin
    .from("support_requests")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("patient_id", user.id)
    .eq("status", "open")
    .select("id");

  if (error) {
    return jsonError("We could not withdraw this request.", 500);
  }
  if (!data?.length) {
    return jsonError("This request has already been picked up or closed.", 409);
  }

  return NextResponse.json({ ok: true });
}
