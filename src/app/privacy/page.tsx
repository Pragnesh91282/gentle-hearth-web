import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="text-sm font-semibold text-emerald-700">Gentle Hearth</Link>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Privacy notice</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">This demo is designed around data minimization. When connected, support requests and conversations are visible only to the patient, assigned verified doctor, and authorized moderators.</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section><h2 className="text-lg font-bold">What we collect</h2><p className="mt-2">Account details, support requests, messages, doctor verification information, reports, and safety-related records needed to operate the service.</p></section>
          <section><h2 className="text-lg font-bold">How we use it</h2><p className="mt-2">To connect people with support, protect private conversations, prevent abuse, verify professionals, and respond to safety reports. We do not present general guidance as diagnosis or treatment.</p></section>
          <section><h2 className="text-lg font-bold">Your choices</h2><p className="mt-2">You can close conversations, request account deletion, report harmful behavior, and block another member. Do not use this service for emergencies.</p></section>
        </div>
      </article>
    </main>
  );
}
