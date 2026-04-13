'use client';

import Link from 'next/link';
import { AlertTriangle, AlertOctagon, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardSummary } from '@/types';

interface Props {
  summary: DashboardSummary | undefined;
}

const levels = [
  { key: 'Critical', label: 'Critical', icon: AlertOctagon, color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
  { key: 'High',     label: 'High',     icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { key: 'Medium',   label: 'Medium',   icon: AlertCircle,   color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { key: 'Low',      label: 'Low',      icon: CheckCircle,   color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
] as const;

export default function RiskSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {levels.map(({ key, label, icon: Icon, color, bg, border }) => {
        const count = summary?.risks_by_level?.[key] ?? 0;
        return (
          <Link key={key} href={`/risks?status=Open&level=${key}`}>
            <Card className={`border ${border} ${bg} transition-shadow hover:shadow-md`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label} Risk</p>
                    <p className={`mt-1 text-3xl font-bold ${color}`}>{count}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${color} opacity-70`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
