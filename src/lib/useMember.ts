"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import type { Profile } from "@/lib/types";

export type MemberState =
  | { status: "loading" | "unconfigured" | "signed-out"; profile: null }
  | { status: "signed-in"; profile: Profile };

// Tracks the signed-in member and their profile, following sign-in and
// sign-out events from any tab.
export function useMember(): MemberState {
  const [state, setState] = useState<MemberState>(() =>
    createSupabaseBrowserClient() ? { status: "loading", profile: null } : { status: "unconfigured", profile: null },
  );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;
    async function load() {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) {
        if (!cancelled) setState({ status: "signed-out", profile: null });
        return;
      }
      const { data } = await supabase!.from("profiles").select("id, display_name, role").eq("id", user.id).maybeSingle();
      if (!cancelled) {
        setState({ status: "signed-in", profile: (data as Profile | null) ?? { id: user.id, display_name: "Gentle Hearth member", role: "patient" } });
      }
    }

    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
