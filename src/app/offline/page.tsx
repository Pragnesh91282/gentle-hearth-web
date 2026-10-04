import Logo from "@/components/Logo";

// Shown by the service worker (public/sw.js) when the app opens without a connection.
export default function OfflinePage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-sand-50 px-5 py-20 text-center">
      <div className="max-w-sm">
        <Logo className="mx-auto h-14 w-14" />
        <h1 className="mt-6 font-display text-3xl font-semibold text-leaf-900">You&apos;re offline</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Take a breath. Your conversations are safe, and they&apos;ll be here as soon as you&apos;re back online.
        </p>
        <p className="mt-6 rounded-2xl bg-sand-100 px-4 py-3 text-sm leading-6 text-slate-600">
          If you need help right now, call Tele-MANAS on 14416 (free, 24/7), or 112 in an emergency.
        </p>
      </div>
    </main>
  );
}
