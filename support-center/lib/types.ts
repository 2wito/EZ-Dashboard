export type Status = 'open' | 'in_progress' | 'escalated' | 'resolved';
export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type Channel = 'email' | 'chat' | 'phone';
export type AgentStatus = 'online' | 'away' | 'offline';
export type QuickView = 'all' | 'mine' | 'urgent' | 'unassigned';
export type StatusFilter = 'active' | Status | 'all';
export type ComposerMode = 'reply' | 'note';
export type Theme = 'dark' | 'light';

export interface PastTicket {
  id: string;
  subject: string;
  status: Status;
  at: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  location: string;
  customerSince: number;
  lifetimeTickets: number;
  csat: number;
  mrr: number;
  history: PastTicket[];
}

export interface ThreadEntry {
  id: string;
  kind: 'customer' | 'agent' | 'note' | 'system';
  author: string;
  body: string;
  at: number;
}

export interface Ticket {
  id: string;
  subject: string;
  customerId: string;
  status: Status;
  priority: Priority;
  channel: Channel;
  tags: string[];
  assignee: string | null;
  createdAt: number;
  slaDueAt: number | null;
  unread: boolean;
  thread: ThreadEntry[];
}

export interface AppNotification {
  id: string;
  kind: 'sla' | 'escalation' | 'mention' | 'csat';
  title: string;
  body: string;
  at: number;
  ticketId: string | null;
  read: boolean;
}

export interface Macro {
  id: string;
  label: string;
  body: string;
}

export interface KpiSeries {
  open: number[];
  responseMinutes: number[];
  csat: number[];
  escalations: number[];
}
