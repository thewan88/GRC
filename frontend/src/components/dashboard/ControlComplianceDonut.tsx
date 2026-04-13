'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardSummary } from '@/types';

interface Props { summary: DashboardSummary | undefined; }

const THEME_COLORS: Record<string, string> = {
  Organisational: '#2563eb',
  People:         '#7c3aed',
  Physical:       '#059669',
  Technological:  '#d97706',
};

export default function ControlComplianceDonut({ summary }: Props) {
  const themes = ['Organisational', 'People', 'Physical', 'Technological'];

  return (
    <div className="grid grid-cols-2 gap-4">
      {themes.map((theme) => {
        const stats      = summary?.control_compliance?.[theme as keyof typeof summary.control_compliance];
        const pct        = stats?.percentage ?? 0;
        const color      = THEME_COLORS[theme];
        const chartData  = [
          { name: 'Implemented', value: pct },
          { name: 'Remaining',   value: 100 - pct },
        ];

        return (
          <div key={theme} className="flex flex-col items-center">
            <div className="relative h-28 w-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={36} outerRadius={52} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                    <Cell fill={color} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{pct}%</span>
              </div>
            </div>
            <p className="mt-1 text-center text-xs font-medium text-gray-700">{theme}</p>
            <p className="text-center text-xs text-gray-400">
              {stats?.implemented ?? 0}/{stats?.applicable ?? 0} controls
            </p>
          </div>
        );
      })}
    </div>
  );
}
