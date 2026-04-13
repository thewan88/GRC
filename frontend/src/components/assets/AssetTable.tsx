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
import { cn, formatDate, classificationColor } from '@/lib/utils';
import { useAssets } from '@/hooks/useAssets';
import type { Asset, AssetType } from '@/types';

const TYPE_ICONS: Record<AssetType, string> = {
  Data:     '💾',
  System:   '🖥️',
  Software: '📦',
  People:   '👤',
  Physical: '🏢',
  Service:  '🔧',
};

export default function AssetTable() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const { data, isLoading } = useAssets();
  const assets = data?.data ?? [];

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'asset_id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">{row.original.asset_id}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-base">{TYPE_ICONS[row.original.asset_type]}</span>
          <Link href={`/assets/${row.original.id}`} className="font-medium text-gray-900 hover:text-blue-700 hover:underline">
            {row.original.name}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'asset_type',
      header: 'Type',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'classification',
      header: 'Classification',
      cell: ({ getValue }) => {
        const cls = getValue<string>();
        return (
          <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', classificationColor(cls))}>
            {cls}
          </span>
        );
      },
    },
    {
      id: 'personal_data',
      header: 'Personal Data',
      cell: ({ row }) => (
        <span className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          row.original.is_personal_data ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500',
        )}>
          {row.original.is_personal_data ? 'Yes' : 'No'}
        </span>
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            status === 'Disposed' ? 'bg-red-100 text-red-700' :
            status === 'Archived' ? 'bg-gray-100 text-gray-600' :
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
        <Link href={`/assets/${row.original.id}`} className="text-gray-400 hover:text-blue-600">
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  const table = useReactTable({
    data: assets,
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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{assets.length} assets</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/assets/export/csv`)}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => router.push('/assets/new')}>
            Register New Asset
          </Button>
        </div>
      </div>

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
                  No assets registered yet.{' '}
                  <Link href="/assets/new" className="text-blue-600 hover:underline">Register your first asset</Link>
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
