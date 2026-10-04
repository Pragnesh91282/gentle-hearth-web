"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Stage = "checking" | "ready" | "invalid" | "saving" | "done";

// Where password reset links land. Links sent from the app carry a ?code the
// Supabase client exchanges itself; links sent from the Supabase dashboard
// carry tokens after the # instead, which are applied here.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing to check without Supabase
      setStage("invalid");
      return;
    }

    let cancelled = false;
    const hash = new URLSearchParams(window.location.hash.slice(1));

    async function prepare() {
      if (hash.get("error_description")) {
        if (!cancelled) setStage("invalid");
        return;
      }
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase!.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        // Keep the tokens out of the address bar and browser history.
        window.history.replaceState(null, "", window.location.pathname);
        if (!cancelled) setStage(sessionError ? "invalid" : "ready");
        return;
      }
      const { data: { session } } = await supabase!.auth.getSession();
      if (!cancelled) setStage(session ? "ready" : "invalid");
    }

    // A ?code link is exchanged by the client as it starts; wait for that event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && !cancelled) setStage("ready");
    });
    void prepare();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    setStage("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setStage("ready");
      return;
    }
    setStage("done");
    setTimeout(() => {
      router.push("/inbox");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-sand-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-md">
        <section className="rounded-[2rem] border border-sand-200 bg-white p-8 shadow-xl shadow-leaf-900/5">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100 text-leaf-700">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-leaf-900">Choose a new password</h1>

          {stage === "checking" && <p className="mt-4 text-sm text-slate-600">Checking your reset link…</p>}

          {stage === "invalid" && (
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>This reset link has expired or has already been used. Links work once, for a limited time.</p>
              <Link href="/auth?mode=reset" className="inline-flex rounded-full bg-leaf-700 px-5 py-2.5 font-semibold text-white hover:bg-leaf-800">Send a new link</Link>
            </div>
          )}

          {(stage === "ready" || stage === "saving") && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-slate-700">New password</label>
                <input id="new-password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="field" autoComplete="new-password" />
                <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">Type it again</label>
                <input id="confirm-password" type="password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} className="field" autoComplete="new-password" />
              </div>
              <button type="submit" disabled={stage === "saving"} className="w-full rounded-full bg-leaf-700 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-leaf-800 disabled:cursor-not-allowed disabled:opacity-60">
                {stage === "saving" ? "Saving…" : "Save new password"}
              </button>
              {error && <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
            </form>
          )}

          {stage === "done" && (
            <p role="status" className="mt-4 rounded-2xl bg-sand-100 p-4 text-sm text-leaf-900">Your password has been changed. Taking you to your inbox…</p>
          )}
        </section>
      </div>
    </main>
  );
}
