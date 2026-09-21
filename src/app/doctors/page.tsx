"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2, HeartHandshake, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type DoctorProfile = {
  user_id: string;
  credentials: string;
  specialties: string[];
  bio: string;
  availability: string;
  support_mode: string;
};

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
        .select("user_id, credentials, specialties, bio, availability, support_mode")
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
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mt-8 rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.08)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            <HeartHandshake className="h-3.5 w-3.5" />
            For doctors and guides
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Offer support in a way that feels gentle and sustainable.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Gentle Hearth is designed for professionals who want to provide thoughtful guidance without pressure, rush, or overwhelming demand. Here, care can be human, respectful, and accessible.
              </p>

              <div className="mt-6 grid gap-3">
                {offerings.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
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
                {!isLoading && doctorCards.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">No verified professionals are available yet. Doctor profiles will appear here after credential review.</p>}
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
                        <p className="font-semibold text-slate-900">Verified professional</p>
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
                <p className="text-xl font-bold text-slate-900">Verified professional</p>
                <ShieldCheck className="h-5 w-5 text-emerald-600" aria-label="Verified profile" />
              </div>

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
