"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import Turnstile, { TURNSTILE_SITE_KEY } from "@/components/Turnstile";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMember } from "@/lib/useMember";

// Only follow same-site paths so the link cannot redirect off-site.
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && /^\/(?![/\\])/.test(next) ? next : "/inbox";
}

export default function AuthPage() {
  const router = useRouter();
  const member = useMember();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const needsCaptcha = Boolean(TURNSTILE_SITE_KEY) && !captchaToken;

  // Covers returning from an email confirmation link, which signs the user in.
  useEffect(() => {
    if (member.status === "signed-in") router.replace(nextPath());
  }, [member.status, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (needsCaptcha) {
      setError("Please complete the quick security check first.");
      return;
    }
    if (mode === "sign-up" && !isAdult) {
      setError("Gentle Hearth is for people aged 18 or older. If you need help now, call Tele-MANAS on 14416.");
      return;
    }
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication is not configured yet. Add the Supabase environment variables first.");
      setIsSubmitting(false);
      return;
    }

    const captcha = captchaToken || undefined;
    const result = mode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captcha } })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken: captcha,
            // Records the 18+ declaration made at sign-up.
            data: { display_name: displayName || undefined, age_confirmed_at: new Date().toISOString() },
            // Confirmation links return to whichever domain the user signed up on.
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

    // Captcha tokens are single-use; get a fresh widget for the next attempt.
    setCaptchaToken("");
    setCaptchaAttempt((attempt) => attempt + 1);

    if (result.error) {
      setError(result.error.message);
    } else if (mode === "sign-up") {
      setMessage("Account created. Check your email if confirmation is enabled, then sign in to continue.");
    } else {
      router.push(nextPath());
      router.refresh();
    }

    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f4faf6,_#eef8f3_30%,_#f8fafc_100%)] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-md">
        <section className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.08)]">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Private support space</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">{mode === "sign-in" ? "Welcome back." : "Create a safe account."}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Your conversations should only be visible to you and the verified professional you choose.</p>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button type="button" onClick={() => setMode("sign-in")} className={`rounded-lg px-3 py-2 ${mode === "sign-in" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500"}`}>Sign in</button>
            <button type="button" onClick={() => setMode("sign-up")} className={`rounded-lg px-3 py-2 ${mode === "sign-up" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500"}`}>Create account</button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "sign-up" && (
              <div>
                <label htmlFor="display-name" className="mb-2 block text-sm font-semibold text-slate-700">Name shown to your support team</label>
                <input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="field" placeholder="Your first name or preferred name" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="field" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input id="password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="field" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} />
            </div>
            {mode === "sign-up" && (
              <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <input type="checkbox" checked={isAdult} onChange={(event) => setIsAdult(event.target.checked)} className="mt-1 h-4 w-4 accent-emerald-700" required />
                <span>I am 18 or older. If you are under 18, please call Tele-MANAS on 14416 or talk to a trusted adult.</span>
              </label>
            )}
            <Turnstile key={captchaAttempt} onToken={setCaptchaToken} />
            <button type="submit" disabled={isSubmitting || needsCaptcha} className="w-full rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Please wait..." : mode === "sign-in" ? "Sign in securely" : "Create account"}
            </button>
          </form>

          {message && <p role="status" className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p>}
          {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
          <p className="mt-6 text-xs leading-5 text-slate-500">By continuing, you agree to our <Link className="underline" href="/terms">terms</Link> and <Link className="underline" href="/privacy">privacy notice</Link>.</p>
        </section>
      </div>
    </main>
  );
}
