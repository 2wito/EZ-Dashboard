'use client';

import { useEffect, useRef } from 'react';
import { CalendarClock, CreditCard, Mail, MapPin, Star, Ticket as TicketIcon, X } from 'lucide-react';
import type { Customer, Ticket } from '@/lib/types';
import { cn, focusRing, formatDate, relativeTime } from '@/lib/utils';
import { Avatar, PriorityTag, StatusBadge } from './ui';

const PLAN_TONE: Record<Customer['plan'], string> = {
  Enterprise: 'bg-primary-soft text-primary-text',
  Growth: 'bg-ok-soft text-ok',
  Starter: 'bg-elevated text-muted',
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function CustomerProfile({
  customer,
  relatedTickets,
  currentTicketId,
  onSelectTicket,
  now,
}: {
  customer: Customer;
  relatedTickets: Ticket[];
  currentTicketId: string;
  onSelectTicket: (id: string) => void;
  now: number;
}) {
  const others = relatedTickets.filter((t) => t.id !== currentTicketId);

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center gap-4">
        <Avatar name={customer.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-fg">{customer.name}</p>
          <p className="truncate text-sm text-muted">{customer.company}</p>
          <span className={cn('mt-1.5 inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold', PLAN_TONE[customer.plan])}>
            {customer.plan}
          </span>
        </div>
      </div>

      <dl className="space-y-2.5 text-sm">
        <div className="flex items-center gap-2.5">
          <dt>
            <Mail aria-label="Email" className="h-4 w-4 text-muted" />
          </dt>
          <dd className="min-w-0 truncate">
            <a href={`mailto:${customer.email}`} className={cn('rounded text-primary-text hover:underline', focusRing)}>
              {customer.email}
            </a>
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <dt>
            <MapPin aria-label="Location" className="h-4 w-4 text-muted" />
          </dt>
          <dd className="text-fg">{customer.location}</dd>
        </div>
        <div className="flex items-center gap-2.5">
          <dt>
            <CalendarClock aria-label="Customer since" className="h-4 w-4 text-muted" />
          </dt>
          <dd className="text-fg">Customer since {formatDate(customer.customerSince)}</dd>
        </div>
      </dl>

      <dl className="grid grid-cols-3 gap-2">
        <Stat icon={Star} label="CSAT" value={customer.csat ? customer.csat.toFixed(1) : '—'} />
        <Stat icon={TicketIcon} label="Tickets" value={String(customer.lifetimeTickets)} />
        <Stat icon={CreditCard} label="MRR" value={currency.format(customer.mrr)} />
      </dl>

      {others.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Other active tickets</h3>
          <ul className="space-y-1.5">
            {others.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelectTicket(t.id)}
                  className={cn(
                    'w-full rounded-xl border border-line px-3 py-2.5 text-left transition-colors duration-150 hover:border-primary/50 hover:bg-elevated',
                    focusRing,
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted">{t.id}</span>
                    <StatusBadge status={t.status} />
                  </span>
                  <span className="mt-1 block truncate text-sm font-medium text-fg">{t.subject}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <PriorityTag priority={t.priority} />· opened {relativeTime(t.createdAt, now)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Ticket history</h3>
        {customer.history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-xs text-muted">
            First conversation with this customer.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-line pl-4">
            {customer.history.map((h) => (
              <li key={h.id} className="relative">
                <span aria-hidden="true" className="absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full border-2 border-surface bg-ok" />
                <p className="text-sm font-medium text-fg">{h.subject}</p>
                <p className="mt-0.5 text-xs text-muted">
                  <span className="font-mono">{h.id}</span> · {formatDate(h.at)} · Resolved
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-elevated/50 px-3 py-2.5">
      <dt className="flex items-center gap-1 text-xs text-muted">
        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-fg tabular-nums">{value}</dd>
    </div>
  );
}

/** Slide-over drawer used below the 3xl breakpoint (on ultra-wide screens the profile is a fixed column). */
export function CustomerDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div className={cn('fixed inset-0 z-40 3xl:hidden', !open && 'pointer-events-none')} inert={!open}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Customer details"
        tabIndex={-1}
        className={cn(
          'glass absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l shadow-2xl outline-none transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-sm font-semibold text-fg">Customer</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close customer details"
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg',
              focusRing,
            )}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
