"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMember } from "@/lib/useMember";

const CONFIRM_WORD = "DELETE";

export default function AccountPage() {
  const router = useRouter();
  const member = useMember();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmation !== CONFIRM_WORD) return;
    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setError(result.error ?? "We could not delete your account. Please try again.");
        return;
      }
      // The user no longer exists; clear the local session as well.
      await createSupabaseBrowserClient()?.auth.signOut().catch(() => undefined);
      router.push("/");
      router.refresh();
    } catch {
      setError("We could not reach the service. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserRound className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your account</h1>
          {member.status === "signed-in" && (
            <p className="mt-3 text-sm text-slate-600">Signed in as <span className="font-semibold">{member.profile.display_name}</span>.</p>
          )}
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Read how we handle your data in our <Link className="underline" href="/privacy">privacy notice</Link>. Questions or complaints go to our <Link className="underline" href="/grievance">Grievance Officer</Link>.
          </p>
        </section>

        <section className="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-rose-900">Delete my account</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This permanently deletes your account, your support requests, and your conversations, including the messages in them. It cannot be undone.
          </p>
          <form onSubmit={handleDelete} className="mt-5 space-y-4">
            <div>
              <label htmlFor="confirm-delete" className="mb-2 block text-sm font-semibold text-slate-700">Type {CONFIRM_WORD} to confirm</label>
              <input id="confirm-delete" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="field" autoComplete="off" />
            </div>
            <button type="submit" disabled={isDeleting || confirmation !== CONFIRM_WORD} className="rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isDeleting ? "Deleting..." : "Permanently delete my account"}
            </button>
          </form>
          {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
        </section>
      </div>
    </main>
  );
}
