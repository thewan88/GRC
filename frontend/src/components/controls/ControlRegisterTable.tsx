'use client';

import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, controlStatusColor } from '@/lib/utils';
import { useControls } from '@/hooks/useControls';
import ControlDetailPanel from './ControlDetailPanel';
import type { Control, ControlTheme } from '@/types';

const THEME_ORDER: ControlTheme[] = ['Organisational', 'People', 'Physical', 'Technological'];

const THEME_ICONS: Record<ControlTheme, string> = {
  Organisational: '🏛️',
  People:         '👥',
  Physical:       '🔒',
  Technological:  '💻',
};

const STATUS_ORDER = ['Not Implemented', 'Planned', 'Partially Implemented', 'Implemented', 'Tested', 'Not Applicable'];

export default function ControlRegisterTable() {
  const { data, isLoading } = useControls();
  const controls = data?.data ?? [];
  const [expanded, setExpanded]       = useState<Record<ControlTheme, boolean>>({
    Organisational: true, People: true, Physical: true, Technological: true,
  });
  const [selected, setSelected]       = useState<Control | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch]           = useState('');

  const filtered = useMemo(() => {
    return controls.filter((c) => {
      const matchStatus = !filterStatus || c.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch = !q || c.control_ref.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [controls, filterStatus, search]);

  const byTheme = useMemo(() => {
    const map: Record<ControlTheme, Control[]> = {
      Organisational: [], People: [], Physical: [], Technological: [],
    };
    for (const c of filtered) if (c.theme in map) map[c.theme].push(c);
    return map;
  }, [filtered]);

  // Stats
  const stats = useMemo(() => {
    const total      = controls.length;
    const applicable = controls.filter((c) => c.status !== 'Not Applicable').length;
    const implemented = controls.filter((c) => c.status === 'Implemented' || c.status === 'Tested').length;
    const pct = applicable > 0 ? Math.round((implemented / applicable) * 100) : 0;
    return { total, applicable, implemented, pct };
  }, [controls]);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main table */}
      <div className="flex-1 min-w-0">
        {/* Stats bar */}
        <div className="mb-4 grid grid-cols-4 gap-3">
          {[
            { label: 'Total Controls', value: stats.total },
            { label: 'Applicable', value: stats.applicable },
            { label: 'Implemented', value: stats.implemented },
            { label: 'Compliance', value: `${stats.pct}%` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search controls..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/controls/soa`)}
            >
              <Download className="h-3.5 w-3.5" />
              SoA CSV
            </Button>
          </div>
        </div>

        {/* Grouped table */}
        <div className="space-y-4">
          {THEME_ORDER.map((theme) => {
            const themeControls = byTheme[theme];
            if (themeControls.length === 0) return null;
            const isOpen = expanded[theme];
            const implemented = themeControls.filter((c) => c.status === 'Implemented' || c.status === 'Tested').length;
            const applicable  = themeControls.filter((c) => c.status !== 'Not Applicable').length;

            return (
              <div key={theme} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setExpanded((p) => ({ ...p, [theme]: !p[theme] }))}
                  className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{THEME_ICONS[theme]}</span>
                    <span className="font-semibold text-gray-900">{theme}</span>
                    <span className="text-sm text-gray-400">({themeControls.length} controls)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {implemented}/{applicable} implemented
                    </span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-green-400"
                        style={{ width: `${applicable > 0 ? (implemented / applicable) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isOpen && (
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 w-24">Ref</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Control</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 w-44">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 w-32">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {themeControls.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelected(c)}
                          className={cn(
                            'cursor-pointer hover:bg-blue-50',
                            selected?.id === c.id && 'bg-blue-50',
                          )}
                        >
                          <td className="px-4 py-2.5">
                            <span className="font-mono text-xs font-semibold text-gray-600">{c.control_ref}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-gray-900">{c.name}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', controlStatusColor(c.status))}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500">{c.owner?.name ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-96 flex-shrink-0">
          <ControlDetailPanel
            control={selected}
            onClose={() => setSelected(null)}
            onUpdated={(updated) => setSelected(updated)}
          />
        </div>
      )}
    </div>
  );
}
