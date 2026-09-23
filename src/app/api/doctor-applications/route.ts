import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/apiAuth";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const credentials = text(body?.credentials, 500);
  const bio = text(body?.bio, 1500);
  const availability = text(body?.availability, 120) || "By arrangement";
  const supportMode = text(body?.supportMode, 120) || "Free or low-cost";
  const specialties = Array.isArray(body?.specialties)
    ? body.specialties.filter((item: unknown): item is string => typeof item === "string").map((item: string) => item.trim().slice(0, 60)).filter(Boolean).slice(0, 8)
    : [];

  if (!credentials) {
    return jsonError("Add your license or credentials so a moderator can verify them.", 400);
  }

  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { data: existing } = await admin
    .from("doctor_profiles")
    .select("credentials, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  // Profile edits keep verification; changed credentials go back for review.
  const keepVerified = existing?.verification_status === "verified" && existing.credentials === credentials;
  const verificationStatus = keepVerified ? "verified" : "pending";

  const { error } = await admin.from("doctor_profiles").upsert({
    user_id: user.id,
    credentials,
    specialties,
    bio,
    availability,
    support_mode: supportMode,
    verification_status: verificationStatus,
    ...(keepVerified ? {} : { verified_at: null }),
  });

  if (error) {
    return jsonError("We could not save your application.", 500);
  }

  return NextResponse.json({ ok: true, verificationStatus }, { status: 201 });
}
