'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Gauge, Inbox, Star, TrendingDown, TrendingUp, TriangleAlert, type LucideIcon } from 'lucide-react';
import { kpiSeries } from '@/lib/data';
import type { Ticket } from '@/lib/types';
import { cn, percentChange } from '@/lib/utils';
import type { SparkKind } from './sparkline';

// Recharts measures the DOM, so render it client-side only; the fixed-height slot prevents layout shift.
const Sparkline = dynamic(() => import('./sparkline'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-md bg-elevated/60" />,
});

interface KpiDef {
  id: string;
  label: string;
  icon: LucideIcon;
  series: number[];
  kind: SparkKind;
  color: string;
  format: (v: number) => string;
  /** Whether a falling value is good news (drives delta color). */
  lowerIsBetter: boolean;
  caption: string;
}

export function KpiGrid({ tickets }: { tickets: Ticket[] }) {
  const liveOpen = tickets.filter((t) => t.status !== 'resolved').length;
  const liveEscalations = tickets.filter((t) => t.status === 'escalated').length;

  const kpis = useMemo<KpiDef[]>(
    () => [
      {
        id: 'open',
        label: 'Open tickets',
        icon: Inbox,
        series: [...kpiSeries.open, liveOpen],
        kind: 'area',
        color: 'var(--primary)',
        format: (v) => `${v} open`,
        lowerIsBetter: true,
        caption: 'Across all queues',
      },
      {
        id: 'response',
        label: 'Avg. first response',
        icon: Gauge,
        series: kpiSeries.responseMinutes,
        kind: 'line',
        color: 'var(--ok)',
        format: (v) => `${v.toFixed(1)} min`,
        lowerIsBetter: true,
        caption: 'Target < 15 min',
      },
      {
        id: 'csat',
        label: 'CSAT score',
        icon: Star,
        series: kpiSeries.csat,
        kind: 'area',
        color: 'var(--warn)',
        format: (v) => `${v.toFixed(1)}%`,
        lowerIsBetter: false,
        caption: 'Rolling 7 days',
      },
      {
        id: 'escalations',
        label: 'Escalations',
        icon: TriangleAlert,
        series: [...kpiSeries.escalations, liveEscalations],
        kind: 'bar',
        color: 'var(--danger)',
        format: (v) => `${v} escalated`,
        lowerIsBetter: true,
        caption: 'Tier 2 & engineering',
      },
    ],
    [liveOpen, liveEscalations],
  );

  return (
    <section aria-label="Key metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </section>
  );
}

function KpiCard({ kpi }: { kpi: KpiDef }) {
  const first = kpi.series[0] ?? 0;
  const last = kpi.series[kpi.series.length - 1] ?? 0;
  const delta = percentChange(first, last);
  const rising = delta > 0;
  const good = kpi.lowerIsBetter ? delta <= 0 : delta >= 0;
  const TrendIcon = rising ? TrendingUp : TrendingDown;
  const Icon = kpi.icon;

  const valueText =
    kpi.id === 'response'
      ? last.toFixed(1)
      : kpi.id === 'csat'
        ? last.toFixed(1)
        : String(last);
  const unit = kpi.id === 'response' ? 'min' : kpi.id === 'csat' ? '%' : '';

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-primary/40">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-muted">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-elevated text-fg">
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
          {kpi.label}
        </h3>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
            good ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger',
          )}
        >
          <TrendIcon aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="sr-only">{rising ? 'Up' : 'Down'} vs. 12 hours ago</span>
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-3xl font-semibold tracking-tight text-fg tabular-nums">
            {valueText}
            {unit && <span className="ml-1 text-base font-medium text-muted">{unit}</span>}
          </p>
          <p className="mt-1 truncate text-xs text-muted">
            {kpi.caption}
          </p>
        </div>
        <div className="h-12 w-28 shrink-0 sm:w-32" aria-hidden="true">
          <Sparkline id={kpi.id} data={kpi.series} kind={kpi.kind} color={kpi.color} format={kpi.format} />
        </div>
      </div>
    </article>
  );
}
