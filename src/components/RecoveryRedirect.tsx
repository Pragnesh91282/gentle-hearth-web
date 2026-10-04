"use client";

import { useEffect } from "react";

// Reset links sent from the Supabase dashboard land on the Site URL (the home
// page) with the tokens after the #. Send them on to the reset page.
export default function RecoveryRedirect() {
  useEffect(() => {
    const { pathname, hash } = window.location;
    if (pathname !== "/auth/reset" && /(^|[#&])type=recovery(&|$)/.test(hash)) {
      window.location.replace(`/auth/reset${hash}`);
    }
  }, []);
  return null;
}
