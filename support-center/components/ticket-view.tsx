'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CircleCheck, Lock, PanelRight, RotateCcw, Send, UserRound, Zap } from 'lucide-react';
import { CHANNEL_META, STATUS_META } from '@/lib/meta';
import type { ComposerMode, Customer, Macro, Status, Ticket, ThreadEntry } from '@/lib/types';
import { cn, firstName, focusRing, formatDateTime, relativeTime } from '@/lib/utils';
import { Avatar, Kbd, PriorityTag, SlaChip, StatusBadge, Tag } from './ui';

interface TicketViewProps {
  ticket: Ticket;
  customer: Customer;
  agentName: string;
  macros: Macro[];
  now: number;
  onSend: (body: string, mode: ComposerMode) => void;
  onStatusChange: (status: Status) => void;
  onOpenCustomer: () => void;
  onBack: () => void;
}

const STATUSES = Object.keys(STATUS_META) as Status[];

export function TicketView({
  ticket,
  customer,
  agentName,
  macros,
  now,
  onSend,
  onStatusChange,
  onOpenCustomer,
  onBack,
}: TicketViewProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const ChannelIcon = CHANNEL_META[ticket.channel].icon;
  const resolved = ticket.status === 'resolved';

  // Keep the newest message in view when switching tickets or receiving a new entry.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [ticket.id, ticket.thread.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-4 py-4 lg:px-6">
        <div className="flex flex-wrap items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to queue"
            className={cn(
              'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-elevated hover:text-fg lg:hidden',
              focusRing,
            )}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 basis-64">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <span className="font-mono font-semibold text-fg">{ticket.id}</span>
              <span className="inline-flex items-center gap-1">
                <ChannelIcon aria-hidden="true" className="h-3.5 w-3.5" />
                via {CHANNEL_META[ticket.channel].label}
              </span>
              <span aria-hidden="true">·</span>
              <time dateTime={new Date(ticket.createdAt).toISOString()} title={formatDateTime(ticket.createdAt)}>
                opened {relativeTime(ticket.createdAt, now)}
              </time>
            </p>
            <h2 className="mt-1 text-lg leading-snug font-semibold text-balance text-fg">{ticket.subject}</h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityTag priority={ticket.priority} />
              {ticket.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {ticket.slaDueAt !== null && !resolved && <SlaChip dueAt={ticket.slaDueAt} now={now} />}
              <span className="inline-flex h-6 items-center gap-1 text-xs text-muted">
                <UserRound aria-hidden="true" className="h-3.5 w-3.5" />
                {ticket.assignee ?? 'Unassigned'}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label htmlFor="ticket-status" className="sr-only">
              Ticket status
            </label>
            <select
              id="ticket-status"
              value={ticket.status}
              onChange={(e) => onStatusChange(e.target.value as Status)}
              className={cn(
                'h-9 rounded-lg border border-line bg-surface px-2.5 text-sm font-medium text-fg transition-colors hover:border-faint',
                focusRing,
              )}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onStatusChange(resolved ? 'open' : 'resolved')}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors duration-150',
                focusRing,
                resolved
                  ? 'border border-line text-fg hover:bg-elevated'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800',
              )}
            >
              {resolved ? (
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              ) : (
                <CircleCheck aria-hidden="true" className="h-4 w-4" />
              )}
              {resolved ? 'Reopen' : 'Resolve'}
            </button>
            <button
              type="button"
              onClick={onOpenCustomer}
              aria-label={`Open customer details for ${customer.name}`}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-elevated hover:text-fg 3xl:hidden',
                focusRing,
              )}
            >
              <PanelRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={threadRef}
        role="log"
        aria-label="Conversation"
        className="flex-1 space-y-5 overflow-y-auto px-4 py-5 lg:px-6"
      >
        {ticket.thread.map((entry) => (
          <ThreadItem key={entry.id} entry={entry} now={now} />
        ))}
      </div>

      <Composer key={ticket.id} customerName={customer.name} agentName={agentName} macros={macros} onSend={onSend} />
    </div>
  );
}

function ThreadItem({ entry, now }: { entry: ThreadEntry; now: number }) {
  const time = (
    <time dateTime={new Date(entry.at).toISOString()} title={formatDateTime(entry.at)} className="text-xs text-muted tabular-nums">
      {relativeTime(entry.at, now)}
    </time>
  );

  if (entry.kind === 'system') {
    return (
      <div className="flex items-center gap-3 text-xs text-muted">
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span>
          {entry.body} · {relativeTime(entry.at, now)}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
    );
  }

  const isNote = entry.kind === 'note';
  const isAgent = entry.kind === 'agent';

  return (
    <article className="flex gap-3">
      <Avatar name={entry.author} size="sm" />
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-fg">{entry.author}</span>
          {isAgent && <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[11px] font-semibold text-primary-text">Agent</span>}
          {isNote && (
            <span className="inline-flex items-center gap-1 rounded bg-warn-soft px-1.5 py-0.5 text-[11px] font-semibold text-warn">
              <Lock aria-hidden="true" className="h-3 w-3" />
              Internal note
            </span>
          )}
          {time}
        </header>
        <div
          className={cn(
            'mt-1.5 max-w-prose rounded-2xl rounded-tl-md border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-fg',
            isNote
              ? 'border-amber-500/30 bg-warn-soft'
              : isAgent
                ? 'border-primary/25 bg-primary-soft'
                : 'border-line bg-elevated/60',
          )}
        >
          {entry.body}
        </div>
      </div>
    </article>
  );
}

function Composer({
  customerName,
  agentName,
  macros,
  onSend,
}: {
  customerName: string;
  agentName: string;
  macros: Macro[];
  onSend: (body: string, mode: ComposerMode) => void;
}) {
  const [mode, setMode] = useState<ComposerMode>('reply');
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNote = mode === 'note';

  const applyMacro = (macro: Macro) => {
    const text = macro.body
      .replaceAll('{{first_name}}', firstName(customerName))
      .replaceAll('{{agent}}', firstName(agentName));
    const next = draft.trim() ? `${draft.trimEnd()}\n\n${text}` : text;
    setDraft(next);
    setMode('reply');
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.length, next.length);
    });
  };

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    onSend(body, mode);
    setDraft('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="border-t border-line p-3 lg:p-4"
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1 text-xs font-medium text-muted">
          <Zap aria-hidden="true" className="h-3.5 w-3.5" />
          Macros
        </span>
        {macros.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => applyMacro(m)}
            className={cn(
              'h-8 rounded-lg border border-line px-2.5 text-xs font-medium text-fg transition-colors duration-150 hover:border-primary/50 hover:bg-primary-soft',
              focusRing,
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'rounded-2xl border transition-colors duration-150 focus-within:ring-2',
          isNote
            ? 'border-amber-500/40 bg-warn-soft focus-within:ring-amber-500/30'
            : 'border-line bg-canvas/50 focus-within:border-primary focus-within:ring-primary/25',
        )}
      >
        <div role="tablist" aria-label="Message type" className="flex gap-1 px-2 pt-2">
          {(
            [
              { id: 'reply', label: 'Reply to customer', icon: Send },
              { id: 'note', label: 'Internal note', icon: Lock },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === mode;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(tab.id)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors duration-150',
                  focusRing,
                  active
                    ? tab.id === 'note'
                      ? 'bg-amber-500/20 text-warn'
                      : 'bg-primary-soft text-primary-text'
                    : 'text-muted hover:text-fg',
                )}
              >
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <label htmlFor="composer" className="sr-only">
          {isNote ? 'Internal note (only visible to your team)' : `Reply to ${customerName}`}
        </label>
        <textarea
          id="composer"
          ref={textareaRef}
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={isNote ? 'Add context for your team. Customers never see internal notes.' : `Write a reply to ${firstName(customerName)}…`}
          className="block w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-fg outline-none placeholder:text-muted"
        />
        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <p className="hidden items-center gap-1 text-xs text-muted sm:flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>↵</Kbd> to send
          </p>
          <button
            type="submit"
            disabled={!draft.trim()}
            className={cn(
              'ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
              focusRing,
              isNote ? 'bg-amber-700 hover:bg-amber-800' : 'bg-primary-strong hover:bg-blue-700',
            )}
          >
            {isNote ? <Lock aria-hidden="true" className="h-4 w-4" /> : <Send aria-hidden="true" className="h-4 w-4" />}
            {isNote ? 'Add note' : 'Send reply'}
          </button>
        </div>
      </div>
    </form>
  );
}
