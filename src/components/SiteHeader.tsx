"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMember } from "@/lib/useMember";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const member = useMember();
  const role = member.profile?.role;

  const links = [
    { href: "/patients", label: "Get support" },
    { href: "/doctors", label: "Doctors" },
    ...(member.status === "signed-in" ? [{ href: "/inbox", label: "Inbox" }] : []),
    ...(role === "moderator" ? [{ href: "/moderation", label: "Moderation" }] : []),
  ];

  async function signOut() {
    await createSupabaseBrowserClient()?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-lg shadow-sm">🌿</span>
          <span className="text-lg font-semibold tracking-tight text-emerald-900">Gentle Hearth</span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm font-medium text-slate-600 sm:order-none sm:w-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 transition hover:text-emerald-700 ${pathname === link.href ? "bg-emerald-50 text-emerald-800" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {member.status === "signed-in" ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-slate-600 md:inline">{member.profile.display_name}</span>
              <button type="button" onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : member.status === "signed-out" ? (
            <Link href="/auth" className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
