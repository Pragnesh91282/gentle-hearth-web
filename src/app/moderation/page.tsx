"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, ExternalLink, Flag, ShieldAlert, XCircle } from "lucide-react";
import { GUIDE_TYPES } from "@/lib/guides";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMember } from "@/lib/useMember";
import type { DoctorProfile, Report } from "@/lib/types";

export default function ModerationPage() {
  const member = useMember();
  const isModerator = member.profile?.role === "moderator";
  const [applications, setApplications] = useState<DoctorProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  // Applications whose registration the moderator has found on the official register.
  const [registerChecked, setRegisterChecked] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const [applicationResult, reportResult] = await Promise.all([
      supabase.from("doctor_profiles").select("user_id, credentials, specialties, bio, availability, support_mode, verification_status, guide_type, full_name, registration_council, registration_number, created_at").eq("verification_status", "pending").order("created_at", { ascending: true }),
      supabase.from("reports").select("id, reporter_id, reported_user_id, reported_name, conversation_id, message_id, message_excerpt, reason, status, created_at").neq("status", "resolved").order("created_at", { ascending: true }),
    ]);
    const nextApplications = (applicationResult.data ?? []) as DoctorProfile[];
    const nextReports = (reportResult.data ?? []) as Report[];
    setApplications(nextApplications);
    setReports(nextReports);

    const ids = [...new Set([
      ...nextApplications.map((a) => a.user_id),
      ...nextReports.flatMap((r) => [r.reporter_id, r.reported_user_id]),
    ].filter((id): id is string => Boolean(id)))];
    if (ids.length) {
      const { data } = await supabase.from("profiles").select("id, display_name").in("id", ids);
      setNames(Object.fromEntries((data ?? []).map((p) => [p.id, p.display_name])));
    }
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !isModerator) return;

    const channel = supabase
      .channel("moderation-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "doctor_profiles" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => void load())
      // Load once connected (or once it fails), and again after every reconnect.
      .subscribe(() => void load());

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isModerator, load]);

  async function act(url: string, body: unknown) {
    setError("");
    const response = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error ?? "That action did not go through.");
    }
    await load();
  }

  if (member.status === "loading") {
    return <main className="flex flex-1 items-center justify-center p-10 text-slate-600">Loading…</main>;
  }
  if (!isModerator) {
    return <main className="flex flex-1 items-center justify-center p-10 text-sm text-slate-600">This area is only available to Gentle Hearth moderators.</main>;
  }

  return (
    <main className="flex-1 bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Moderation</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Keep the space safe.</h1>
        {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold"><BadgeCheck className="h-5 w-5 text-emerald-700" />Doctor applications <span className="text-sm font-medium text-slate-500">({applications.length})</span></h2>
            <div className="mt-4 space-y-3">
              {applications.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No applications waiting.</p>}
              {applications.map((application) => {
                const registration = GUIDE_TYPES[application.guide_type].registration;
                const canVerify = !registration || registerChecked[application.user_id];
                return (
                <article key={application.user_id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{names[application.user_id] ?? "Applicant"}</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-800">{GUIDE_TYPES[application.guide_type].label}</span>
                  </div>
                  {registration && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3 text-slate-700">
                      <p><span className="font-medium">Registered name:</span> {application.full_name}</p>
                      <p><span className="font-medium">Council:</span> {application.registration_council}</p>
                      <p><span className="font-medium">{registration.numberLabel}:</span> {application.registration_number}</p>
                      <a href={registration.registerUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
                        Search the {registration.registerName}<ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <p className="mt-2 text-slate-700"><span className="font-medium">Qualifications:</span> {application.credentials}</p>
                  {application.specialties.length > 0 && <p className="mt-1 text-slate-600">{application.specialties.join(", ")}</p>}
                  {application.bio && <p className="mt-2 text-slate-600">{application.bio}</p>}
                  {registration ? (
                    <label className="mt-3 flex items-start gap-2 text-xs text-slate-700">
                      <input type="checkbox" checked={Boolean(registerChecked[application.user_id])} onChange={(event) => setRegisterChecked((current) => ({ ...current, [application.user_id]: event.target.checked }))} className="mt-0.5 accent-emerald-700" />
                      I found this registration number on the official register, it is active, and the name matches.
                    </label>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">Listeners offer emotional support only. Check that their training and bio describe listening, not treatment.</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button type="button" disabled={!canVerify} onClick={() => void act(`/api/moderation/doctors/${application.user_id}`, { decision: "verified", registerChecked: Boolean(registerChecked[application.user_id]) })} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><BadgeCheck className="h-3.5 w-3.5" />Verify</button>
                    <button type="button" onClick={() => void act(`/api/moderation/doctors/${application.user_id}`, { decision: "rejected" })} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><XCircle className="h-3.5 w-3.5" />Reject</button>
                  </div>
                </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldAlert className="h-5 w-5 text-rose-600" />Open reports <span className="text-sm font-medium text-slate-500">({reports.length})</span></h2>
            <div className="mt-4 space-y-3">
              {reports.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No open reports.</p>}
              {reports.map((report) => (
                <article key={report.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 font-semibold"><Flag className="h-3.5 w-3.5 text-rose-600" />From {report.reporter_id ? names[report.reporter_id] ?? "member" : "a deleted account"}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">{report.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    About {report.reported_user_id ? names[report.reported_user_id] ?? report.reported_name ?? "member" : report.reported_name ? `${report.reported_name} (account deleted)` : "an unknown member"}
                  </p>
                  <p className="mt-2 text-slate-700">{report.reason}</p>
                  {report.message_excerpt && <blockquote className="mt-2 whitespace-pre-line border-l-2 border-rose-200 pl-3 text-slate-600">{report.message_excerpt}</blockquote>}
                  <div className="mt-3 flex gap-2">
                    {report.status === "open" && <button type="button" onClick={() => void act(`/api/moderation/reports/${report.id}`, { status: "reviewing" })} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Mark reviewing</button>}
                    <button type="button" onClick={() => void act(`/api/moderation/reports/${report.id}`, { status: "resolved" })} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Resolve</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
