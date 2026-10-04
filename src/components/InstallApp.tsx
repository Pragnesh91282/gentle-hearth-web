"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISSED_KEY = "thehrav:install-dismissed";

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

// Offers to install Thehrav: a button where the browser supports it (Android
// Chrome, desktop Chrome and Edge), or Add to Home Screen steps on iPhone.
export default function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const installed = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (installed || wasDismissed()) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the device is only known after mount
    if (isIos) setShowIosSteps(true);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not remembered; it simply shows again next visit.
    }
  }

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    if (outcome === "accepted") setHidden(true);
  }

  if (hidden || (!promptEvent && !showIosSteps)) return null;

  return (
    <div className="relative mx-auto mt-10 max-w-md rounded-3xl border border-sand-200 bg-white p-5 text-left shadow-sm">
      <button type="button" onClick={dismiss} aria-label="Hide" className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-sand-100 hover:text-slate-600">
        <X className="h-4 w-4" />
      </button>
      <p className="font-semibold text-leaf-900">Keep Thehrav on your phone</p>
      <p className="mt-1 pr-6 text-sm leading-6 text-slate-600">It opens like an app, with just a leaf icon and the name Thehrav on your home screen.</p>
      {promptEvent ? (
        <button type="button" onClick={() => void install()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-leaf-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-800">
          <Download className="h-4 w-4" />
          Install the app
        </button>
      ) : (
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
          In Safari, tap <Share className="inline h-4 w-4 text-leaf-700" aria-label="Share" /> Share, then <span className="font-semibold">Add to Home Screen</span>.
        </p>
      )}
    </div>
  );
}
