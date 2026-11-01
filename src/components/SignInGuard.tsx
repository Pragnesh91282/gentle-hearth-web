"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMember } from "@/lib/useMember";

// Sends signed-out visitors on a private page to sign in, and back here after.
// The proxy does this for full page loads; this covers in-app navigation,
// which the proxy lets through (see src/proxy.ts).
export default function SignInGuard() {
  const member = useMember();
  const pathname = usePathname();
  const router = useRouter();
  const signedOut = member.status === "signed-out";

  useEffect(() => {
    if (signedOut) router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
  }, [signedOut, pathname, router]);

  if (!signedOut) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sand-50 text-sm text-slate-600" role="status">
      Taking you to sign in…
    </div>
  );
}
