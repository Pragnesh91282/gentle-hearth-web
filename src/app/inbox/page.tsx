"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import NotificationToggle from "@/components/NotificationToggle";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMember } from "@/lib/useMember";
import type { Profile, SupportRequest } from "@/lib/types";
import ChatPanel from "./ChatPanel";
import { type LiveStatus, usePortal } from "./usePortal";

function timeAgo(iso: string, now: number) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

const LIVE_BADGE: Record<LiveStatus, { label: string; dot: string }> = {
  live: { label: "Live", dot: "bg-leaf-700 animate-pulse" },
  connecting: { label: "Connecting", dot: "bg-amber-400" },
  offline: { label: "Reconnecting…", dot: "bg-slate-400" },
};

export default function InboxPage() {
  const member = useMember();
  const profile = member.profile;
  // Stable identity so the realtime channel is not rebuilt on every auth event.
  const me = useMemo<Profile | null>(
    () => (profile ? { id: profile.id, role: profile.role, display_name: profile.display_name } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile?.id, profile?.role, profile?.display_name],
  );

  if (member.status === "loading") {
    return <main className="flex flex-1 items-center justify-center bg-sand-50 p-10 text-slate-600">Loading your private inbox...</main>;
  }
  if (member.status !== "signed-in" || !me) {
    return (
      <main className="flex flex-1 items-center justify-center bg-sand-50 p-10">
        <div className="max-w-md rounded-3xl border border-sand-200 bg-white p-8 text-center text-sm text-slate-600">
          {member.status === "unconfigured"
            ? "Supabase is not configured yet. Add the environment variables before using the live inbox."
            : <>Please <Link href="/auth?next=/inbox" className="font-semibold text-leaf-800 underline">sign in</Link> to access your private inbox.</>}
        </div>
      </main>
    );
  }

  return <Portal me={me} />;
}

function Portal({ me }: { me: Profile }) {
  const portal = usePortal(me);
  const [now, setNow] = useState(() => Date.now());
  const isDoctor = me.role === "doctor";
  // A guide sent back for review (or rejected) can't see or accept requests.
  const [guideStatus, setGuideStatus] = useState<string | null>(null);
  useEffect(() => {
    if (!isDoctor) return;
    void createSupabaseBrowserClient()?.from("doctor_profiles").select("verification_status").eq("user_id", me.id).maybeSingle()
      .then(({ data }) => setGuideStatus(data?.verification_status ?? null));
  }, [isDoctor, me.id]);
  const underReview = isDoctor && guideStatus !== null && guideStatus !== "verified";
  const waitingOnReply = !isDoctor && portal.requests.some((request) => request.status === "open");

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const selected = portal.conversations.find((c) => c.id === portal.selectedId) ?? null;
  const activeConversations = portal.conversations.filter((c) => c.status === "active");
  const closedConversations = portal.conversations.filter((c) => c.status === "closed");
  const counterpartName = (patientId: string, doctorId: string) =>
    portal.names[patientId === me.id ? doctorId : patientId] ?? (patientId === me.id ? "Your guide" : "Member");

  const live = LIVE_BADGE[portal.liveStatus];

  return (
    <main className="flex-1 bg-sand-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf-700">{isDoctor ? "Guide workspace" : "Your support inbox"}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-leaf-900 md:text-4xl">
              {isDoctor ? "People waiting for a kind reply." : "Your conversations, at your pace."}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-3 py-2 text-slate-700" role="status">
              <span className={`h-2 w-2 rounded-full ${live.dot}`} />
              {live.label}
            </span>
            <button type="button" onClick={() => void portal.refresh()} className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-3 py-2 text-slate-700 hover:bg-sand-50">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <span className="hidden items-center gap-2 rounded-full bg-sand-100 px-3 py-2 text-leaf-800 md:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              Private and moderated
            </span>
          </div>
        </div>

        {isDoctor && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
            <Stat label="Open requests" value={portal.requests.length} />
            <Stat label="Active chats" value={activeConversations.length} />
          </div>
        )}

        {/* Offers phone notifications until they're on for this device. */}
        <div className="mt-6 sm:max-w-md">
          <NotificationToggle compact />
        </div>

        {portal.error && (
          <div role="alert" className="mt-6 flex items-start justify-between gap-4 whitespace-pre-line rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {portal.error}
            <button type="button" onClick={() => portal.setError("")} className="shrink-0 text-xs font-semibold underline">Dismiss</button>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[22rem_1fr]">
          <div className={`space-y-6 ${selected ? "hidden lg:block" : ""}`}>
            <section className="rounded-[2rem] border border-sand-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{isDoctor ? "Open requests" : "Your requests"}</h2>
                {!isDoctor && <Link href="/patients" className="text-xs font-semibold text-leaf-700 hover:underline">New request</Link>}
              </div>
              {underReview && (
                <div role="status" className="mt-4 rounded-2xl border border-sand-200 bg-sand-100 p-4 text-sm leading-6 text-leaf-900">
                  {guideStatus === "rejected"
                    ? "Your last application wasn't approved, so you can't take requests right now. You can update it and resubmit."
                    : "Your guide profile is being reviewed. You'll see open requests here again once a moderator has verified it."}
                  <Link href="/doctors/apply" className="mt-2 block font-semibold underline">View your guide profile</Link>
                </div>
              )}
              {waitingOnReply && (
                <p className="mt-4 rounded-2xl bg-sand-100 p-4 text-sm leading-6 text-slate-700">
                  While you wait: <Link href="/pause" className="font-semibold text-leaf-800 underline">take a breathing pause</Link> or <Link href="/ground" className="font-semibold text-leaf-800 underline">try grounding</Link>.
                </p>
              )}
              <div className="mt-4 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                {portal.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
                {!portal.isLoading && !underReview && portal.requests.length === 0 && (
                  <p className="rounded-2xl bg-sand-50 p-4 text-sm leading-6 text-slate-600">
                    {isDoctor ? "No one is waiting right now. New requests will appear here instantly." : "No requests yet. When you send one, you'll see it here and get notified when a guide replies."}
                  </p>
                )}
                {portal.requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    now={now}
                    isDoctor={isDoctor}
                    onClaim={() => void portal.claimRequest(request.id)}
                    onWithdraw={() => void portal.withdrawRequest(request.id)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-sand-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Conversations</h2>
                <MessageCircle className="h-5 w-5 text-leaf-700" />
              </div>
              <div className="mt-4 space-y-2">
                {portal.conversations.length === 0 && (
                  <p className="rounded-2xl bg-sand-50 p-4 text-sm leading-6 text-slate-600">
                    {isDoctor ? "Accept an open request to start a private conversation." : "A verified guide will start a conversation from your request."}
                  </p>
                )}
                {[...activeConversations, ...closedConversations].map((conversation) => {
                  const unread = portal.unread[conversation.id] ?? 0;
                  return (
                    <button
                      type="button"
                      key={conversation.id}
                      onClick={() => void portal.selectConversation(conversation.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left text-sm transition ${portal.selectedId === conversation.id ? "border-leaf-700 bg-sand-100" : "border-sand-200 hover:border-slate-300"} ${conversation.status === "closed" ? "opacity-60" : ""}`}
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-semibold">
                          <span className="truncate">{counterpartName(conversation.patient_id, conversation.doctor_id)}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {conversation.support_requests?.support_type ?? "Support"} · {conversation.status === "active" ? "Active" : "Closed"}
                        </span>
                      </span>
                      {unread > 0 && <span className="rounded-full bg-leaf-700 px-2 py-0.5 text-[11px] font-bold text-white">{unread}</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <section className={`rounded-[2rem] border border-sand-200 bg-sand-50 p-5 shadow-sm ${selected ? "" : "hidden lg:block"}`}>
            {selected ? (
              <ChatPanel
                key={selected.id}
                me={me}
                conversation={selected}
                counterpartName={counterpartName(selected.patient_id, selected.doctor_id)}
                messages={portal.messages}
                onSend={portal.sendMessage}
                onClose={() => portal.closeConversation(selected.id)}
                onBack={() => void portal.selectConversation(null)}
                onReported={() => void portal.refresh()}
              />
            ) : (
              <div className="flex h-full min-h-[32rem] flex-col items-center justify-center text-center text-sm text-slate-500">
                <MessageCircle className="mb-3 h-8 w-8 text-slate-300" />
                Choose a conversation to read and reply.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-3">
      <p className="text-2xl font-bold text-leaf-700">{value}</p>
      <p className="text-xs text-slate-600">{label}</p>
    </div>
  );
}

function RequestCard({ request, now, isDoctor, onClaim, onWithdraw }: {
  request: SupportRequest;
  now: number;
  isDoctor: boolean;
  onClaim: () => void;
  onWithdraw: () => void;
}) {
  const [isBusy, setIsBusy] = useState(false);

  function run(action: () => void) {
    setIsBusy(true);
    action();
    setTimeout(() => setIsBusy(false), 1500);
  }

  return (
    <article className="rounded-2xl border border-sand-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-leaf-800">{request.support_type}</p>
        <span className="shrink-0 rounded-full bg-sand-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">
          {request.closed_reason === "expired" ? "Closed: no guide was free" : request.status}
        </span>
      </div>
      <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-700">{request.message}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{isDoctor ? "Shared " : "Sent "}{timeAgo(request.created_at, now)}</span>
        {isDoctor && request.status === "open" && (
          <button type="button" disabled={isBusy} onClick={() => run(onClaim)} className="rounded-full bg-leaf-700 px-4 py-2 text-xs font-semibold text-white hover:bg-leaf-800 disabled:opacity-60">
            Offer guidance
          </button>
        )}
        {!isDoctor && request.status === "open" && (
          <button type="button" disabled={isBusy} onClick={() => run(onWithdraw)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-sand-100 disabled:opacity-60">
            Withdraw
          </button>
        )}
      </div>
    </article>
  );
}
