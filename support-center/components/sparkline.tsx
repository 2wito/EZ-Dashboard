'use client';

import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

export type SparkKind = 'area' | 'line' | 'bar';

interface SparklineProps {
  id: string;
  data: number[];
  kind: SparkKind;
  /** Any CSS color, e.g. `var(--primary)`. */
  color: string;
  format: (value: number) => string;
}

function SparkTooltip({
  active,
  payload,
  format,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: unknown }>;
  format: (value: number) => string;
}) {
  const value = payload?.[0]?.value;
  if (!active || typeof value !== 'number') return null;
  return (
    <div className="rounded-md border border-line bg-elevated px-2 py-1 text-xs font-medium text-fg tabular-nums shadow-lg">
      {format(value)}
    </div>
  );
}

export default function Sparkline({ id, data, kind, color, format }: SparklineProps) {
  const points = useMemo(() => data.map((v, i) => ({ i, v })), [data]);
  const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tooltip = (
    <Tooltip
      cursor={false}
      isAnimationActive={false}
      allowEscapeViewBox={{ x: true, y: true }}
      content={(props) => <SparkTooltip active={props.active} payload={props.payload} format={format} />}
    />
  );
  const margin = { top: 4, right: 2, bottom: 2, left: 2 };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {kind === 'bar' ? (
        <BarChart data={points} margin={margin} barCategoryGap="22%">
          <YAxis hide domain={[0, 'dataMax']} />
          {tooltip}
          <Bar dataKey="v" radius={[2, 2, 0, 0]} isAnimationActive={animate}>
            {points.map((p) => (
              <Cell key={p.i} fill={color} fillOpacity={p.i === points.length - 1 ? 1 : 0.35} />
            ))}
          </Bar>
        </BarChart>
      ) : kind === 'line' ? (
        <LineChart data={points} margin={margin}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          {tooltip}
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: color }}
            isAnimationActive={animate}
          />
        </LineChart>
      ) : (
        <AreaChart data={points} margin={margin}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          {tooltip}
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${id})`}
            activeDot={{ r: 3, strokeWidth: 0, fill: color }}
            isAnimationActive={animate}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}
