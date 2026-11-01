'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building, Circle, Filter, Moon, PanelRight, Sun, Ticket as TicketIcon } from 'lucide-react';
import {
  AGENT_STATUS_KEY,
  CURRENT_AGENT,
  customers as customerList,
  macros,
  seedNotifications,
  seedTickets,
} from '@/lib/data';
import { useDemoClock, usePersistentState, useTheme } from '@/lib/hooks';
import { AGENT_STATUSES, AGENT_STATUS_META, PRIORITY_META, QUICK_VIEWS, STATUS_META } from '@/lib/meta';
import type { AppNotification, ComposerMode, QuickView, Status, StatusFilter, Ticket } from '@/lib/types';
import { CommandPalette, type PaletteItem } from './command-palette';
import { CustomerDrawer, CustomerProfile } from './customer-panel';
import { Header } from './header';
import { KpiGrid } from './kpi-grid';
import { TicketQueue, type SortMode } from './ticket-queue';
import { TicketView } from './ticket-view';

const customerMap = new Map(customerList.map((c) => [c.id, c]));

function matchesView(t: Ticket, view: QuickView) {
  switch (view) {
    case 'mine':
      return t.assignee === CURRENT_AGENT;
    case 'urgent':
      return t.priority === 'urgent' || t.status === 'escalated';
    case 'unassigned':
      return t.assignee === null;
    default:
      return true;
  }
}

function matchesStatus(t: Ticket, filter: StatusFilter) {
  if (filter === 'all') return true;
  if (filter === 'active') return t.status !== 'resolved';
  return t.status === filter;
}

function matchesQuery(t: Ticket, q: string) {
  if (!q) return true;
  const c = customerMap.get(t.customerId);
  return `${t.id} ${t.subject} ${t.tags.join(' ')} ${c?.name ?? ''} ${c?.company ?? ''}`.toLowerCase().includes(q);
}

const lastActivity = (t: Ticket) => t.thread[t.thread.length - 1]?.at ?? t.createdAt;

export function SupportDashboard() {
  const { now, read: readClock } = useDemoClock();
  const { theme, toggleTheme } = useTheme();
  const [agentStatus, setAgentStatus] = usePersistentState(AGENT_STATUS_KEY, 'online', AGENT_STATUSES);

  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications);
  const [selectedId, setSelectedId] = useState<string>(seedTickets[0]?.id ?? '');
  const [view, setView] = useState<QuickView>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('priority');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'queue' | 'ticket'>('queue');

  // ---- Derived data ------------------------------------------------------
  const inView = useMemo(() => tickets.filter((t) => matchesView(t, view)), [tickets, view]);

  const statusCounts = useMemo(() => {
    const counts = { active: 0, open: 0, in_progress: 0, escalated: 0, resolved: 0, all: inView.length } as Record<StatusFilter, number>;
    for (const t of inView) {
      counts[t.status] += 1;
      if (t.status !== 'resolved') counts.active += 1;
    }
    return counts;
  }, [inView]);

  const viewCounts = useMemo(() => {
    const active = tickets.filter((t) => t.status !== 'resolved');
    return Object.fromEntries(QUICK_VIEWS.map((q) => [q.id, active.filter((t) => matchesView(t, q.id)).length])) as Record<
      QuickView,
      number
    >;
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = inView.filter((t) => matchesStatus(t, statusFilter) && matchesQuery(t, q));
    return list.sort((a, b) =>
      sort === 'priority'
        ? PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank || lastActivity(b) - lastActivity(a)
        : lastActivity(b) - lastActivity(a),
    );
  }, [inView, statusFilter, query, sort]);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;
  const selectedCustomer = selected ? customerMap.get(selected.customerId) ?? null : null;
  const relatedTickets = useMemo(
    () => (selected ? tickets.filter((t) => t.customerId === selected.customerId && t.status !== 'resolved') : []),
    [tickets, selected],
  );

  // ---- Actions -----------------------------------------------------------
  const updateTicket = useCallback((id: string, fn: (t: Ticket) => Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));
  }, []);

  const selectTicket = useCallback(
    (id: string) => {
      setSelectedId(id);
      setMobilePane('ticket');
      setDrawerOpen(false);
      updateTicket(id, (t) => (t.unread ? { ...t, unread: false } : t));
    },
    [updateTicket],
  );

  const handleSend = useCallback(
    (body: string, mode: ComposerMode) => {
      if (!selected) return;
      const at = readClock();
      updateTicket(selected.id, (t) => {
        const entry = { id: `e${t.thread.length + 1}-${at}`, kind: mode === 'note' ? 'note' : 'agent', author: CURRENT_AGENT, body, at } as const;
        if (mode === 'note') return { ...t, thread: [...t.thread, entry] };
        // Replying to a new ticket claims it and moves it to In progress.
        const claim = t.assignee === null;
        const progress = t.status === 'open';
        const system = progress
          ? [{ id: `s${at}`, kind: 'system' as const, author: 'System', body: `Status changed to ${STATUS_META.in_progress.label}`, at }]
          : [];
        return {
          ...t,
          assignee: claim ? CURRENT_AGENT : t.assignee,
          status: progress ? 'in_progress' : t.status,
          thread: [...t.thread, entry, ...system],
        };
      });
    },
    [selected, readClock, updateTicket],
  );

  const handleStatusChange = useCallback(
    (status: Status) => {
      if (!selected || selected.status === status) return;
      const at = readClock();
      updateTicket(selected.id, (t) => ({
        ...t,
        status,
        thread: [
          ...t.thread,
          { id: `s${at}`, kind: 'system', author: 'System', body: `${CURRENT_AGENT} changed status to ${STATUS_META[status].label}`, at },
        ],
      }));
    },
    [selected, readClock, updateTicket],
  );

  const openNotification = useCallback(
    (n: AppNotification) => {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      if (n.ticketId && tickets.some((t) => t.id === n.ticketId)) selectTicket(n.ticketId);
    },
    [tickets, selectTicket],
  );

  const markAllRead = useCallback(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const changeView = useCallback((v: QuickView) => {
    setView(v);
    setMobilePane('queue');
  }, []);

  // On phones/tablets the panes stack: bring the opened ticket into view.
  useEffect(() => {
    if (mobilePane !== 'ticket' || window.matchMedia('(min-width: 1024px)').matches) return;
    document.getElementById('ticket-pane')?.scrollIntoView({ block: 'start' });
  }, [mobilePane, selectedId]);

  // ---- Global keyboard shortcuts ----------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (paletteOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;

      if (e.key === '/') {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === 'j' || e.key === 'k') {
        if (visibleTickets.length === 0) return;
        const index = visibleTickets.findIndex((t) => t.id === selectedId);
        const nextIndex =
          index === -1 ? 0 : Math.min(visibleTickets.length - 1, Math.max(0, index + (e.key === 'j' ? 1 : -1)));
        const next = visibleTickets[nextIndex];
        if (next) {
          selectTicket(next.id);
          document.querySelector(`[data-ticket-id="${next.id}"]`)?.scrollIntoView({ block: 'nearest' });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, visibleTickets, selectedId, selectTicket]);

  // ---- Command palette items --------------------------------------------
  const paletteItems = useMemo<PaletteItem[]>(() => {
    const ticketItems: PaletteItem[] = tickets.map((t) => {
      const c = customerMap.get(t.customerId);
      return {
        id: `t-${t.id}`,
        group: 'Tickets',
        label: t.subject,
        hint: t.id,
        icon: TicketIcon,
        keywords: `${c?.name ?? ''} ${c?.company ?? ''} ${t.tags.join(' ')} ${STATUS_META[t.status].label}`,
        run: () => selectTicket(t.id),
      };
    });
    const customerItems: PaletteItem[] = customerList.map((c) => ({
      id: `c-${c.id}`,
      group: 'Customers',
      label: `${c.name} — ${c.company}`,
      hint: c.plan,
      icon: Building,
      keywords: c.email,
      run: () => {
        const latest = tickets
          .filter((t) => t.customerId === c.id)
          .sort((a, b) => lastActivity(b) - lastActivity(a))[0];
        if (latest) {
          selectTicket(latest.id);
          setDrawerOpen(true);
        }
      },
    }));
    const actionItems: PaletteItem[] = [
      {
        id: 'a-theme',
        group: 'Actions',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        icon: theme === 'dark' ? Sun : Moon,
        keywords: 'appearance mode',
        run: toggleTheme,
      },
      ...QUICK_VIEWS.map<PaletteItem>((q) => ({
        id: `a-view-${q.id}`,
        group: 'Actions',
        label: `Show: ${q.label}`,
        icon: Filter,
        keywords: 'filter view queue',
        run: () => {
          changeView(q.id);
          setStatusFilter('active');
        },
      })),
      ...AGENT_STATUSES.map<PaletteItem>((s) => ({
        id: `a-status-${s}`,
        group: 'Actions',
        label: `Set my status: ${AGENT_STATUS_META[s].label}`,
        icon: Circle,
        keywords: 'availability presence agent',
        run: () => setAgentStatus(s),
      })),
      {
        id: 'a-customer',
        group: 'Actions',
        label: 'Open customer details',
        icon: PanelRight,
        keywords: 'profile history drawer',
        run: () => setDrawerOpen(true),
      },
    ];
    return [...ticketItems, ...customerItems, ...actionItems];
  }, [tickets, theme, toggleTheme, selectTicket, changeView, setAgentStatus]);

  const viewLabel = QUICK_VIEWS.find((q) => q.id === view)?.label ?? 'All tickets';

  const profile =
    selected && selectedCustomer ? (
      <CustomerProfile
        customer={selectedCustomer}
        relatedTickets={relatedTickets}
        currentTicketId={selected.id}
        onSelectTicket={selectTicket}
        now={now}
      />
    ) : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#queue"
        className="sr-only z-50 rounded-lg bg-primary-strong px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to ticket queue
      </a>

      <Header
        agentName={CURRENT_AGENT}
        view={view}
        viewCounts={viewCounts}
        onViewChange={changeView}
        onOpenPalette={() => setPaletteOpen(true)}
        agentStatus={agentStatus}
        onAgentStatusChange={setAgentStatus}
        notifications={notifications}
        now={now}
        onOpenNotification={openNotification}
        onMarkAllRead={markAllRead}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="px-4 pt-4 lg:px-6">
        <KpiGrid tickets={tickets} />
      </div>

      <main className="flex flex-1 flex-col px-4 py-4 lg:px-6">
        <div className="grid flex-1 gap-4 lg:h-[calc(100dvh-9rem)] lg:min-h-[620px] 2xl:h-[calc(100dvh-6rem)] lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)] 3xl:grid-cols-[420px_minmax(0,1fr)_360px]">
          <section
            id="queue"
            aria-label="Ticket queue"
            className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface ${mobilePane === 'ticket' ? 'hidden lg:flex' : ''}`}
          >
            <TicketQueue
              tickets={visibleTickets}
              customers={customerMap}
              selectedId={selectedId}
              onSelect={selectTicket}
              statusFilter={statusFilter}
              statusCounts={statusCounts}
              onStatusFilterChange={setStatusFilter}
              query={query}
              onQueryChange={setQuery}
              sort={sort}
              onSortChange={setSort}
              viewLabel={viewLabel}
              now={now}
            />
          </section>

          <section
            id="ticket-pane"
            aria-label="Active ticket"
            className={`flex h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface lg:h-auto ${mobilePane === 'queue' ? 'hidden lg:flex' : ''}`}
          >
            {selected && selectedCustomer ? (
              <TicketView
                ticket={selected}
                customer={selectedCustomer}
                agentName={CURRENT_AGENT}
                macros={macros}
                now={now}
                onSend={handleSend}
                onStatusChange={handleStatusChange}
                onOpenCustomer={() => setDrawerOpen(true)}
                onBack={() => setMobilePane('queue')}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted">
                Select a ticket from the queue to start working.
              </div>
            )}
          </section>

          <aside
            aria-label="Customer details"
            className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface 3xl:flex"
          >
            <h2 className="border-b border-line px-5 py-4 text-sm font-semibold text-fg">Customer</h2>
            <div className="flex-1 overflow-y-auto">{profile}</div>
          </aside>
        </div>
      </main>

      <CustomerDrawer open={drawerOpen} onClose={closeDrawer}>
        {profile}
      </CustomerDrawer>

      <CommandPalette open={paletteOpen} onClose={closePalette} items={paletteItems} />
    </div>
  );
}
