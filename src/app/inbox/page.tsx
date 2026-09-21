"use client";

import { FormEvent, startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, RefreshCw, ShieldCheck, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type SupportRequest = {
  id: string;
  support_type: string;
  message: string;
  status: "open" | "claimed" | "closed";
  created_at: string;
};

type Conversation = {
  id: string;
  request_id: string;
  patient_id: string;
  doctor_id: string;
  status: "active" | "closed";
  created_at: string;
};

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function InboxPage() {
  const [role, setRole] = useState<"patient" | "doctor" | "moderator" | null>(null);
  const [userId, setUserId] = useState("");
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured yet. Add the environment variables before using the live inbox.");
      setIsLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in to access your private inbox.");
      setIsLoading(false);
      return;
    }

    setUserId(user.id);
    const [{ data: profile }, { data: userConversations }, { data: userRequests }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("conversations").select("id, request_id, patient_id, doctor_id, status, created_at").order("created_at", { ascending: false }),
      supabase.from("support_requests").select("id, support_type, message, status, created_at").order("created_at", { ascending: false }),
    ]);

    setRole(profile?.role ?? null);
    setConversations((userConversations ?? []) as Conversation[]);
    setRequests((userRequests ?? []) as SupportRequest[]);
    setIsLoading(false);
  }

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !userId) return;

    const channel = supabase
      .channel(`live-inbox-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "support_requests" }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        if (selectedConversation) void loadMessages(selectedConversation.id);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, selectedConversation]);

  async function loadMessages(conversationId: string) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Message[]);
  }

  async function selectConversation(conversation: Conversation) {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  }

  async function claimRequest(requestId: string) {
    setError("");
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "We could not claim this request.");
      return;
    }
    await loadData();
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConversation || !message.trim()) return;
    setIsSending(true);
    setError("");
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConversation.id, message }),
    });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "We could not send that message.");
    else {
      setMessage("");
      await loadMessages(selectedConversation.id);
    }
    setIsSending(false);
  }

  async function closeConversation() {
    if (!selectedConversation) return;
    const response = await fetch(`/api/conversations/${selectedConversation.id}`, { method: "PATCH" });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "We could not close this conversation.");
    else {
      setSelectedConversation(null);
      setMessages([]);
      await loadData();
    }
  }

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading your private inbox...</main>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f4faf6,_#eef8f3_28%,_#f8fafc_100%)] px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Home</Link>
          <button type="button" onClick={() => void loadData()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Refresh</button>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Live support inbox</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Your conversations, at your pace.</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 md:flex"><ShieldCheck className="h-4 w-4" /> Private and moderated</div>
        </div>

        {error && <div role="alert" className="mt-6 whitespace-pre-line rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{role === "doctor" ? "Open requests" : "Your requests"}</h2><span className="text-xs text-slate-500">Updates live</span></div>
            <div className="mt-5 space-y-3">
              {requests.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">No requests yet. New support activity will appear here.</p>}
              {requests.map((supportRequest) => (
                <article key={supportRequest.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-emerald-800">{supportRequest.support_type}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">{supportRequest.status}</span></div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{supportRequest.message}</p>
                  {role === "doctor" && supportRequest.status === "open" && <button type="button" onClick={() => void claimRequest(supportRequest.id)} className="mt-4 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Offer guidance</button>}
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Conversations</h2><MessageCircle className="h-5 w-5 text-emerald-700" /></div>
            <div className="mt-5 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-3">
                {conversations.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">A verified doctor can start a conversation from an open request.</p>}
                {conversations.map((conversation) => <button type="button" key={conversation.id} onClick={() => void selectConversation(conversation)} className={`w-full rounded-2xl border p-4 text-left text-sm ${selectedConversation?.id === conversation.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}><span className="font-semibold">Conversation</span><span className="mt-1 block text-xs text-slate-500">{conversation.status}</span></button>)}
              </div>

              <div className="min-h-72 rounded-2xl bg-slate-50 p-4">
                {!selectedConversation ? <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-sm text-slate-500"><MessageCircle className="mb-3 h-8 w-8 text-slate-300" />Choose a conversation to read and reply.</div> : <>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3"><p className="text-sm font-semibold">Private conversation</p>{selectedConversation.status === "active" && <button type="button" onClick={() => void closeConversation()} aria-label="Close conversation" className="rounded-full p-2 text-slate-500 hover:bg-white hover:text-slate-900"><X className="h-4 w-4" /></button>}</div>
                  <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
                    {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
                    {messages.map((conversationMessage) => <div key={conversationMessage.id} className={`rounded-2xl p-3 text-sm leading-6 ${conversationMessage.sender_id === userId ? "ml-6 bg-emerald-100 text-emerald-950" : "mr-6 bg-white text-slate-700"}`}>{conversationMessage.body}</div>)}
                  </div>
                  {selectedConversation.status === "active" && <form onSubmit={sendMessage} className="mt-4 flex gap-2"><input aria-label="Message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} className="field" placeholder="Write a thoughtful reply" /><button type="submit" disabled={isSending} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{isSending ? "..." : "Send"}</button></form>}
                  {selectedConversation.status === "closed" && <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-600" />This conversation is closed.</p>}
                </>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
