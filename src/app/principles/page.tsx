import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BELIEF_NOTE, PRINCIPLES } from "@/lib/principles";

export const metadata = {
  title: "Our principles | Thehrav",
  description: "The principles of compassion behind Thehrav, for people of every faith or none.",
};

export default function PrinciplesPage() {
  return (
    <main className="bg-sand-50 px-5 py-14 text-slate-900">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-marigold-600">Our principles</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-leaf-900 sm:text-5xl">
          Built on compassion
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          Everything on Thehrav, from how guides reply to how unhurried it all feels, rests on a few simple ideas about compassion.
        </p>

        <p className="mt-6 rounded-2xl border border-sand-200 bg-white px-5 py-4 leading-7 text-leaf-900">{BELIEF_NOTE}</p>

        <ol className="mt-10 space-y-5">
          {PRINCIPLES.map((principle, index) => (
            <li key={principle.title} className="rounded-3xl border border-sand-200 bg-white p-6">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-3xl font-semibold text-marigold-500">{index + 1}</span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-leaf-900">{principle.title}</h2>
                  <p className="mt-2 leading-7 text-slate-700">{principle.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-14 rounded-3xl bg-sand-100 p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold text-leaf-900">Where these ideas come from</h2>
          <p className="mt-3 leading-7 text-slate-700">
            These principles are inspired by compassion: goodwill towards everyone, equal regard, kindness to yourself, steadiness, and giving freely. They belong to no single religion, and you don&apos;t need to share any belief to be welcome here.
          </p>
        </section>

        <div className="mt-12 text-center">
          <Link href="/patients" className="inline-flex items-center gap-2 rounded-full bg-leaf-700 px-7 py-4 font-semibold text-white shadow-lg shadow-leaf-900/15 transition hover:bg-leaf-800">
            Share what&apos;s on your mind
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </main>
  );
}
