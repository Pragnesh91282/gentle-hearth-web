import Link from "next/link";

const officerEmail = process.env.GRIEVANCE_OFFICER_EMAIL;

// Public instructions for deleting a Thehrav account, as Google Play requires
// for apps that let people create accounts.
export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="text-sm font-semibold text-emerald-700">Thehrav</Link>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Delete your Thehrav account</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          You can delete your account at any time, from the website or the Thehrav app. Deletion is permanent and can&apos;t be undone.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold">Delete it yourself</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Sign in at <Link className="underline" href="/auth?next=/account">thehrav-thementalhealthsupport.com</Link>, or open the Thehrav app.</li>
              <li>Go to <Link className="underline" href="/account">Account</Link>.</li>
              <li>Under <span className="font-semibold">Delete my account</span>, type DELETE and confirm.</li>
            </ol>
            <p className="mt-2">Your account is deleted straight away.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold">Can&apos;t sign in?</h2>
            <p className="mt-2">
              Email {officerEmail ? <a className="underline" href={`mailto:${officerEmail}?subject=Delete my Thehrav account`}>{officerEmail}</a> : <Link className="underline" href="/grievance">our Grievance Officer</Link>} from the email address you signed up with, and ask us to delete your account. We reply within 24 hours and delete it within 15 days.
            </p>
            <p className="mt-2">
              Guides who have accepted requests should also contact us this way, so their conversations can be closed properly.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold">What is deleted</h2>
            <p className="mt-2">Your account, email address, display name, support requests, and conversations, including every message in them. For guides, your guide profile and registration details are deleted too.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold">What is kept</h2>
            <p className="mt-2">
              Reports about conduct are kept after an account is deleted: the report, the reported message, and the name of the member it was about. We keep them so we can handle complaints and meet our legal duties. See our <Link className="underline" href="/privacy">privacy notice</Link>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
