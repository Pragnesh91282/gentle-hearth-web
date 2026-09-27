import Link from "next/link";

// Required for intermediaries under India's IT (Intermediary Guidelines) Rules, 2021.
const officerName = process.env.GRIEVANCE_OFFICER_NAME;
const officerEmail = process.env.GRIEVANCE_OFFICER_EMAIL;

export default function GrievancePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="text-sm font-semibold text-emerald-700">Gentle Hearth</Link>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Grievance Officer</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          If you have a complaint about content, another member&apos;s conduct, a guide, or how we handle your personal data, contact our Grievance Officer.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            {officerName && officerEmail ? (
              <>
                <p className="font-semibold">{officerName}</p>
                <p><a className="text-emerald-700 underline" href={`mailto:${officerEmail}`}>{officerEmail}</a></p>
              </>
            ) : (
              <p className="text-amber-900">Grievance Officer details have not been configured yet.</p>
            )}
          </section>
          <section><h2 className="text-lg font-bold">What happens next</h2><p className="mt-2">We acknowledge every complaint within 24 hours and aim to resolve it within 15 days. Please include what happened, when, and any links or screenshots. For a problem inside a conversation, you can also use the report button there.</p></section>
          <section><h2 className="text-lg font-bold">Not for emergencies</h2><p className="mt-2">If you or someone else is in danger, call 112. For free mental-health support at any hour, call Tele-MANAS on 14416.</p></section>
        </div>
      </article>
    </main>
  );
}
