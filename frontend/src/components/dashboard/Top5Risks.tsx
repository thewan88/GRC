'use client';

import Link from 'next/link';
import { riskLevelColor, cn } from '@/lib/utils';
import type { Risk } from '@/types';

interface Props { risks: Risk[] | undefined; }

export default function Top5Risks({ risks }: Props) {
  if (!risks?.length) {
    return <p className="text-sm text-gray-400">No open risks.</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {risks.map((risk) => (
        <Link key={risk.id} href={`/risks/${risk.id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400">{risk.risk_id}</p>
            <p className="truncate text-sm font-medium text-gray-900">{risk.title}</p>
            <p className="text-xs text-gray-500">{risk.category} · {risk.owner?.name ?? '—'}</p>
          </div>
          <div className="ml-3 flex flex-col items-end gap-1">
            <span className={cn('rounded-md border px-1.5 py-0.5 text-xs font-semibold', riskLevelColor(risk.risk_level))}>
              {risk.risk_level}
            </span>
            <span className="text-xs text-gray-400">Score {risk.inherent_score}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
