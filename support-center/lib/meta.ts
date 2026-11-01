import {
  ArrowDown,
  ArrowUp,
  Mail,
  MessageSquare,
  Minus,
  Phone,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { AgentStatus, Channel, Priority, QuickView, Status, StatusFilter } from './types';

export const STATUS_META: Record<Status, { label: string; badge: string; dot: string }> = {
  open: { label: 'Open', badge: 'bg-info-soft text-info', dot: 'bg-primary' },
  in_progress: { label: 'In progress', badge: 'bg-warn-soft text-warn', dot: 'bg-warn' },
  escalated: { label: 'Escalated', badge: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  resolved: { label: 'Resolved', badge: 'bg-ok-soft text-ok', dot: 'bg-ok' },
};

export const PRIORITY_META: Record<Priority, { label: string; icon: LucideIcon; text: string; bar: string; rank: number }> = {
  urgent: { label: 'Urgent', icon: TriangleAlert, text: 'text-danger', bar: 'bg-danger', rank: 0 },
  high: { label: 'High', icon: ArrowUp, text: 'text-warn', bar: 'bg-warn', rank: 1 },
  normal: { label: 'Normal', icon: Minus, text: 'text-muted', bar: 'bg-primary/60', rank: 2 },
  low: { label: 'Low', icon: ArrowDown, text: 'text-muted', bar: 'bg-line', rank: 3 },
};

export const CHANNEL_META: Record<Channel, { label: string; icon: LucideIcon }> = {
  email: { label: 'Email', icon: Mail },
  chat: { label: 'Chat', icon: MessageSquare },
  phone: { label: 'Phone', icon: Phone },
};

export const AGENT_STATUS_META: Record<AgentStatus, { label: string; dot: string; hint: string }> = {
  online: { label: 'Online', dot: 'bg-emerald-500', hint: 'Receiving new tickets' },
  away: { label: 'Away', dot: 'bg-amber-500', hint: 'Paused from auto-assignment' },
  offline: { label: 'Offline', dot: 'bg-slate-500', hint: 'Signed out of the queue' },
};
export const AGENT_STATUSES = ['online', 'away', 'offline'] as const satisfies readonly AgentStatus[];

export const QUICK_VIEWS: { id: QuickView; label: string }[] = [
  { id: 'all', label: 'All tickets' },
  { id: 'mine', label: 'Assigned to me' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'unassigned', label: 'Unassigned' },
];

export const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'escalated', label: 'Escalated' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'All' },
];
