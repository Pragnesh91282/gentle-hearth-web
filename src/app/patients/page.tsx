"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartHandshake, MessageSquareHeart, ShieldCheck } from "lucide-react";
import CrisisResources from "@/components/CrisisResources";
import { SUPPORT_OPTIONS } from "@/lib/safetyAndIdentity";

const exampleConcerns = [
  "I feel overwhelmed and exhausted after work.",
  "I keep overthinking and feel anxious at night.",
  "I need a safe space to talk without pressure.",
];

export default function PatientsPage() {
  const [selectedSupport, setSelectedSupport] = useState("I need someone to listen");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consented, setConsented] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    setError("");
    setNeedsSignIn(false);
    setCrisisMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supportType: selectedSupport, message, consented }),
      });
      const result = await response.json();

      if (!response.ok) {
        setNeedsSignIn(response.status === 401);
        setError(response.status === 401 ? "Please sign in so a guide can reply to you privately. Your message is still here." : result.error ?? "We could not send your request. Please try again.");
        return;
      }

      setMessage("");
      setSubmitted(true);
      setCrisisMessage(result.crisisMessage ?? "");
    } catch {
      setError("We could not reach the support service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f4faf6,_#eef8f3_28%,_#f8fafc_100%)] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.08)]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
              <HeartHandshake className="h-3.5 w-3.5" />
              For people seeking support
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900">Tell us what feels heavy right now.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              You are not asking for too much. Share a little about what you are carrying, and we will match you with a supportive doctor or guide who can respond gently and without pressure.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">What kind of support do you need?</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {SUPPORT_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setSelectedSupport(option)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                        selectedSupport === option
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">What would you like to share?</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  required
                  maxLength={2000}
                  placeholder="I feel overwhelmed and need help building a calmer routine."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-emerald-300 focus:bg-white"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">Example concerns</p>
                <div className="flex flex-wrap gap-2">
                  {exampleConcerns.map((concern) => (
                    <button
                      type="button"
                      key={concern}
                      onClick={() => setMessage(concern)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} className="mt-1 h-4 w-4 accent-emerald-700" required />
                <span>I understand this is a peer-support pathway, not emergency care, diagnosis, or a replacement for a licensed treatment plan.</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending request..." : "Send to a supportive guide"}
              </button>
            </form>

            {error && (
              <div className="mt-6 whitespace-pre-line rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                {error}
                {needsSignIn && <Link href="/auth?next=/patients" className="mt-3 block font-semibold text-rose-900 underline">Sign in or create an account</Link>}
              </div>
            )}

            {crisisMessage && <div className="mt-6"><CrisisResources message={crisisMessage} /></div>}

            {submitted && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Your request was sent. Verified guides see it right away, and you&apos;ll get a live notification in your inbox when one of them replies.
                <Link href="/inbox" className="mt-3 inline-flex font-semibold text-emerald-800 underline">Open your live inbox</Link>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
                  <MessageSquareHeart className="h-5 w-5" />
                </div>
                <p className="text-lg font-semibold">What you can expect</p>
              </div>

              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> Respectful listening with no pressure</li>
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> Affordable or free guidance options</li>
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> A calm, nonjudgmental environment</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Need immediate help?</p>
              <p className="mt-4 text-base leading-7 text-slate-700">
                If you are in crisis or feel unsafe, call or text 988 for free, confidential support right away.
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-500">Outside the US, contact your local emergency number or visit findahelpline.com for country-specific crisis resources.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
