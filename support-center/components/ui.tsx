import { Clock } from 'lucide-react';
import { PRIORITY_META, STATUS_META } from '@/lib/meta';
import type { Priority, Status } from '@/lib/types';
import { avatarTone, cn, initials, slaState } from '@/lib/utils';

const AVATAR_SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
} as const;

export function Avatar({
  name,
  size = 'md',
  presence,
}: {
  name: string;
  size?: keyof typeof AVATAR_SIZES;
  presence?: string;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-surface',
          AVATAR_SIZES[size],
          avatarTone(name),
        )}
      >
        {initials(name)}
      </span>
      {presence && (
        <span
          aria-hidden="true"
          className={cn('absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full ring-2 ring-surface', presence)}
        />
      )}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap',
        meta.badge,
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export function PriorityTag({ priority, compact = false }: { priority: Priority; compact?: boolean }) {
  const meta = PRIORITY_META[priority];
  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex h-6 items-center gap-1 text-xs font-medium whitespace-nowrap', meta.text)}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
      {compact ? <span className="sr-only">{meta.label} priority</span> : `${meta.label}`}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md border border-line px-1.5 text-xs text-muted whitespace-nowrap">
      {children}
    </span>
  );
}

export function SlaChip({ dueAt, now }: { dueAt: number; now: number }) {
  const sla = slaState(dueAt, now);
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-xs font-medium tabular-nums whitespace-nowrap',
        sla.tone === 'ok' ? 'text-muted' : 'bg-danger-soft text-danger',
      )}
    >
      <Clock aria-hidden="true" className="h-3.5 w-3.5" />
      {sla.label}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-elevated px-1 font-mono text-[11px] font-medium text-muted">
      {children}
    </kbd>
  );
}
