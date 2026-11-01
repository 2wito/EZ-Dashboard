export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Shared keyboard focus ring — visible on keyboard focus only. */
export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

const MINUTE = 60_000;

// Fixed locale + UTC so server and client render identical strings (no hydration drift).
const clockFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const formatClock = (at: number) => `${clockFmt.format(at)} UTC`;
export const formatDate = (at: number) => dateFmt.format(at);
export const formatDateTime = (at: number) => `${formatDate(at)}, ${formatClock(at)}`;

export function relativeTime(at: number, now: number): string {
  const diff = Math.max(0, now - at);
  if (diff < MINUTE) return 'just now';
  const m = Math.floor(diff / MINUTE);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d ago` : formatDate(at);
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

export interface SlaState {
  label: string;
  tone: 'breached' | 'critical' | 'ok';
}

export function slaState(dueAt: number, now: number): SlaState {
  const diff = dueAt - now;
  const m = Math.max(0, Math.round(Math.abs(diff) / MINUTE));
  if (diff < 0) return { label: `SLA breached ${formatMinutes(m)}`, tone: 'breached' };
  return { label: `SLA ${formatMinutes(m)}`, tone: m <= 15 ? 'critical' : 'ok' };
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function firstName(name: string): string {
  return name.split(' ')[0] ?? name;
}

// White text on each of these is ≥ 4.5:1.
const AVATAR_TONES = [
  'bg-blue-600',
  'bg-violet-600',
  'bg-emerald-700',
  'bg-amber-700',
  'bg-rose-600',
  'bg-cyan-700',
  'bg-indigo-600',
  'bg-fuchsia-700',
];

export function avatarTone(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length] ?? AVATAR_TONES[0];
}

export function percentChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}
