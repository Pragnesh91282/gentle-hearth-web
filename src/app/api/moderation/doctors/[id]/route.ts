import { NextResponse } from "next/server";
import { jsonError, requireModerator } from "@/lib/apiAuth";

export async function PATCH(request: Request, context: RouteContext<"/api/moderation/doctors/[id]">) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== "verified" && decision !== "rejected") {
    return jsonError("Choose to verify or reject this application.", 400);
  }

  const { admin, response } = await requireModerator();
  if (response) return response;

  const { data, error } = await admin
    .from("doctor_profiles")
    .update({ verification_status: decision, verified_at: decision === "verified" ? new Date().toISOString() : null })
    .eq("user_id", id)
    .select("user_id");

  if (error || !data?.length) {
    return jsonError("We could not update this application.", error ? 500 : 404);
  }

  // Verified doctors need the doctor role; moderators keep theirs.
  if (decision === "verified") {
    await admin.from("profiles").update({ role: "doctor" }).eq("id", id).eq("role", "patient");
  } else {
    await admin.from("profiles").update({ role: "patient" }).eq("id", id).eq("role", "doctor");
  }

  return NextResponse.json({ ok: true });
}
