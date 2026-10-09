"use client";

import { useState } from "react";
import Link from "next/link";
import { Ear, Eye, Hand, Leaf, Coffee, Wind } from "lucide-react";

// 5-4-3-2-1: noticing the senses brings attention back to the present.
// Nothing is typed or stored; each tap just marks one thing noticed.
const STEPS = [
  { count: 5, sense: "see", icon: Eye, hint: "A colour, a shape, light on a wall, something small you hadn't noticed." },
  { count: 4, sense: "touch", icon: Hand, hint: "Your feet on the floor, the fabric of your clothes, something cool or warm." },
  { count: 3, sense: "hear", icon: Ear, hint: "A fan, traffic, birds, your own breathing." },
  { count: 2, sense: "smell", icon: Wind, hint: "Tea, soap, the air outside. Or two smells you like, remembered." },
  { count: 1, sense: "taste", icon: Coffee, hint: "Whatever is in your mouth right now, or a sip of water." },
];

export default function GroundingExercise() {
  const [step, setStep] = useState(-1);
  const [noticed, setNoticed] = useState(0);

  const current = STEPS[step];
  const finished = step >= STEPS.length;

  function next() {
    setStep((value) => value + 1);
    setNoticed(0);
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-sand-50 px-5 py-10 text-center text-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-marigold-600">Ground yourself</p>

      {step === -1 && (
        <div className="mt-3 max-w-sm">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-leaf-900 sm:text-4xl">5, 4, 3, 2, 1</h1>
          <p className="mt-4 leading-7 text-slate-700">
            When thoughts are racing, your senses can bring you back to this moment. Go slowly. There&apos;s no right answer.
          </p>
          <button type="button" onClick={next} className="mt-8 w-full rounded-full bg-leaf-700 px-6 py-4 font-semibold text-white shadow-lg shadow-leaf-900/15 hover:bg-leaf-800">
            Begin
          </button>
        </div>
      )}

      {current && (
        <div className="mt-3 w-full max-w-sm">
          <p className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}</p>
          <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-sand-100 text-leaf-700">
            <current.icon className="h-9 w-9" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-leaf-900">
            {current.count} {current.count === 1 ? "thing" : "things"} you can {current.sense}
          </h1>
          <p className="mt-3 leading-7 text-slate-600">{current.hint}</p>

          <p className="mt-8 text-sm text-slate-600">Tap a circle for each one you notice.</p>
          <div className="mt-3 flex justify-center gap-3">
            {Array.from({ length: current.count }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Noticed ${index + 1}`}
                aria-pressed={index < noticed}
                onClick={() => setNoticed(Math.max(noticed, index + 1))}
                className={`h-11 w-11 rounded-full border-2 transition ${index < noticed ? "border-leaf-700 bg-leaf-700" : "border-sand-200 bg-white hover:border-leaf-700"}`}
              />
            ))}
          </div>

          <button type="button" onClick={next} className="mt-10 w-full rounded-full bg-leaf-700 px-6 py-4 font-semibold text-white hover:bg-leaf-800">
            {step === STEPS.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      )}

      {finished && (
        <div className="mt-3 max-w-sm">
          <Leaf className="mx-auto mt-4 h-12 w-12 text-leaf-700" />
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-leaf-900">You&apos;re here, right now.</h1>
          <p className="mt-4 leading-7 text-slate-700">That took care. If the feeling comes back, you can always come back to this.</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/pause" className="rounded-full bg-leaf-700 px-6 py-3.5 font-semibold text-white hover:bg-leaf-800">Take a breathing pause</Link>
            <button type="button" onClick={() => setStep(-1)} className="rounded-full border border-sand-200 bg-white px-6 py-3.5 font-semibold text-leaf-800 hover:border-leaf-700">Start again</button>
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
