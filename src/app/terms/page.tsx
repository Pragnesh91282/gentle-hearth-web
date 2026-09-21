import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="text-sm font-semibold text-emerald-700">Gentle Hearth</Link>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Community terms</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section><h2 className="text-lg font-bold">Not emergency care</h2><p className="mt-2">Gentle Hearth is not an emergency service, crisis line, diagnostic service, or substitute for a licensed treatment plan. If you may hurt yourself or someone else, contact local emergency services immediately. In the US, call or text 988.</p></section>
          <section><h2 className="text-lg font-bold">Respect and boundaries</h2><p className="mt-2">Do not harass, threaten, impersonate a professional, share another person&apos;s private information, or make promises about medical outcomes. Members can report and block others.</p></section>
          <section><h2 className="text-lg font-bold">Professional participation</h2><p className="mt-2">Doctors must provide accurate credentials and wait for verification before offering professional guidance. Responses should be general, careful, and clear about their limits.</p></section>
        </div>
      </article>
    </main>
  );
}
