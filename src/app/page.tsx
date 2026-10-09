import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Ear,
  HandHeart,
  Hourglass,
  IndianRupee,
  Lock,
  Mail,
  MessagesSquare,
  PenLine,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import InstallApp from "@/components/InstallApp";
import { GUIDE_TYPES, type GuideType } from "@/lib/guides";
import { BELIEF_NOTE, PRINCIPLES } from "@/lib/principles";
import { CRISIS_LINES } from "@/lib/safetyAndIdentity";

// Situations people recognise themselves in, in their own words.
const carrying = [
  "Exam or career pressure",
  "Expectations at home",
  "Lonely in a new city",
  "Overthinking at night",
  "Burnt out from work",
  "A relationship that hurts",
  "Grief or loss",
  "Just heavy, not sure why",
];

const steps = [
  { icon: PenLine, title: "Write it down", text: "Share what feels heavy, in your own words. No forms, no labels, no real name needed." },
  { icon: UserRoundCheck, title: "A guide picks it up", text: "A verified listener, psychologist or doctor reads it and starts a private conversation with you." },
  { icon: MessagesSquare, title: "Talk at your own pace", text: "Reply whenever you're ready. We email you when there's a new message, never with what was said." },
];

const promises = [
  { icon: IndianRupee, title: "Free", text: "No fees, no subscriptions, no catch. Every guide gives their time freely." },
  { icon: Lock, title: "Anonymous", text: "Use any name you like. Guides never see your email." },
  { icon: BadgeCheck, title: "Verified", text: "Doctors are checked on the NMC register and psychologists on RCI's. Every listener is reviewed." },
  { icon: Hourglass, title: "Unhurried", text: "No timers and no pressure to reply. Take a pause whenever you need one." },
];

const helperReasons = [
  { icon: Clock, title: "Your time, your pace", text: "Choose which requests to take, and reply when it suits you. Even an hour a week helps." },
  { icon: HandHeart, title: "Reach people clinics don't", text: "Many members can't afford therapy, or aren't ready to walk into a clinic. You may be their first step." },
  { icon: ShieldCheck, title: "Clear roles and limits", text: "Listeners support, professionals guide, and nobody prescribes over chat. Moderators have your back." },
  { icon: BadgeCheck, title: "Recognised for it", text: "Registered professionals get a verified profile. Students can ask for a letter of their volunteer hours." },
];

const roleIcons: Record<GuideType, typeof Ear> = { doctor: ShieldCheck, psychologist: BadgeCheck, listener: Ear };
const roleWho: Record<GuideType, string> = {
  doctor: "MBBS and above, registered with the NMC or a State Medical Council",
  psychologist: "Clinical psychologists with an RCI registration (CRR number)",
  listener: "Counsellors, psychology students and trained peer-support volunteers",
};

export default function Page() {
  return (
    <main className="bg-sand-50 text-slate-900">
      {/* Hero: for people who need to talk */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-marigold-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-64 h-80 w-80 rounded-full bg-leaf-700/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-14 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pb-28 md:pt-20">
          <div>
            <p className="inline-flex items-center gap-3 rounded-full border border-sand-200 bg-white/70 px-4 py-1.5 text-sm text-leaf-800">
              <span lang="hi" className="font-devanagari text-lg leading-none">ठहराव</span>
              <span className="text-slate-400">·</span>
              <span>thehrav, “a pause”</span>
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-leaf-900 sm:text-6xl">
              Take a pause.
              <span className="block text-marigold-600">Someone is here to listen.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Write what&apos;s on your mind, in your own words. A verified listener, psychologist or doctor will reply gently, in their own time. Free, and anonymous if you like.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/patients" className="inline-flex items-center justify-center gap-2 rounded-full bg-leaf-700 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-leaf-900/15 transition hover:bg-leaf-800">
                Share what&apos;s on your mind
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#for-professionals" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold text-leaf-800 transition hover:bg-sand-100">
                I&apos;m a professional who wants to help
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              {["Always free", "Use any name", "Verified guides", "No rush"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-marigold-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* A slow breathing circle, with an example of how a conversation feels */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative flex aspect-square items-center justify-center">
              <div className="breathe absolute inset-0 rounded-full bg-gradient-to-br from-marigold-400/40 to-leaf-700/25" />
              <div className="absolute inset-10 rounded-full bg-sand-50/80" />
              <p className="relative text-center font-display text-xl italic text-leaf-800">
                breathe in…
                <span className="block">and out</span>
              </p>
            </div>
            <figure className="relative -mt-16 ml-auto w-[85%] rounded-3xl border border-sand-200 bg-white p-5 shadow-xl shadow-leaf-900/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Example</p>
              <blockquote className="mt-2 text-sm leading-6 text-slate-700">“I&apos;m so tired of pretending I&apos;m fine at home.”</blockquote>
              <p className="mt-3 rounded-2xl bg-sand-100 p-3 text-sm leading-6 text-leaf-900">
                That sounds exhausting to carry alone. You don&apos;t have to pretend here. What&apos;s been hardest lately?
              </p>
            </figure>
          </div>
        </div>
      </section>

      {/* What people bring */}
      <section className="border-y border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-leaf-900 sm:text-4xl">Whatever you&apos;re carrying, it&apos;s welcome here.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">Big or small, new or years old. You don&apos;t need the right words or a diagnosis to start.</p>
          <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
            {carrying.map((item) => (
              <li key={item}>
                <Link href="/patients" className="block rounded-full border border-sand-200 bg-sand-50 px-5 py-2.5 text-sm text-slate-700 transition hover:border-marigold-400 hover:bg-white hover:text-leaf-900">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-leaf-900 sm:text-4xl">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="relative">
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl font-semibold text-marigold-400">{index + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-700/10 text-leaf-700"><Icon className="h-5 w-5" /></span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-leaf-900">{title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Promises */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 rounded-[2rem] bg-sand-100 p-6 sm:grid-cols-2 md:p-10 lg:grid-cols-4">
          {promises.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl bg-white p-6">
              <Icon className="h-6 w-6 text-marigold-600" />
              <h3 className="mt-4 font-display text-2xl font-semibold text-leaf-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principles of compassion, in everyday words */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-marigold-600">Our principles</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-leaf-900 sm:text-4xl">Built on compassion</h2>
            <p className="mt-4 leading-7 text-slate-600">{BELIEF_NOTE}</p>
            <Link href="/principles" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-leaf-700 hover:underline">
              Read all our principles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.slice(0, 4).map((principle) => (
              <li key={principle.title} className="rounded-3xl border border-sand-200 bg-white p-6">
                <h3 className="font-display text-xl font-semibold text-leaf-900">{principle.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{principle.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* For professionals */}
      <section id="for-professionals" className="scroll-mt-20 bg-leaf-900 text-sand-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-marigold-400">For psychologists, doctors and trained listeners</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Give an hour when you can. It may be the reply someone has been waiting for.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-sand-100/80">
              Thehrav connects your care with people across India who need someone to talk to. Give freely, without expecting anything back, and meet each person with the same goodwill, whoever they are.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {helperReasons.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <Icon className="h-5 w-5 text-marigold-400" />
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-sand-100/70">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/doctors/apply" className="inline-flex items-center justify-center gap-2 rounded-full bg-marigold-400 px-7 py-4 font-semibold text-leaf-900 transition hover:bg-marigold-500">
                Become a guide
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/doctors" className="inline-flex items-center justify-center rounded-full border border-sand-50/25 px-7 py-4 font-semibold text-sand-50 transition hover:bg-white/5">
                Meet our guides
              </Link>
            </div>
          </div>

          <div className="self-center rounded-[2rem] bg-white/5 p-6 ring-1 ring-white/10 md:p-8">
            <h3 className="font-display text-2xl font-semibold">Who can join</h3>
            <ul className="mt-6 space-y-4">
              {(Object.keys(GUIDE_TYPES) as GuideType[]).map((type) => {
                const Icon = roleIcons[type];
                return (
                  <li key={type} className="flex gap-4 rounded-2xl bg-white/5 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-marigold-400/15 text-marigold-400"><Icon className="h-5 w-5" /></span>
                    <div>
                      <p className="font-semibold">{GUIDE_TYPES[type].label}</p>
                      <p className="mt-1 text-sm leading-6 text-sand-100/70">{roleWho[type]}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-sand-100/70">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              Every application is reviewed by a moderator, and registrations are checked on the official register.
            </p>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p lang="hi" className="font-devanagari text-4xl text-marigold-600">ठहराव</p>
        <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-leaf-900 sm:text-5xl">Whenever you&apos;re ready, we&apos;re here.</h2>
        <p className="mt-4 text-lg text-slate-600">No hurry. Write a few lines, or a lot. Someone will read every word.</p>
        <Link href="/patients" className="mt-8 inline-flex items-center gap-2 rounded-full bg-leaf-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-leaf-900/15 transition hover:bg-leaf-800">
          Share what&apos;s on your mind
          <ArrowRight className="h-4 w-4" />
        </Link>
        <InstallApp />
        <p className="mx-auto mt-10 max-w-xl rounded-2xl bg-sand-100 px-5 py-4 text-sm leading-6 text-slate-600">
          Thehrav isn&apos;t for emergencies. If you might hurt yourself or you&apos;re in danger: {CRISIS_LINES}
        </p>
      </section>

      <footer className="border-t border-sand-200 bg-white app:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-display font-semibold text-leaf-900">Thehrav</span>
            <span className="text-slate-400"> · a quiet place to be heard</span>
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/pause" className="hover:text-leaf-700">Take a pause</Link>
            <Link href="/principles" className="hover:text-leaf-700">Our principles</Link>
            <Link href="/doctors/apply" className="hover:text-leaf-700">Become a guide</Link>
            <Link href="/privacy" className="hover:text-leaf-700">Privacy</Link>
            <Link href="/terms" className="hover:text-leaf-700">Terms</Link>
            <Link href="/grievance" className="hover:text-leaf-700">Grievances</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
