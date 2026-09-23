"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Clock3, Stethoscope, XCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMember } from "@/lib/useMember";
import type { DoctorProfile } from "@/lib/types";

const STATUS_COPY = {
  pending: { icon: Clock3, text: "Your application is waiting for moderator review. You'll be able to accept requests as soon as it's verified.", tone: "border-amber-200 bg-amber-50 text-amber-900" },
  verified: { icon: BadgeCheck, text: "You're verified. Open requests appear live in your inbox.", tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  rejected: { icon: XCircle, text: "Your last application wasn't approved. Update your credentials and resubmit for another review.", tone: "border-rose-200 bg-rose-50 text-rose-900" },
};

export default function DoctorApplyPage() {
  const member = useMember();
  const [application, setApplication] = useState<DoctorProfile | null>(null);
  const [credentials, setCredentials] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("By arrangement");
  const [supportMode, setSupportMode] = useState("Free or low-cost");
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
      .select("user_id, credentials, specialties, bio, availability, support_mode, verification_status, created_at")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const profile = data as DoctorProfile;
        setApplication(profile);
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
      body: JSON.stringify({ credentials, bio, availability, supportMode, specialties: specialtyList }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "We could not save your application.");
    } else {
      setApplication({
        user_id: userId ?? "",
        created_at: application?.created_at ?? new Date().toISOString(),
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f4faf8,_#edf8f5_30%,_#f8fafc_100%)] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.08)]">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Stethoscope className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">For doctors and guides</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">{application ? "Your guide profile" : "Apply to offer guidance"}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">A moderator checks your credentials before you can accept requests. Patients see your specialties, bio, and availability, never your email.</p>

          {status && (
            <div role="status" className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${status.tone}`}>
              <status.icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{status.text} {application?.verification_status === "verified" && <Link href="/inbox" className="font-semibold underline">Open inbox</Link>}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="credentials" className="mb-2 block text-sm font-semibold text-slate-700">License or credentials</label>
              <input id="credentials" required maxLength={500} value={credentials} onChange={(event) => setCredentials(event.target.value)} className="field" placeholder="e.g. Licensed Clinical Psychologist, State license #12345" />
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
            <button type="submit" disabled={isSaving || member.status !== "signed-in"} className="w-full rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? "Saving..." : application ? "Save profile" : "Submit for review"}
            </button>
          </form>

          {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
        </section>
      </div>
    </main>
  );
}
