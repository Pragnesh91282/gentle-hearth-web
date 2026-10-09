"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Feather, Home, Inbox, PenLine, UserRound } from "lucide-react";

const TABS = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/patients", label: "Talk", icon: PenLine },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/pause", label: "Pause", icon: Feather },
  { href: "/account", label: "Account", icon: UserRound },
];

// Bottom navigation, shown only inside the installed app.
export default function AppTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href === "/pause" && pathname === "/ground");

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-sand-200 bg-sand-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md app:block"
    >
      <ul className="mx-auto flex max-w-lg justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${active ? "text-leaf-800" : "text-slate-500 hover:text-leaf-700"}`}
              >
                <span className={`flex h-8 w-12 items-center justify-center rounded-full ${active ? "bg-sand-200" : ""}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
