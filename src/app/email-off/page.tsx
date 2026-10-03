import Link from "next/link";

export default function EmailOffPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <article className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="text-sm font-semibold text-emerald-700">Thehrav</Link>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Emails turned off</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          You won&apos;t get emails about new messages any more. Your conversations are still waiting in your inbox, and you can turn emails back on from your <Link className="underline" href="/account">account page</Link>.
        </p>
      </article>
    </main>
  );
}
