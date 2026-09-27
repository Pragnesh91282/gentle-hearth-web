export interface AnonymousIdentity {
  handle: string;
  avatarSeed: string;
  symbol: string;
  background: string;
}

const ADJECTIVES = ['Calm', 'Gentle', 'Quiet', 'Soft', 'Peaceful', 'Still', 'Patient', 'Restful'];
const NOUNS = ['River', 'Breeze', 'Oak', 'Pine', 'Cloud', 'Brook', 'Pebble', 'Fern'];

const PALETTES = [
  { id: 'teal', background: 'bg-teal-100 text-teal-800 border-teal-200', symbol: '🌿' },
  { id: 'sky', background: 'bg-sky-100 text-sky-800 border-sky-200', symbol: '☁️' },
  { id: 'amber', background: 'bg-amber-100 text-amber-800 border-amber-200', symbol: '☀️' },
  { id: 'rose', background: 'bg-rose-100 text-rose-800 border-rose-200', symbol: '🌸' },
];

export function generateIdentity(): AnonymousIdentity {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(10 + Math.random() * 90);
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

  return {
    handle: `${adj}${noun}${num}`,
    avatarSeed: `${palette.id}-${Math.floor(Math.random() * 1000)}`,
    symbol: palette.symbol,
    background: palette.background,
  };
}

const CRISIS_PATTERNS = [
  /\b(kill myself|suicide|suicidal|end my life|want to die|self[- ]harm|hurt myself|slit|overdose)\b/i,
  /\b(hang myself|take my own life|end it all|can't go on anymore|cant go on anymore)\b/i
];

// India launch: Tele-MANAS is the government's free 24/7 mental-health line.
export const CRISIS_LINES = "Tele-MANAS: call 14416 or 1-800-891-4416 (free, 24/7). Emergency: call 112.";

export const CRISIS_MESSAGE =
  "It sounds like you're carrying a heavy burden. Your message was sent and marked urgent, but please reach out for immediate free support too:\n\n• Tele-MANAS: call 14416 or 1-800-891-4416 (free, 24/7, Government of India)\n• Emergency: call 112\n• Outside India: your local emergency number or findahelpline.com";

// Crisis language is never rejected: the text is saved, flagged urgent, and
// the sender is shown crisis resources alongside the normal flow.
export function detectCrisis(text: string) {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}

export const SUPPORT_OPTIONS = [
  "I need someone to listen",
  "I want practical coping tips",
  "I need help with anxiety",
  "I need emotional grounding",
  "I want a short check-in",
  "I need a free resource",
];
