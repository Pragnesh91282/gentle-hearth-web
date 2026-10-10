"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { turnOffNotificationsOnThisDevice } from "@/components/NotificationToggle";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMember } from "@/lib/useMember";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const member = useMember();
  const role = member.profile?.role;

  const links = [
    { href: "/patients", label: "Get support" },
    { href: "/doctors", label: "Guides" },
    ...(member.status === "signed-in" ? [] : [{ href: "/doctors/apply", label: "Become a guide" }]),
    ...(member.status === "signed-in" ? [{ href: "/inbox", label: "Inbox" }] : []),
    ...(role === "moderator" ? [{ href: "/moderation", label: "Moderation" }] : []),
    ...(member.status === "signed-in" ? [{ href: "/account", label: "Account" }] : []),
  ];

  async function signOut() {
    // A shared phone should stop showing this member's notifications.
    await turnOffNotificationsOnThisDevice();
    await createSupabaseBrowserClient()?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sand-200/70 bg-sand-50/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        {/* In the app, the logo leads to the app home; on the website, to the home page. */}
        <Link href="/" className="flex items-center gap-3 app:hidden">
          <Logo />
          <span className="font-display text-xl font-semibold tracking-tight text-leaf-900">Thehrav</span>
        </Link>
        <Link href="/app" className="hidden items-center gap-3 app:flex">
          <Logo />
          <span className="font-display text-xl font-semibold tracking-tight text-leaf-900">Thehrav</span>
        </Link>

        {/* The app has a bottom tab bar instead. */}
        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm font-medium text-slate-600 sm:order-none sm:w-auto app:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-2.5 py-1.5 transition sm:px-3 hover:text-leaf-700 ${pathname === link.href ? "bg-sand-100 text-leaf-800" : ""}`}
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
            <Link href="/auth" className="rounded-full bg-leaf-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-leaf-800">
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
