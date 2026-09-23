"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import type { Conversation, Message, Profile, SupportRequest } from "@/lib/types";

export type LiveStatus = "connecting" | "live" | "offline";

const REQUEST_COLUMNS = "id, patient_id, support_type, message, status, is_urgent, created_at";
const CONVERSATION_COLUMNS = "id, request_id, patient_id, doctor_id, status, created_at, support_requests(support_type, is_urgent)";
const MESSAGE_COLUMNS = "id, conversation_id, sender_id, body, is_urgent, created_at";

// Alerts carry no message content, so nothing private shows on a lock screen.
function notify(title: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted" || !document.hidden) return;
  new Notification(title, { body: "Open Gentle Hearth to read it.", tag: "gentle-hearth" });
}

async function postJson(url: string, method: "POST" | "PATCH", body?: unknown) {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, result };
  } catch {
    return { ok: false, status: 0, result: { error: "You appear to be offline. Please try again." } };
  }
}

export function usePortal(me: Profile | null) {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("connecting");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedIdRef = useRef<string | null>(null);
  const namesRef = useRef(names);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    namesRef.current = names;
  }, [selectedId, names]);

  const loadLists = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !me) return;

    const requestQuery = me.role === "doctor"
      ? supabase.from("support_requests").select(REQUEST_COLUMNS).eq("status", "open").order("is_urgent", { ascending: false }).order("created_at", { ascending: true })
      : supabase.from("support_requests").select(REQUEST_COLUMNS).eq("patient_id", me.id).order("created_at", { ascending: false }).limit(20);

    const [requestResult, conversationResult] = await Promise.all([
      requestQuery,
      supabase.from("conversations").select(CONVERSATION_COLUMNS).order("created_at", { ascending: false }),
    ]);

    if (requestResult.error || conversationResult.error) {
      setError("We could not load your inbox. Check your connection and try again.");
    }

    const nextConversations = (conversationResult.data ?? []) as unknown as Conversation[];
    setRequests((requestResult.data ?? []) as SupportRequest[]);
    setConversations(nextConversations);
    setIsLoading(false);

    const missing = [...new Set(nextConversations.map((c) => (c.patient_id === me.id ? c.doctor_id : c.patient_id)))]
      .filter((id) => !namesRef.current[id]);
    if (missing.length) {
      const { data } = await supabase.from("profiles").select("id, display_name").in("id", missing);
      setNames((current) => ({ ...current, ...Object.fromEntries((data ?? []).map((p) => [p.id, p.display_name])) }));
    }
  }, [me]);

  // Bursts of changes (e.g. a claim touches two tables) collapse into one reload.
  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => void loadLists(), 250);
  }, [loadLists]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !me) return;

    scheduleRefresh();

    const channel = supabase
      .channel(`portal-${me.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "support_requests" }, (payload) => {
        if (payload.eventType === "INSERT" && me.role === "doctor") {
          notify((payload.new as SupportRequest).is_urgent ? "Urgent support request" : "New support request");
        }
        scheduleRefresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, (payload) => {
        if (payload.eventType === "INSERT" && me.role !== "doctor") notify("A guide has picked up your request");
        scheduleRefresh();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const incoming = payload.new as Message;
        if (incoming.conversation_id === selectedIdRef.current) {
          setMessages((current) => (current.some((m) => m.id === incoming.id) ? current : [...current, incoming]));
        }
        if (incoming.sender_id !== me.id) {
          if (incoming.conversation_id !== selectedIdRef.current || document.hidden) {
            setUnread((current) => ({ ...current, [incoming.conversation_id]: (current[incoming.conversation_id] ?? 0) + 1 }));
          }
          notify("New message");
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setLiveStatus("live");
          // Catch up on anything missed while the socket was reconnecting.
          scheduleRefresh();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setLiveStatus("offline");
        }
      });

    function onVisible() {
      if (document.visibilityState !== "visible") return;
      scheduleRefresh();
      const openId = selectedIdRef.current;
      if (openId) setUnread((current) => ({ ...current, [openId]: 0 }));
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(refreshTimer.current);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [me, loadLists, scheduleRefresh]);

  const totalUnread = Object.values(unread).reduce((sum, count) => sum + count, 0);
  useEffect(() => {
    document.title = totalUnread ? `(${totalUnread}) Inbox · Gentle Hearth` : "Inbox · Gentle Hearth";
  }, [totalUnread]);

  const selectConversation = useCallback(async (conversationId: string | null) => {
    setSelectedId(conversationId);
    setMessages([]);
    if (!conversationId) return;
    setUnread((current) => ({ ...current, [conversationId]: 0 }));

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("messages")
      .select(MESSAGE_COLUMNS)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (selectedIdRef.current !== conversationId) return;
    const loaded = ((data ?? []) as Message[]).reverse();
    // Keep any live messages that arrived while the history was loading.
    setMessages((current) => [...loaded, ...current.filter((m) => !loaded.some((l) => l.id === m.id))]);
  }, []);

  async function sendMessage(body: string) {
    if (!selectedId) return { error: "Choose a conversation first." };
    const { ok, result } = await postJson("/api/messages", "POST", { conversationId: selectedId, message: body });
    if (!ok) return { error: (result.error as string) ?? "We could not send that message." };
    const saved = result.message as Message;
    setMessages((current) => (current.some((m) => m.id === saved.id) ? current : [...current, saved]));
    return { crisisMessage: result.crisisMessage as string | undefined };
  }

  async function claimRequest(requestId: string) {
    setError("");
    const { ok, status, result } = await postJson("/api/conversations", "POST", { requestId });
    if (!ok) {
      if (status === 409) setRequests((current) => current.filter((r) => r.id !== requestId));
      setError(result.error ?? "We could not accept this request.");
      return;
    }
    await loadLists();
    await selectConversation(result.conversationId as string);
  }

  async function withdrawRequest(requestId: string) {
    setError("");
    const { ok, result } = await postJson(`/api/support-requests/${requestId}`, "PATCH");
    if (!ok) setError(result.error ?? "We could not withdraw this request.");
    await loadLists();
  }

  async function closeConversation(conversationId: string) {
    setError("");
    const { ok, result } = await postJson(`/api/conversations/${conversationId}`, "PATCH");
    if (!ok) setError(result.error ?? "We could not close this conversation.");
    await loadLists();
  }

  return {
    requests,
    conversations,
    names,
    messages,
    selectedId,
    unread,
    liveStatus,
    isLoading,
    error,
    setError,
    refresh: loadLists,
    selectConversation,
    sendMessage,
    claimRequest,
    withdrawRequest,
    closeConversation,
  };
}
