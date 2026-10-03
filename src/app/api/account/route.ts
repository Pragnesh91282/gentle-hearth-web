import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/apiAuth";

// Permanently deletes the signed-in member. Their profile, requests,
// conversations, and messages cascade from auth.users.
export async function DELETE() {
  const { user, admin, response } = await requireUser();
  if (response) return response;

  // Conversations keep a non-cascading reference to the guide, so guides who
  // have accepted requests are removed by a moderator instead.
  const { count } = await admin
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", user.id);
  if ((count ?? 0) > 0) {
    return jsonError("Guides who have accepted requests can't delete their account here. Please contact our Grievance Officer and we'll handle it.", 409);
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return jsonError("We could not delete your account. Please try again or contact our Grievance Officer.", 500);
  }

  return NextResponse.json({ ok: true });
}

// Updates the member's own preferences.
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.emailNotifications !== "boolean") {
    return jsonError("Choose whether to receive emails.", 400);
  }

  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { error } = await admin.from("profiles").update({ email_notifications: body.emailNotifications }).eq("id", user.id);
  if (error) {
    return jsonError("We could not save this setting.", 500);
  }

  return NextResponse.json({ ok: true });
}
