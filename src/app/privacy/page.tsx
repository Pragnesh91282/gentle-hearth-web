import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="text-sm font-semibold text-emerald-700">Thehrav</Link>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Privacy notice</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">What you share here is about your mental health, and we treat it that way. We collect only what we need to run the service.</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section><h2 className="text-lg font-bold">What we collect</h2><p className="mt-2">Your email, display name, and your confirmation that you are 18 or older; the support requests and messages you send; for guides, their qualifications and, for doctors and psychologists, their registered name and registration number, which patients can see; and reports and blocks.</p></section>
          <section><h2 className="text-lg font-bold">Who can see it</h2><p className="mt-2">A support request is visible to you and to verified guides until one of them accepts it. After that, the conversation is visible only to you and that guide. If a message is reported, moderators see that message and the reason for the report, not the rest of the conversation.</p></section>
          <section><h2 className="text-lg font-bold">How we use it</h2><p className="mt-2">To connect you with support, keep conversations private, prevent abuse, verify guides, and respond to reports. We do not sell your data or use it for advertising. General guidance here is not a diagnosis or treatment.</p></section>
          <section><h2 className="text-lg font-bold">Your choices</h2><p className="mt-2">You can withdraw a request, close a conversation, report or block another member, and permanently delete your account and everything linked to it from your <Link className="underline" href="/account">account page</Link> (<Link className="underline" href="/delete-account">how to delete your account</Link>). Reports are the exception: a report, the reported message, and the name of the member it was about are kept after either account is deleted, so we can handle complaints and meet our legal duties.</p></section>
          <section><h2 className="text-lg font-bold">Questions and complaints</h2><p className="mt-2">Contact our <Link className="underline" href="/grievance">Grievance Officer</Link>. Do not use this service for emergencies; call 112, or Tele-MANAS on 14416 for free mental-health support.</p></section>
        </div>
      </article>
    </main>
  );
}
