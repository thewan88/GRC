'use client';

import Link from 'next/link';
import { format, parseISO, differenceInDays } from 'date-fns';
import { AlertTriangle, Database } from 'lucide-react';
import { riskLevelColor, cn } from '@/lib/utils';
import type { UpcomingItem } from '@/types';

interface Props { items: UpcomingItem[] | undefined; }

export default function UpcomingReviews({ items }: Props) {
  if (!items?.length) {
    return <p className="text-sm text-gray-400">No reviews due in the next 30 days.</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => {
        const href     = item.type === 'risk' ? `/risks/${item.id}` : `/assets/${item.id}`;
        const daysLeft = differenceInDays(parseISO(item.review_date), new Date());
        const urgent   = daysLeft <= 7;

        return (
          <Link key={`${item.type}-${item.id}`} href={href} className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
            <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', item.type === 'risk' ? 'bg-orange-100' : 'bg-blue-100')}>
              {item.type === 'risk'
                ? <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                : <Database className="h-3.5 w-3.5 text-blue-600" />
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">{item.ref}</p>
              <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn('text-xs font-medium', urgent ? 'text-red-600' : 'text-gray-600')}>
                {format(parseISO(item.review_date), 'dd MMM')}
              </p>
              <p className="text-xs text-gray-400">{daysLeft}d</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
