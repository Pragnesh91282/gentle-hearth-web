import { LifeBuoy } from "lucide-react";

export default function CrisisResources({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div role="status" className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
      <div className="flex items-start gap-3">
        <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
        <p className="whitespace-pre-line">{message}</p>
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="mt-3 text-xs font-semibold text-sky-800 underline">
          I&apos;ve seen these resources
        </button>
      )}
    </div>
  );
}
