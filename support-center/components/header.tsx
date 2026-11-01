'use client';

import { useCallback, useState } from 'react';
import { AtSign, Bell, Check, ChevronDown, Clock, Headset, Moon, Search, Star, Sun, TriangleAlert } from 'lucide-react';
import { AGENT_STATUSES, AGENT_STATUS_META, QUICK_VIEWS } from '@/lib/meta';
import { useDismiss, useIsMac } from '@/lib/hooks';
import type { AgentStatus, AppNotification, QuickView, Theme } from '@/lib/types';
import { cn, focusRing, relativeTime } from '@/lib/utils';
import { Avatar, Kbd } from './ui';

interface HeaderProps {
  agentName: string;
  view: QuickView;
  viewCounts: Record<QuickView, number>;
  onViewChange: (view: QuickView) => void;
  onOpenPalette: () => void;
  agentStatus: AgentStatus;
  onAgentStatusChange: (status: AgentStatus) => void;
  notifications: AppNotification[];
  now: number;
  onOpenNotification: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const iconButton = cn(
  'relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg',
  focusRing,
);

export function Header(props: HeaderProps) {
  const isMac = useIsMac();

  return (
    <header className="glass sticky top-0 z-30 border-b">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-strong text-white shadow-lg shadow-primary/20">
            <Headset aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-fg">Support Center</p>
            <p className="text-xs text-muted">Tier 1 · EMEA</p>
          </div>
        </div>

        <button
          type="button"
          onClick={props.onOpenPalette}
          className={cn(
            'ml-2 hidden h-10 max-w-sm flex-1 items-center gap-2 rounded-xl border border-line bg-surface/60 px-3 text-sm text-muted transition-colors duration-150 hover:border-primary/50 hover:text-fg md:flex',
            focusRing,
          )}
        >
          <Search aria-hidden="true" className="h-4 w-4" />
          <span className="flex-1 truncate text-left">Search tickets, customers, actions…</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        <QuickFilters
          className="ml-2 hidden 2xl:flex"
          view={props.view}
          counts={props.viewCounts}
          onChange={props.onViewChange}
        />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={props.onOpenPalette} className={cn(iconButton, 'md:hidden')} aria-label="Search">
            <Search aria-hidden="true" className="h-5 w-5" />
          </button>
          <AgentStatusMenu status={props.agentStatus} onChange={props.onAgentStatusChange} />
          <NotificationCenter
            notifications={props.notifications}
            now={props.now}
            onOpen={props.onOpenNotification}
            onMarkAllRead={props.onMarkAllRead}
          />
          <button
            type="button"
            onClick={props.onToggleTheme}
            className={iconButton}
            aria-label={props.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {props.theme === 'dark' ? (
              <Sun aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Moon aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
          <span className="ml-1 hidden sm:inline-flex" title={props.agentName}>
            <Avatar name={props.agentName} size="sm" presence={AGENT_STATUS_META[props.agentStatus].dot} />
          </span>
        </div>
      </div>

      <div className="border-t border-line/60 px-4 py-2 lg:px-6 2xl:hidden">
        <QuickFilters view={props.view} counts={props.viewCounts} onChange={props.onViewChange} />
      </div>
    </header>
  );
}

function QuickFilters({
  view,
  counts,
  onChange,
  className,
}: {
  view: QuickView;
  counts: Record<QuickView, number>;
  onChange: (view: QuickView) => void;
  className?: string;
}) {
  return (
    <nav aria-label="Quick filters" className={cn('no-scrollbar flex gap-1 overflow-x-auto', className)}>
      {QUICK_VIEWS.map((q) => {
        const active = q.id === view;
        return (
          <button
            key={q.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(q.id)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-150',
              focusRing,
              active ? 'bg-primary-soft text-primary-text' : 'text-muted hover:bg-elevated hover:text-fg',
            )}
          >
            {q.label}
            <span
              className={cn(
                'min-w-6 rounded-md px-1.5 text-center text-xs tabular-nums',
                active ? 'bg-primary/20' : 'bg-elevated',
              )}
            >
              {counts[q.id]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function AgentStatusMenu({ status, onChange }: { status: AgentStatus; onChange: (s: AgentStatus) => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const meta = AGENT_STATUS_META[status];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Agent status: ${meta.label}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-xl border border-line px-2.5 text-sm font-medium text-fg transition-colors duration-150 hover:bg-elevated sm:px-3',
          focusRing,
        )}
      >
        <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full', meta.dot, status === 'online' && 'shadow-[0_0_0_3px_rgb(16_185_129/0.2)]')} />
        <span className="hidden sm:inline">{meta.label}</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div role="menu" aria-label="Set your status" className="glass absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border p-1.5 shadow-2xl">
          {AGENT_STATUSES.map((s) => {
            const m = AGENT_STATUS_META[s];
            return (
              <button
                key={s}
                type="button"
                role="menuitemradio"
                aria-checked={s === status}
                onClick={() => {
                  onChange(s);
                  close();
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-elevated',
                  focusRing,
                )}
              >
                <span aria-hidden="true" className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', m.dot)} />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-fg">{m.label}</span>
                  <span className="block text-xs text-muted">{m.hint}</span>
                </span>
                {s === status && <Check aria-hidden="true" className="mt-1 h-4 w-4 text-primary-text" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const NOTIFICATION_ICON = {
  sla: { icon: Clock, tone: 'bg-danger-soft text-danger' },
  escalation: { icon: TriangleAlert, tone: 'bg-warn-soft text-warn' },
  mention: { icon: AtSign, tone: 'bg-info-soft text-info' },
  csat: { icon: Star, tone: 'bg-ok-soft text-ok' },
} as const;

function NotificationCenter({
  notifications,
  now,
  onOpen,
  onMarkAllRead,
}: {
  notifications: AppNotification[];
  now: number;
  onOpen: (n: AppNotification) => void;
  onMarkAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
        className={iconButton}
      >
        <Bell aria-hidden="true" className="h-5 w-5" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-canvas"
          >
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="glass fixed inset-x-4 top-16 z-40 mt-2 rounded-2xl border shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-fg">Notifications</h2>
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unread === 0}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium text-primary-text transition-colors hover:bg-primary-soft disabled:cursor-default disabled:text-muted disabled:hover:bg-transparent',
                focusRing,
              )}
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto p-1.5">
            {notifications.map((n) => {
              const meta = NOTIFICATION_ICON[n.kind];
              const Icon = meta.icon;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpen(n);
                      close();
                    }}
                    className={cn(
                      'flex w-full gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-150 hover:bg-elevated',
                      focusRing,
                    )}
                  >
                    <span className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn('truncate text-sm', n.read ? 'text-muted' : 'font-semibold text-fg')}>
                          {n.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted tabular-nums">{relativeTime(n.at, now)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted">{n.body}</span>
                    </span>
                    {!n.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary">
                        <span className="sr-only">Unread</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
