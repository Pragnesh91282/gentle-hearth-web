// The Thehrav leaf, the same mark as src/app/icon.svg.
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1f5c46" />
      <path d="M24 7C14 7 8 12.5 8 19.5c0 2 .6 3.6 1.5 4.9C11 18 15 14 20 11.5c-4 3-7.3 7.2-8.8 12.8 1.3.8 2.9 1.2 4.8 1.2 6.5 0 8.6-6.4 8-18.5z" fill="#fdfaf4" />
    </svg>
  );
}
