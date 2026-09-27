import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/apiAuth";
import { isGuideType } from "@/lib/guides";

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

  const guideType = isGuideType(body?.guideType) ? body.guideType : null;
  const isRegistered = guideType === "doctor" || guideType === "psychologist";
  const fullName = isRegistered ? text(body?.fullName, 120) : "";
  const registrationCouncil = guideType === "psychologist" ? "Rehabilitation Council of India" : isRegistered ? text(body?.registrationCouncil, 120) : "";
  const registrationNumber = isRegistered ? text(body?.registrationNumber, 40) : "";

  if (!guideType) {
    return jsonError("Choose whether you are a registered doctor, a registered clinical psychologist, or a listener.", 400);
  }
  if (!credentials) {
    return jsonError("Describe your qualifications or training so a moderator can review them.", 400);
  }
  if (isRegistered && (!fullName || !registrationCouncil || !/^[A-Za-z0-9][A-Za-z0-9/. -]{1,39}$/.test(registrationNumber))) {
    return jsonError("Add your full name as registered, your council, and a valid registration number.", 400);
  }

  const { user, admin, response } = await requireUser();
  if (response) return response;

  const { data: existing } = await admin
    .from("doctor_profiles")
    .select("credentials, verification_status, guide_type, full_name, registration_council, registration_number")
    .eq("user_id", user.id)
    .maybeSingle();

  const registration = {
    guide_type: guideType,
    full_name: fullName || null,
    registration_council: registrationCouncil || null,
    registration_number: registrationNumber || null,
  };

  // Profile edits keep verification; changed credentials or registration go back for review.
  const keepVerified = existing?.verification_status === "verified"
    && existing.credentials === credentials
    && (Object.keys(registration) as (keyof typeof registration)[]).every((key) => existing[key] === registration[key]);
  const verificationStatus = keepVerified ? "verified" : "pending";

  const { error } = await admin.from("doctor_profiles").upsert({
    user_id: user.id,
    credentials,
    ...registration,
    specialties,
    bio,
    availability,
    support_mode: supportMode,
    verification_status: verificationStatus,
    ...(keepVerified ? {} : { verified_at: null, registration_checked_at: null, registration_checked_by: null }),
  });

  if (error?.code === "23505") {
    return jsonError("This registration number is already linked to another account. If it's yours, contact our Grievance Officer.", 409);
  }
  if (error) {
    return jsonError("We could not save your application.", 500);
  }

  return NextResponse.json({ ok: true, verificationStatus }, { status: 201 });
}
