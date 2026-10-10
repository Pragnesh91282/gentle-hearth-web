"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type State = "checking" | "unsupported" | "blocked" | "off" | "on" | "busy";

function keyBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

// Stops notifications on this device; used when signing out so a shared
// phone never shows the previous member's alerts.
export async function turnOffNotificationsOnThisDevice() {
  try {
    if (!("serviceWorker" in navigator)) return;
    const subscription = await currentSubscription();
    if (!subscription) return;
    await fetch("/api/push", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
    await subscription.unsubscribe();
  } catch {
    // Nothing to turn off.
  }
}

function save(subscription: PushSubscription) {
  return fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
}

// Turns phone notifications on or off for this device.
export default function NotificationToggle({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const supported = PUBLIC_KEY && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) return "unsupported" as const;
      if (Notification.permission === "denied") return "blocked" as const;
      const subscription = await Promise.race([
        currentSubscription(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
      if (!subscription) return "off" as const;
      // Re-link the device to whoever is signed in now.
      await save(subscription).catch(() => undefined);
      return "on" as const;
    }
    void check().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function turnOn() {
    setError("");
    setState("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = (await registration.pushManager.getSubscription())
        ?? (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(PUBLIC_KEY!) }));
      const response = await save(subscription);
      if (!response.ok) throw new Error("save failed");
      setState("on");
    } catch {
      setError("We couldn't turn on notifications. Please try again.");
      setState("off");
    }
  }

  async function turnOff() {
    setState("busy");
    await turnOffNotificationsOnThisDevice();
    setState("off");
  }

  if (state === "checking" || state === "unsupported") return null;
  if (compact && state === "on") return null;

  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-leaf-700">
          {state === "on" ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-leaf-900">{state === "on" ? "Notifications are on" : "Get a gentle notification"}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {state === "blocked"
              ? "Notifications are blocked for Thehrav. You can allow them in your phone or browser settings."
              : "When a guide replies, we'll let you know on this device. It never shows what anyone wrote."}
          </p>
          {state !== "blocked" && (
            <button
              type="button"
              disabled={state === "busy"}
              onClick={() => void (state === "on" ? turnOff() : turnOn())}
              className={`mt-3 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60 ${state === "on" ? "border border-sand-200 text-slate-700 hover:border-slate-300" : "bg-leaf-700 text-white hover:bg-leaf-800"}`}
            >
              {state === "busy" ? "Please wait…" : state === "on" ? "Turn off on this device" : "Turn on notifications"}
            </button>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-rose-800">{error}</p>}
        </div>
      </div>
    </div>
  );
}
