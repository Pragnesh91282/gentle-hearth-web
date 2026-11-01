import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-sand-50 px-5 py-20 text-center text-slate-900">
      <div className="max-w-sm">
        <Logo className="mx-auto h-14 w-14" />
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-leaf-900">This page isn&apos;t here</h1>
        <p className="mt-3 leading-7 text-slate-600">
          The link may be old, or the page may have moved. Take a breath; everything else is where you left it.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/" className="rounded-full bg-leaf-700 px-6 py-3.5 font-semibold text-white hover:bg-leaf-800">Go to the home page</Link>
          <Link href="/patients" className="rounded-full border border-sand-200 bg-white px-6 py-3.5 font-semibold text-leaf-800 hover:border-leaf-700">Share what&apos;s on your mind</Link>
        </div>
      </div>
    </main>
  );
}
