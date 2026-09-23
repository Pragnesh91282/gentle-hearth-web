"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { AlertTriangle, ArrowLeft, CheckCircle2, Flag, Send } from "lucide-react";
import CrisisResources from "@/components/CrisisResources";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import type { Conversation, Message, Profile } from "@/lib/types";

type Props = {
  me: Profile;
  conversation: Conversation;
  counterpartName: string;
  messages: Message[];
  onSend: (body: string) => Promise<{ error?: string; crisisMessage?: string }>;
  onClose: () => Promise<void>;
  onBack: () => void;
  onReported: () => void;
};

const TYPING_SIGNAL_INTERVAL = 2000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Parent renders this with key={conversation.id}, so all state resets per conversation.
export default function ChatPanel({ me, conversation, counterpartName, messages, onSend, onClose, onBack, onReported }: Props) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [crisisMessage, setCrisisMessage] = useState("");
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  // undefined = form hidden; null = report the conversation; string = report one message.
  const [reportTarget, setReportTarget] = useState<string | null | undefined>(undefined);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastTypingSent = useRef(0);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isActive = conversation.status === "active";
  const isDoctor = conversation.doctor_id === me.id;

  // Private channel for presence and typing; access is limited to the two
  // participants by the realtime.messages policies in supabase/portal.sql.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !isActive) return;

    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    void (async () => {
      await supabase.realtime.setAuth();
      if (cancelled) return;
      const live = supabase.channel(`conversation:${conversation.id}`, {
        config: { private: true, presence: { key: me.id } },
      });
      channel = live;
      live
        .on("presence", { event: "sync" }, () => {
          setOtherOnline(Object.keys(live.presenceState()).some((key) => key !== me.id));
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (payload?.userId === me.id) return;
          setOtherTyping(true);
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setOtherTyping(false), 3000);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") void live.track({ online_at: new Date().toISOString() });
        });
      channelRef.current = live;
    })();

    return () => {
      cancelled = true;
      clearTimeout(typingTimer.current);
      channelRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [conversation.id, me.id, isActive]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length, otherTyping]);

  function handleDraftChange(value: string) {
    setDraft(value);
    const now = Date.now();
    if (channelRef.current && value && now - lastTypingSent.current > TYPING_SIGNAL_INTERVAL) {
      lastTypingSent.current = now;
      void channelRef.current.send({ type: "broadcast", event: "typing", payload: { userId: me.id } });
    }
  }

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);
    setSendError("");
    const result = await onSend(body);
    if (result.error) {
      setSendError(result.error);
    } else {
      setDraft("");
      if (result.crisisMessage) setCrisisMessage(result.crisisMessage);
    }
    setIsSending(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="flex h-full min-h-[32rem] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={onBack} aria-label="Back to conversations" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate font-semibold">{counterpartName}</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              {isActive ? (
                <>
                  <span className={`h-2 w-2 rounded-full ${otherOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {otherOnline ? "Online now" : "Away — they'll see your message when they return"}
                </>
              ) : (
                "Conversation closed"
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => setReportTarget(null)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <Flag className="h-3.5 w-3.5" />
            Report
          </button>
          {isActive && !confirmingClose && (
            <button type="button" onClick={() => setConfirmingClose(true)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              End
            </button>
          )}
        </div>
      </div>

      {confirmingClose && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm">
          <span>End this conversation? Neither of you will be able to send more messages.</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmingClose(false)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Keep talking</button>
            <button type="button" onClick={() => void onClose().then(() => setConfirmingClose(false))} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">End conversation</button>
          </div>
        </div>
      )}

      {reportTarget !== undefined && (
        <ReportForm
          conversationId={conversation.id}
          messageId={reportTarget}
          counterpartName={counterpartName}
          onDone={(blocked) => {
            setReportTarget(undefined);
            if (blocked) onReported();
          }}
        />
      )}

      <div ref={scrollRef} className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {messages.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">
            {isDoctor ? "Say hello and let them know you're here to listen." : "Your guide is here. Share whatever feels right, at your own pace."}
          </p>
        )}
        {messages.map((message) => {
          const mine = message.sender_id === me.id;
          return (
            <div key={message.id} className={`group flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${mine ? "bg-emerald-700 text-white" : "bg-white text-slate-800 shadow-sm"}`}>
                {message.body}
              </div>
              <div className="mt-1 flex items-center gap-2 px-1 text-[11px] text-slate-400">
                <span>{mine ? "You" : counterpartName} · {formatTime(message.created_at)}</span>
                {message.is_urgent && isDoctor && !mine && (
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-600"><AlertTriangle className="h-3 w-3" />Crisis language — consider sharing resources</span>
                )}
                {!mine && (
                  <button type="button" onClick={() => setReportTarget(message.id)} className="opacity-0 transition hover:text-rose-600 focus:opacity-100 group-hover:opacity-100" aria-label="Report this message">
                    <Flag className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {otherTyping && <p className="px-1 text-xs italic text-slate-500">{counterpartName} is typing…</p>}
      </div>

      {crisisMessage && <div className="mt-3"><CrisisResources message={crisisMessage} onDismiss={() => setCrisisMessage("")} /></div>}
      {sendError && <p role="alert" className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-900">{sendError}</p>}

      {isActive ? (
        <form onSubmit={submit} className="mt-3 flex items-end gap-2">
          <textarea
            aria-label="Message"
            rows={2}
            value={draft}
            onChange={(event) => handleDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={4000}
            className="field resize-none"
            placeholder="Write a thoughtful reply — Enter to send, Shift+Enter for a new line"
          />
          <button type="submit" disabled={isSending || !draft.trim()} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          This conversation is closed. {isDoctor ? "" : "You can always send a new request if you need more support."}
        </p>
      )}
    </div>
  );
}

function ReportForm({ conversationId, messageId, counterpartName, onDone }: {
  conversationId: string;
  messageId: string | null;
  counterpartName: string;
  onDone: (blocked: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const [block, setBlock] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, messageId, reason, block }),
    }).catch(() => null);
    const result = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      setError(result?.error ?? "We could not submit this report.");
      setStatus("idle");
      return;
    }
    setStatus("sent");
    setTimeout(() => onDone(block), 1500);
  }

  if (status === "sent") {
    return <p role="status" className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900">Thank you. A moderator will review this privately.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-sm">
      <p className="font-semibold text-rose-900">{messageId ? "Report this message" : "Report this conversation"}</p>
      <textarea required rows={2} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="field" placeholder="What happened? Moderators only see what you share here and the reported message." />
      <label className="flex items-start gap-2 text-slate-700">
        <input type="checkbox" checked={block} onChange={(event) => setBlock(event.target.checked)} className="mt-1 accent-rose-700" />
        Also block {counterpartName} and end this conversation
      </label>
      {error && <p role="alert" className="text-rose-900">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={status === "sending"} className="rounded-full bg-rose-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{status === "sending" ? "Sending..." : "Submit report"}</button>
        <button type="button" onClick={() => onDone(false)} className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white">Cancel</button>
      </div>
    </form>
  );
}
