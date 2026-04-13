'use client';

import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  stats: { overdue: number; dueSoon: number; onTrack: number } | undefined;
}

export default function TreatmentPlanStatus({ stats }: Props) {
  const items = [
    { label: 'Overdue',      count: stats?.overdue  ?? 0, icon: AlertCircle,  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
    { label: 'Due ≤30 days', count: stats?.dueSoon  ?? 0, icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
    { label: 'On Track',     count: stats?.onTrack  ?? 0, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  ];

  return (
    <div className="space-y-2">
      {items.map(({ label, count, icon: Icon, color, bg, border }) => (
        <div key={label} className={`flex items-center justify-between rounded-md border ${border} ${bg} px-4 py-3`}>
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          <span className={`text-lg font-bold ${color}`}>{count}</span>
        </div>
      ))}
    </div>
  );
}
