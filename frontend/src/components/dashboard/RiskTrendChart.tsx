'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RiskTrendPoint } from '@/types';

interface Props { data: RiskTrendPoint[] | undefined; }

const COLORS = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#f59e0b',
  Low:      '#22c55e',
};

export default function RiskTrendChart({ data }: Props) {
  if (!data?.length) {
    return <div className="flex h-48 items-center justify-center text-sm text-gray-400">No trend data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          {Object.entries(COLORS).map(([level, color]) => (
            <linearGradient key={level} id={`grad-${level}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {(['Critical', 'High', 'Medium', 'Low'] as const).map((level) => (
          <Area
            key={level}
            type="monotone"
            dataKey={level}
            stackId="1"
            stroke={COLORS[level]}
            fill={`url(#grad-${level})`}
            strokeWidth={1.5}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
