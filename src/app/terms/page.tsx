import Link from "next/link";
import { CRISIS_LINES } from "@/lib/safetyAndIdentity";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="text-sm font-semibold text-emerald-700">Thehrav</Link>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Community terms</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section><h2 className="text-lg font-bold">Not emergency care</h2><p className="mt-2">Thehrav is not an emergency service, crisis line, diagnostic service, or substitute for a licensed treatment plan. If you may hurt yourself or someone else, contact local emergency services immediately. In India: {CRISIS_LINES}</p></section>
          <section><h2 className="text-lg font-bold">Adults only</h2><p className="mt-2">Thehrav is for people aged 18 or older. If you are under 18, please call Tele-MANAS on 14416 or talk to a trusted adult. Accounts found to belong to a minor will be closed.</p></section>
          <section><h2 className="text-lg font-bold">Respect and boundaries</h2><p className="mt-2">Do not harass, threaten, impersonate a professional, share another person&apos;s private information, or make promises about medical outcomes. Members can report and block others.</p></section>
          <section><h2 className="text-lg font-bold">Professional participation</h2><p className="mt-2">Guides join as a registered doctor (NMC or State Medical Council), a registered clinical psychologist (RCI), or a listener, and must wait for moderator verification. Registered doctors and psychologists are checked against the official register, and patients see their name and registration number. Every guide must stay within their role: listeners offer emotional support only; no guide may prescribe or change medicines over chat. Responses should be general, careful, and clear about their limits.</p></section>
          <section><h2 className="text-lg font-bold">Complaints</h2><p className="mt-2">Complaints about content or conduct go to our <Link className="underline" href="/grievance">Grievance Officer</Link>.</p></section>
        </div>
      </article>
    </main>
  );
}
