"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

// Breathe in for 4 seconds and out for 6: a longer out-breath helps the body settle.
const IN_MS = 4000;
const OUT_MS = 6000;
const CYCLE_MS = IN_MS + OUT_MS;
const LENGTHS = [1, 3, 5];

type Stage = "idle" | "running" | "done";

function formatTime(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function BreathingExercise() {
  const [minutes, setMinutes] = useState(3);
  const [stage, setStage] = useState<Stage>("idle");
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  useEffect(() => {
    if (stage !== "running") return;
    const total = minutes * 60_000;
    const timer = setInterval(() => {
      const now = Date.now() - startedAt.current;
      if (now >= total) {
        setStage("done");
        setElapsed(total);
      } else {
        setElapsed(now);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [stage, minutes]);

  function start() {
    startedAt.current = Date.now();
    setElapsed(0);
    setStage("running");
  }

  const breathingIn = stage === "running" && elapsed % CYCLE_MS < IN_MS;
  const remaining = minutes * 60_000 - elapsed;

  return (
    <main className="flex flex-1 flex-col items-center bg-sand-50 px-5 py-10 text-center text-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-marigold-600">Take a pause</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-leaf-900 sm:text-4xl">
        {stage === "done" ? "Well done." : "Breathe with the circle"}
      </h1>

      <div className="relative my-10 flex h-72 w-72 items-center justify-center" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-sand-100" />
        <div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-marigold-400/50 to-leaf-700/35 motion-reduce:!transition-none"
          style={{
            transform: `scale(${stage === "running" ? (breathingIn ? 1 : 0.55) : 0.7})`,
            transition: `transform ${breathingIn ? IN_MS : OUT_MS}ms ease-in-out`,
          }}
        />
        {stage === "done" ? (
          <Leaf className="relative h-12 w-12 text-leaf-700" />
        ) : (
          <p className="relative font-display text-2xl italic text-leaf-900">
            {stage === "running" ? (breathingIn ? "Breathe in…" : "and out…") : "Ready when you are"}
          </p>
        )}
      </div>

      {/* Announced once per phase for screen readers. */}
      <p className="sr-only" aria-live="polite">{stage === "running" ? (breathingIn ? "Breathe in" : "Breathe out") : ""}</p>

      {stage === "idle" && (
        <div className="w-full max-w-xs">
          <p className="text-sm text-slate-600">In for 4 seconds, out for 6. How long would you like?</p>
          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Length">
            {LENGTHS.map((length) => (
              <button
                key={length}
                type="button"
                role="radio"
                aria-checked={minutes === length}
                onClick={() => setMinutes(length)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${minutes === length ? "border-leaf-700 bg-leaf-700 text-white" : "border-sand-200 bg-white text-slate-700 hover:border-leaf-700"}`}
              >
                {length} min
              </button>
            ))}
          </div>
          <button type="button" onClick={start} className="mt-6 w-full rounded-full bg-leaf-700 px-6 py-4 font-semibold text-white shadow-lg shadow-leaf-900/15 hover:bg-leaf-800">
            Begin
          </button>
        </div>
      )}

      {stage === "running" && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-mono text-lg text-slate-600" aria-label="Time left">{formatTime(remaining)}</p>
          <button type="button" onClick={() => setStage("idle")} className="rounded-full border border-sand-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300">
            Stop
          </button>
        </div>
      )}

      {stage === "done" && (
        <div className="w-full max-w-sm">
          <p className="leading-7 text-slate-700">Take a moment to notice how you feel now. Whatever it is, you gave yourself a little kindness.</p>
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" onClick={start} className="rounded-full bg-leaf-700 px-6 py-3.5 font-semibold text-white hover:bg-leaf-800">Breathe again</button>
            <Link href="/ground" className="rounded-full border border-sand-200 bg-white px-6 py-3.5 font-semibold text-leaf-800 hover:border-leaf-700">Try a grounding exercise</Link>
            <Link href="/patients" className="px-6 py-2 text-sm font-semibold text-leaf-700 hover:underline">Share what&apos;s on your mind</Link>
          </div>
        </div>
      )}

      <p className="mt-auto max-w-sm pt-12 text-xs leading-5 text-slate-500">
        Not for emergencies. If you might hurt yourself, call Tele-MANAS on 14416 (free, 24/7) or 112.
      </p>
    </main>
  );
}
