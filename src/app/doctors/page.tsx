"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, HeartHandshake, ShieldCheck } from "lucide-react";
import { GUIDE_TYPES } from "@/lib/guides";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import type { DoctorProfile as FullDoctorProfile } from "@/lib/types";

type DoctorProfile = Omit<FullDoctorProfile, "verification_status" | "created_at">;

// Registered professionals are named with their registration, as the
// Telemedicine Practice Guidelines require; listeners stay anonymous.
function guideTitle(doctor: DoctorProfile) {
  return GUIDE_TYPES[doctor.guide_type].registration && doctor.full_name ? doctor.full_name : GUIDE_TYPES[doctor.guide_type].label;
}

function guideSubtitle(doctor: DoctorProfile) {
  const { label, registration } = GUIDE_TYPES[doctor.guide_type];
  return registration ? `${label} · ${doctor.registration_council} reg. no. ${doctor.registration_number}` : label;
}

const offerings = [
  "Offer general emotional guidance and listening support",
  "Respond to questions without creating pressure or guilt",
  "Support people with low-cost or free care pathways",
  "Create a calmer entry point for professional mental support",
];

export default function DoctorsPage() {
  const [doctorCards, setDoctorCards] = useState<DoctorProfile[]>([]);
  const [selected, setSelected] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDoctorProfiles() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("doctor_profiles")
        .select("user_id, credentials, specialties, bio, availability, support_mode, guide_type, full_name, registration_council, registration_number")
        .eq("verification_status", "verified")
        .order("created_at", { ascending: false });
      const profiles = (data ?? []) as DoctorProfile[];
      setDoctorCards(profiles);
      setSelected(profiles[0]?.user_id ?? "");
      setIsLoading(false);
    }

    void loadDoctorProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f4faf8,_#edf8f5_30%,_#f8fafc_100%)] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.08)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            <HeartHandshake className="h-3.5 w-3.5" />
            For doctors and guides
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Offer support in a way that feels gentle and sustainable.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Thehrav is designed for professionals who want to provide thoughtful guidance without pressure, rush, or overwhelming demand. Here, care can be human, respectful, and accessible.
              </p>

              <div className="mt-6 grid gap-3">
                {offerings.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/doctors/apply" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-800">
                Apply to offer guidance
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Available support</h2>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <CalendarCheck2 className="h-3.5 w-3.5" />
                  Flexible hours
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {isLoading && <p className="rounded-2xl bg-white p-4 text-sm text-slate-600">Loading verified profiles...</p>}
                {!isLoading && doctorCards.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">No verified guides are available yet. Profiles appear here after moderator review.</p>}
                {doctorCards.map((doctor) => (
                  <button
                    type="button"
                    key={doctor.user_id}
                    onClick={() => setSelected(doctor.user_id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected === doctor.user_id
                        ? "border-emerald-500 bg-white shadow-sm"
                        : "border-slate-200 bg-white/60 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{guideTitle(doctor)}</p>
                        <p className="mt-1 text-xs text-slate-500">{guideSubtitle(doctor)}</p>
                        <p className="mt-1 text-xs font-medium text-emerald-700">{doctor.specialties.join(", ") || doctor.credentials}</p>
                      </div>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" aria-label="Verified profile" />
                    </div>

                    <p className="mt-3 text-xs text-slate-600">{doctor.availability} · {doctor.support_mode}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {doctorCards.map((doctor) => (
            <div key={doctor.user_id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xl font-bold text-slate-900">{guideTitle(doctor)}</p>
                <ShieldCheck className="h-5 w-5 text-emerald-600" aria-label="Verified profile" />
              </div>
              <p className="mb-2 text-xs text-slate-500">{guideSubtitle(doctor)}</p>
              <p className="mb-3 text-xs leading-5 text-slate-600">{GUIDE_TYPES[doctor.guide_type].scope}</p>

              <p className="text-sm font-medium text-emerald-700">{doctor.specialties.join(", ") || doctor.credentials}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{doctor.bio}</p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-xs font-medium text-slate-700">{doctor.availability} · {doctor.support_mode}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
