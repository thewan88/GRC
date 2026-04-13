'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RiskScoreBadge from './RiskScoreBadge';
import { formatDate, cn } from '@/lib/utils';
import { useRisks } from '@/hooks/useRisks';
import type { Risk, FcaTag } from '@/types';

const FCA_TAG_COLORS: Record<FcaTag, string> = {
  'SYSC':                  'bg-purple-100 text-purple-800 border-purple-200',
  'COBS':                  'bg-sky-100 text-sky-800 border-sky-200',
  'MAR':                   'bg-pink-100 text-pink-800 border-pink-200',
  'Operational Resilience': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function RiskTable() {
  const router      = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'inherent_score', desc: true }]);
  const { data, isLoading } = useRisks();
  const risks = data?.data ?? [];

  const columns: ColumnDef<Risk>[] = [
    {
      accessorKey: 'risk_id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">{row.original.risk_id}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <Link href={`/risks/${row.original.id}`} className="font-medium text-gray-900 hover:text-blue-700 hover:underline">
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600">{getValue<string>()}</span>
      ),
    },
    {
      id: 'fca_tags',
      header: 'FCA Tags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.fca_tags?.map((tag) => (
            <span key={tag} className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', FCA_TAG_COLORS[tag])}>
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'owner',
      header: 'Owner',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.owner?.name ?? '—'}</span>
      ),
    },
    {
      id: 'inherent_score',
      accessorFn: (r) => r.inherent_score,
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Inherent <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <RiskScoreBadge score={row.original.inherent_score} level={row.original.risk_level} size="sm" />
      ),
    },
    {
      id: 'residual_score',
      accessorFn: (r) => r.residual_score,
      header: 'Residual',
      cell: ({ row }) => (
        <RiskScoreBadge score={row.original.residual_score} level={row.original.residual_level} size="sm" />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            status === 'Closed'    ? 'bg-gray-100 text-gray-600' :
            status === 'In Review' ? 'bg-blue-100 text-blue-700' :
                                     'bg-green-100 text-green-700',
          )}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'review_date',
      header: 'Review',
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-500">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link href={`/risks/${row.original.id}`} className="text-gray-400 hover:text-blue-600">
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  const table = useReactTable({
    data: risks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{risks.length} risks</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/risks/export/csv`)}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => router.push('/risks/new')}>
            Register New Risk
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                  No risks registered yet.{' '}
                  <Link href="/risks/new" className="text-blue-600 hover:underline">Register your first risk</Link>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
