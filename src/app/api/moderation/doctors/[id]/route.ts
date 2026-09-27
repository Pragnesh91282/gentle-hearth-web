import { NextResponse } from "next/server";
import { jsonError, requireModerator } from "@/lib/apiAuth";

export async function PATCH(request: Request, context: RouteContext<"/api/moderation/doctors/[id]">) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== "verified" && decision !== "rejected") {
    return jsonError("Choose to verify or reject this application.", 400);
  }

  const { user, admin, response } = await requireModerator();
  if (response) return response;

  const { data: application } = await admin.from("doctor_profiles").select("guide_type").eq("user_id", id).maybeSingle();
  if (!application) {
    return jsonError("We could not find this application.", 404);
  }

  // Registered professionals are only verified after a moderator has found
  // them on the official register (NMC / State Medical Council or RCI).
  const needsRegisterCheck = decision === "verified" && application.guide_type !== "listener";
  if (needsRegisterCheck && body?.registerChecked !== true) {
    return jsonError("Confirm you found this registration on the official register before verifying.", 400);
  }

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("doctor_profiles")
    .update({
      verification_status: decision,
      verified_at: decision === "verified" ? now : null,
      registration_checked_at: needsRegisterCheck ? now : null,
      registration_checked_by: needsRegisterCheck ? user.id : null,
    })
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
