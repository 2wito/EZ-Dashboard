'use client';

import { memo } from 'react';
import { ArrowUpDown, Inbox, Search } from 'lucide-react';
import { CHANNEL_META, PRIORITY_META, STATUS_FILTERS } from '@/lib/meta';
import type { Customer, StatusFilter, Ticket } from '@/lib/types';
import { cn, focusRing, formatDateTime, relativeTime } from '@/lib/utils';
import { Avatar, PriorityTag, SlaChip, StatusBadge, Tag } from './ui';

export type SortMode = 'priority' | 'recent';

interface TicketQueueProps {
  tickets: Ticket[];
  customers: Map<string, Customer>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  statusFilter: StatusFilter;
  statusCounts: Record<StatusFilter, number>;
  onStatusFilterChange: (f: StatusFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  sort: SortMode;
  onSortChange: (s: SortMode) => void;
  viewLabel: string;
  now: number;
}

export function TicketQueue(props: TicketQueueProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 border-b border-line p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 id="queue-heading" className="text-base font-semibold text-fg">
              Ticket queue
            </h2>
            <p className="text-xs text-muted">
              {props.viewLabel} · <span className="tabular-nums">{props.tickets.length}</span> shown
            </p>
          </div>
          <button
            type="button"
            onClick={() => props.onSortChange(props.sort === 'priority' ? 'recent' : 'priority')}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg',
              focusRing,
            )}
          >
            <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5" />
            {props.sort === 'priority' ? 'Priority' : 'Most recent'}
            <span className="sr-only">, change sort order</span>
          </button>
        </div>

        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <label htmlFor="queue-filter" className="sr-only">
            Filter queue
          </label>
          <input
            id="queue-filter"
            type="search"
            value={props.query}
            onChange={(e) => props.onQueryChange(e.target.value)}
            placeholder="Filter by ID, subject, customer, tag"
            className={cn(
              'h-10 w-full rounded-xl border border-line bg-canvas/60 pr-3 pl-9 text-sm text-fg transition-colors duration-150 placeholder:text-muted hover:border-faint',
              'outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
            )}
          />
        </div>

        <div role="group" aria-label="Filter by status" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          {STATUS_FILTERS.map((f) => {
            const active = f.id === props.statusFilter;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => props.onStatusFilterChange(f.id)}
                className={cn(
                  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors duration-150',
                  focusRing,
                  active
                    ? 'border-primary/50 bg-primary-soft text-primary-text'
                    : 'border-transparent text-muted hover:bg-elevated hover:text-fg',
                )}
              >
                {f.label}
                <span className="tabular-nums opacity-80">{props.statusCounts[f.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {props.tickets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-elevated text-muted">
            <Inbox aria-hidden="true" className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium text-fg">Queue clear</p>
          <p className="max-w-56 text-xs text-muted">No tickets match these filters. Try another status or view.</p>
        </div>
      ) : (
        <ul aria-labelledby="queue-heading" className="flex-1 space-y-1 overflow-y-auto p-2">
          {props.tickets.map((t) => {
            const customer = props.customers.get(t.customerId);
            if (!customer) return null;
            return (
              <TicketRow
                key={t.id}
                ticket={t}
                customer={customer}
                selected={t.id === props.selectedId}
                onSelect={props.onSelect}
                now={props.now}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

const TicketRow = memo(function TicketRow({
  ticket,
  customer,
  selected,
  onSelect,
  now,
}: {
  ticket: Ticket;
  customer: Customer;
  selected: boolean;
  onSelect: (id: string) => void;
  now: number;
}) {
  const last = ticket.thread[ticket.thread.length - 1];
  const lastAt = last?.at ?? ticket.createdAt;
  const ChannelIcon = CHANNEL_META[ticket.channel].icon;
  const showSla = ticket.slaDueAt !== null && ticket.status !== 'resolved';

  return (
    <li>
      <button
        type="button"
        data-ticket-id={ticket.id}
        onClick={() => onSelect(ticket.id)}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'relative w-full rounded-xl border py-3 pr-3 pl-4 text-left transition-colors duration-150',
          focusRing,
          selected
            ? 'border-primary/50 bg-primary-soft'
            : 'border-transparent hover:border-line hover:bg-elevated/70',
        )}
      >
        <span
          aria-hidden="true"
          className={cn('absolute top-3 bottom-3 left-1 w-[3px] rounded-full', PRIORITY_META[ticket.priority].bar)}
        />
        <div className="flex items-start gap-3">
          <Avatar name={customer.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-fg">
                {customer.name}
                <span className="font-normal text-muted"> · {customer.company}</span>
              </p>
              <span className="flex shrink-0 items-center gap-1.5">
                {ticket.unread && (
                  <span className="h-2 w-2 rounded-full bg-primary">
                    <span className="sr-only">Unread</span>
                  </span>
                )}
                <time
                  dateTime={new Date(lastAt).toISOString()}
                  title={formatDateTime(lastAt)}
                  className="text-xs text-muted tabular-nums"
                >
                  {relativeTime(lastAt, now)}
                </time>
              </span>
            </div>
            <p className={cn('mt-0.5 truncate text-sm', ticket.unread ? 'font-semibold text-fg' : 'text-muted')}>
              {ticket.subject}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                <ChannelIcon aria-label={CHANNEL_META[ticket.channel].label} className="h-3.5 w-3.5" />
                {ticket.id}
              </span>
              <PriorityTag priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              {ticket.tags.slice(0, 2).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {showSla && ticket.slaDueAt !== null && <SlaChip dueAt={ticket.slaDueAt} now={now} />}
            </div>
          </div>
        </div>
      </button>
    </li>
  );
});
