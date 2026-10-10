"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Feather, Inbox, Leaf, PenLine, Sprout } from "lucide-react";
import NotificationToggle from "@/components/NotificationToggle";
import { PRINCIPLES } from "@/lib/principles";
import { useMember } from "@/lib/useMember";

function greetingFor(hour: number) {
  if (hour < 5) return "Still awake?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// The installed app's home screen (the manifest's start_url).
export default function AppHome() {
  const member = useMember();
  const [greeting, setGreeting] = useState("Welcome");
  const [principleIndex, setPrincipleIndex] = useState(0);

  // Time-based content is only known on the device, after it loads.
  useEffect(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the local time is only known on the device
    setGreeting(greetingFor(now.getHours()));
    setPrincipleIndex(dayOfYear % PRINCIPLES.length);
  }, []);

  const signedIn = member.status === "signed-in";
  const isGuide = signedIn && member.profile.role !== "patient";
  const principle = PRINCIPLES[principleIndex];

  return (
    <main className="flex-1 bg-sand-50 px-5 pb-10 pt-6 text-slate-900">
      <div className="mx-auto max-w-lg space-y-5">
        <header>
          <p className="text-sm text-slate-500">{greeting}{signedIn ? `, ${member.profile.display_name}` : ""}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-leaf-900">How are you, really?</h1>
        </header>

        <Link href="/patients" className="block rounded-3xl bg-leaf-800 p-6 text-sand-50 shadow-lg shadow-leaf-900/15 transition hover:bg-leaf-900">
          <PenLine className="h-6 w-6 text-marigold-400" />
          <p className="mt-4 font-display text-2xl font-semibold">What&apos;s on your mind?</p>
          <p className="mt-1 text-sm leading-6 text-sand-100/80">Write it in your own words. A verified guide will reply gently, in their own time.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-marigold-400">Share it <ArrowRight className="h-4 w-4" /></span>
        </Link>

        {isGuide && (
          <Link href="/inbox" className="flex items-center gap-4 rounded-3xl border border-sand-200 bg-white p-5 transition hover:border-leaf-700">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-leaf-700"><Sprout className="h-5 w-5" /></span>
            <span>
              <span className="block font-semibold text-leaf-900">Guide workspace</span>
              <span className="block text-sm text-slate-600">See open requests and your conversations.</span>
            </span>
          </Link>
        )}

        {signedIn ? (
          <Link href="/inbox" className="flex items-center gap-4 rounded-3xl border border-sand-200 bg-white p-5 transition hover:border-leaf-700">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-leaf-700"><Inbox className="h-5 w-5" /></span>
            <span>
              <span className="block font-semibold text-leaf-900">Your conversations</span>
              <span className="block text-sm text-slate-600">Replies arrive here, unhurried. We&apos;ll email you too.</span>
            </span>
          </Link>
        ) : member.status === "signed-out" ? (
          <div className="rounded-3xl border border-sand-200 bg-white p-5">
            <p className="font-semibold text-leaf-900">Keep your conversations in one place</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">A free account lets guides reply to you privately. Use any name you like.</p>
            <div className="mt-4 flex gap-2">
              <Link href="/auth?mode=sign-up&next=/app" className="rounded-full bg-leaf-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-800">Create account</Link>
              <Link href="/auth?next=/app" className="rounded-full border border-sand-200 px-5 py-2.5 text-sm font-semibold text-leaf-800 hover:border-leaf-700">Sign in</Link>
            </div>
          </div>
        ) : null}

        {signedIn && <NotificationToggle compact />}

        <section>
          <h2 className="px-1 text-sm font-semibold uppercase tracking-[0.18em] text-marigold-600">Take a pause</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link href="/pause" className="rounded-3xl border border-sand-200 bg-white p-5 transition hover:border-leaf-700">
              <Feather className="h-6 w-6 text-leaf-700" />
              <p className="mt-3 font-semibold text-leaf-900">Breathe</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">A gentle 1 to 5 minute breathing pause.</p>
            </Link>
            <Link href="/ground" className="rounded-3xl border border-sand-200 bg-white p-5 transition hover:border-leaf-700">
              <Leaf className="h-6 w-6 text-leaf-700" />
              <p className="mt-3 font-semibold text-leaf-900">Ground</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">5-4-3-2-1, for racing thoughts.</p>
            </Link>
          </div>
          <p className="mt-2 px-1 text-xs text-slate-500">Both work without internet.</p>
        </section>

        <section className="rounded-3xl bg-sand-100 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-marigold-600">Today&apos;s thought</p>
          <p className="mt-3 font-display text-2xl font-semibold text-leaf-900">{principle.title}</p>
          <p className="mt-2 leading-7 text-slate-700">{principle.text}</p>
          <Link href="/principles" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-leaf-700 hover:underline">All our principles <ArrowRight className="h-3.5 w-3.5" /></Link>
        </section>

        <p className="px-1 text-xs leading-5 text-slate-500">
          Thehrav isn&apos;t for emergencies. If you might hurt yourself or you&apos;re in danger, call Tele-MANAS on 14416 (free, 24/7) or 112.
        </p>
      </div>
    </main>
  );
}
