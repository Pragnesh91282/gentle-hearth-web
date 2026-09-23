import {
  ArrowRight,
  CalendarCheck2,
  HeartHandshake,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TimerReset,
  Users,
} from "lucide-react";
import Link from "next/link";

const supportAreas = [
  {
    icon: MessageSquareHeart,
    title: "Ask without pressure",
    description:
      "People can share their worries in a calm, private space and receive thoughtful guidance at their own pace.",
  },
  {
    icon: Stethoscope,
    title: "Affordable care",
    description:
      "Doctors and mental health professionals can offer low-cost or free support, check-ins, and gentle guidance.",
  },
  {
    icon: HeartHandshake,
    title: "Support that feels human",
    description:
      "No demanding scripts, no guilt, no pressure—just respectful, compassionate conversations and next steps.",
  },
];

const howItWorks = [
  "Share what feels heavy or confusing.",
  "Choose a guidance path that feels safe and comfortable.",
  "Receive grounded advice from supportive professionals.",
];

const communityQuestions = [
  {
    title: "Burnout and exhaustion",
    summary: "I feel drained all the time and don't know how to rest without guilt.",
  },
  {
    title: "Anxiety and overthinking",
    summary: "My thoughts spiral at night, and I need help finding calmer routines.",
  },
  {
    title: "Relationship stress",
    summary: "I want support in understanding conflict without feeling judged or rushed.",
  },
];

const doctorSupport = [
  "Offer general guidance and emotional support.",
  "Answer questions in a respectful, nonjudgmental way.",
  "Create a more accessible entry point for people who need care.",
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7fbf8,_#eef6f2_35%,_#f8fafc_100%)] text-slate-900">
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" />
            Calm, affordable support
          </div>

          <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Support that feels safe, kind, and accessible.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Gentle Hearth connects people who need mental health support with doctors and compassionate helpers
            who offer guidance at low cost or even free. No pressure. No shame. Just a respectful place to ask,
            listen, and heal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/patients"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-800"
            >
              Ask for support
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/doctors/apply"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              I want to help
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-left">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p className="text-2xl font-bold text-emerald-700">24/7</p>
              <p className="mt-1 text-xs text-slate-600">Gentle check-ins</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p className="text-2xl font-bold text-emerald-700">Free</p>
              <p className="mt-1 text-xs text-slate-600">or low-cost care</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p className="text-2xl font-bold text-emerald-700">0</p>
              <p className="mt-1 text-xs text-slate-600">Pressure, guilt, rush</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-emerald-200/60 blur-3xl" />
          <div className="absolute -right-6 bottom-6 h-44 w-44 rounded-full bg-teal-200/60 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_25px_80px_rgba(16,185,129,0.12)]">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Today&apos;s gentle check-in</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">What feels heavy today?</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <HeartHandshake className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Users className="h-4 w-4 text-emerald-600" />
                    Support request
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    “I feel exhausted and overwhelmed. I need guidance that helps me breathe and reset without feeling judged.”
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Stethoscope className="h-4 w-4 text-emerald-600" />
                    Doctor response
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    “You don&apos;t have to carry this alone. Let&apos;s focus on small, manageable steps and a practical reset plan.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-5 py-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Why this exists</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Mental support should feel welcoming, not intimidating.</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {supportAreas.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900">{title}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-xl md:p-10">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">How it works</p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight">Simple steps to feel supported.</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-700 bg-white/5 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-200">
                  0{index + 1}
                </div>
                <p className="text-base leading-7 text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="support" className="mx-auto max-w-6xl px-5 py-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Support spaces</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Common questions people bring to the community</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {communityQuestions.map((item) => (
            <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MessageSquareHeart className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900">{item.title}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="doctors" className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-8 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm md:grid-cols-[1fr_0.9fr] md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">For doctors and guides</p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">You can help without pressure or overload.</h3>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Gentle Hearth makes it easier for qualified professionals to share calm guidance, answer questions, and offer support
              in a low-pressure, compassionate environment.
            </p>

            <ul className="mt-6 space-y-3">
              {doctorSupport.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="text-sm leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">Doctor availability</h4>
              <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <CalendarCheck2 className="h-3.5 w-3.5" />
                Flexible hours
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">Dr. Aisha</p>
                  <span className="text-xs font-medium text-emerald-700">Available this week</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Guidance for stress, sleep, and emotional overwhelm.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">Dr. Nikhil</p>
                  <span className="text-xs font-medium text-emerald-700">Volunteer hours</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Low-cost consultations and listening support for anxiety.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="join" className="mx-auto max-w-5xl px-5 py-10 pb-20">
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-700 px-8 py-10 text-center text-white shadow-lg md:px-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
            🌱
          </div>
          <h3 className="mt-5 text-3xl font-bold tracking-tight">A calmer place to begin.</h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-emerald-50">
            Whether you need support or want to help others, Gentle Hearth is built for gentle conversations, respectful care,
            and real human connection.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/patients" className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-50">
              Ask for support
            </Link>
            <Link href="/doctors/apply" className="rounded-full border border-white/50 px-6 py-3 font-semibold text-white transition hover:bg-white/5">
              Offer guidance
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-sm text-slate-600">
          <p>Gentle Hearth</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-emerald-700">Privacy</Link>
            <Link href="/terms" className="hover:text-emerald-700">Terms</Link>
            <TimerReset className="h-4 w-4 text-emerald-600" />
            <span>Support without pressure</span>
          </div>
        </div>
      </footer>
    </main>
  );
}