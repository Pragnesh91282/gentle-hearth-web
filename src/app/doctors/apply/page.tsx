"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Clock3, Stethoscope, XCircle } from "lucide-react";
import { GUIDE_TYPES, type GuideType } from "@/lib/guides";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMember } from "@/lib/useMember";
import type { DoctorProfile } from "@/lib/types";

const STATUS_COPY = {
  pending: { icon: Clock3, text: "Your application is waiting for moderator review. You'll be able to accept requests as soon as it's verified.", tone: "border-amber-200 bg-amber-50 text-amber-900" },
  verified: { icon: BadgeCheck, text: "You're verified. Open requests appear live in your inbox.", tone: "border-sand-200 bg-sand-100 text-leaf-900" },
  rejected: { icon: XCircle, text: "Your last application wasn't approved. Update your credentials and resubmit for another review.", tone: "border-rose-200 bg-rose-50 text-rose-900" },
};

export default function DoctorApplyPage() {
  const member = useMember();
  const [application, setApplication] = useState<DoctorProfile | null>(null);
  const [guideType, setGuideType] = useState<GuideType>("listener");
  const [fullName, setFullName] = useState("");
  const [registrationCouncil, setRegistrationCouncil] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [credentials, setCredentials] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("By arrangement");
  const [supportMode, setSupportMode] = useState("Free");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const userId = member.profile?.id;

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !userId) return;

    const channel = supabase
      .channel(`doctor-application-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "doctor_profiles", filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.new && "user_id" in payload.new) setApplication(payload.new as DoctorProfile);
      })
      .subscribe();

    void supabase
      .from("doctor_profiles")
      .select("user_id, credentials, specialties, bio, availability, support_mode, verification_status, guide_type, full_name, registration_council, registration_number, created_at")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const profile = data as DoctorProfile;
        setApplication(profile);
        setGuideType(profile.guide_type);
        setFullName(profile.full_name ?? "");
        setRegistrationCouncil(profile.registration_council ?? "");
        setRegistrationNumber(profile.registration_number ?? "");
        setCredentials(profile.credentials);
        setSpecialties(profile.specialties.join(", "));
        setBio(profile.bio);
        setAvailability(profile.availability);
        setSupportMode(profile.support_mode);
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const specialtyList = specialties.split(",").map((item) => item.trim()).filter(Boolean);
    const response = await fetch("/api/doctor-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guideType, fullName, registrationCouncil, registrationNumber, credentials, bio, availability, supportMode, specialties: specialtyList }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "We could not save your application.");
    } else {
      setApplication({
        user_id: userId ?? "",
        created_at: application?.created_at ?? new Date().toISOString(),
        guide_type: guideType,
        full_name: registration ? fullName : null,
        registration_council: guideType === "psychologist" ? registration?.councilHint ?? null : registration ? registrationCouncil : null,
        registration_number: registration ? registrationNumber : null,
        credentials,
        bio,
        availability,
        support_mode: supportMode,
        specialties: specialtyList,
        verification_status: result.verificationStatus,
      });
    }
    setIsSaving(false);
  }

  const status = application ? STATUS_COPY[application.verification_status] : null;
  const registration = GUIDE_TYPES[guideType].registration;

  return (
    <main className="min-h-screen bg-sand-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-[2rem] border border-sand-200 bg-white p-8 shadow-xl shadow-leaf-900/5">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100 text-leaf-700">
            <Stethoscope className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf-700">For doctors and guides</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-leaf-900 tracking-tight">{application ? "Your guide profile" : "Apply to offer guidance"}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">A moderator reviews every application before you can accept requests. Registered doctors and psychologists are checked against the official register, and patients see your name and registration number, as India&apos;s Telemedicine Practice Guidelines require. Patients never see your email. Every guide agrees to meet members with goodwill and equal regard, and never to promote any religion, belief or practice (see our <Link href="/principles" className="underline">principles</Link>).</p>

          {status && (
            <div role="status" className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${status.tone}`}>
              <status.icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{status.text} {application?.verification_status === "verified" && <Link href="/inbox" className="font-semibold underline">Open inbox</Link>}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <fieldset>
              <legend className="mb-2 block text-sm font-semibold text-slate-700">I am a</legend>
              <div className="grid gap-2">
                {(Object.keys(GUIDE_TYPES) as GuideType[]).map((type) => (
                  <label key={type} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition ${guideType === type ? "border-leaf-700 bg-sand-100" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="guide-type" value={type} checked={guideType === type} onChange={() => setGuideType(type)} className="mt-1 accent-leaf-700" />
                    <span>
                      <span className="block font-semibold text-slate-800">{GUIDE_TYPES[type].label}</span>
                      <span className="block text-xs leading-5 text-slate-600">{GUIDE_TYPES[type].scope}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {registration && (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <label htmlFor="full-name" className="mb-2 block text-sm font-semibold text-slate-700">Full name as registered</label>
                  <input id="full-name" required maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} className="field" />
                </div>
                {guideType === "doctor" && (
                  <div>
                    <label htmlFor="council" className="mb-2 block text-sm font-semibold text-slate-700">Medical council</label>
                    <input id="council" required maxLength={120} value={registrationCouncil} onChange={(event) => setRegistrationCouncil(event.target.value)} className="field" placeholder={registration.councilHint} />
                  </div>
                )}
                <div>
                  <label htmlFor="registration-number" className="mb-2 block text-sm font-semibold text-slate-700">{registration.numberLabel}</label>
                  <input id="registration-number" required maxLength={40} value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} className="field" />
                  <p className="mt-1 text-xs text-slate-500">A moderator will look this up on the {registration.registerName}. Changing it after verification sends your profile back for review.</p>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="credentials" className="mb-2 block text-sm font-semibold text-slate-700">{registration ? "Qualifications" : "Training or experience"}</label>
              <input id="credentials" required maxLength={500} value={credentials} onChange={(event) => setCredentials(event.target.value)} className="field" placeholder={registration ? "e.g. MBBS, MD Psychiatry" : "e.g. Completed a peer-support or active-listening course"} />
              <p className="mt-1 text-xs text-slate-500">Changing this after verification sends your profile back for review.</p>
            </div>
            <div>
              <label htmlFor="specialties" className="mb-2 block text-sm font-semibold text-slate-700">Specialties</label>
              <input id="specialties" value={specialties} onChange={(event) => setSpecialties(event.target.value)} className="field" placeholder="Anxiety, burnout, sleep" />
            </div>
            <div>
              <label htmlFor="bio" className="mb-2 block text-sm font-semibold text-slate-700">Short bio</label>
              <textarea id="bio" rows={4} maxLength={1500} value={bio} onChange={(event) => setBio(event.target.value)} className="field" placeholder="How you like to support people" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="availability" className="mb-2 block text-sm font-semibold text-slate-700">Availability</label>
                <input id="availability" maxLength={120} value={availability} onChange={(event) => setAvailability(event.target.value)} className="field" />
              </div>
              <div>
                <label htmlFor="support-mode" className="mb-2 block text-sm font-semibold text-slate-700">Cost</label>
                <input id="support-mode" maxLength={120} value={supportMode} onChange={(event) => setSupportMode(event.target.value)} className="field" />
              </div>
            </div>
            <button type="submit" disabled={isSaving || member.status !== "signed-in"} className="w-full rounded-full bg-leaf-700 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-leaf-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? "Saving..." : application ? "Save profile" : "Submit for review"}
            </button>
          </form>

          {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
        </section>
      </div>
    </main>
  );
}
