'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime } from '@/lib/utils';
import { useAuditLog } from '@/hooks/useAuditLog';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function AuditLogPage() {
  const [page, setPage]                       = useState(1);
  const [filterAction, setFilterAction]       = useState('');
  const [filterResource, setFilterResource]   = useState('');

  const { data, isLoading } = useAuditLog({
    page,
    per_page: 50,
    action:        filterAction  || undefined,
    resource_type: filterResource || undefined,
  });

  const entries = data?.data ?? [];
  const meta    = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500">Immutable audit trail of all create, update and delete events.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/audit-log/export/csv`)}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select
          value={filterResource}
          onChange={(e) => { setFilterResource(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All resource types</option>
          <option value="Risk">Risk</option>
          <option value="Asset">Asset</option>
          <option value="Control">Control</option>
          <option value="User">User</option>
        </select>
        {meta && (
          <p className="ml-auto self-center text-sm text-gray-500">{meta.total} entries</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['Timestamp', 'User', 'Action', 'Resource', 'Ref', 'Changed Fields'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">No audit log entries found.</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(entry.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-900">{entry.user.name ?? entry.user.email}</p>
                      <p className="text-xs text-gray-400">{entry.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', ACTION_COLORS[entry.action] ?? 'bg-gray-100 text-gray-600')}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{entry.resource_type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{entry.resource_ref ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {entry.changed_fields?.length > 0
                        ? entry.changed_fields.join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total > meta.per_page && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {Math.ceil(meta.total / meta.per_page)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(meta.total / meta.per_page)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
