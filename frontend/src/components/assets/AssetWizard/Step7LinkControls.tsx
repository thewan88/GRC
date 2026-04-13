'use client';

import { useState, useMemo } from 'react';
import { cn, controlStatusColor } from '@/lib/utils';
import { useControls } from '@/hooks/useControls';
import type { ControlTheme } from '@/types';

const THEME_ORDER: ControlTheme[] = ['Organisational', 'People', 'Physical', 'Technological'];

interface Props {
  control_ids: string[];
  review_date: string | null;
  onChange: (partial: { control_ids?: string[]; review_date?: string | null }) => void;
}

export default function Step7LinkControls({ control_ids, review_date, onChange }: Props) {
  const { data } = useControls();
  const controls = data?.data ?? [];
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<ControlTheme, boolean>>({
    Organisational: true, People: false, Physical: false, Technological: false,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return controls;
    const q = search.toLowerCase();
    return controls.filter((c) =>
      c.control_ref.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [controls, search]);

  const byTheme = useMemo(() => {
    const map: Record<ControlTheme, typeof controls> = {
      Organisational: [], People: [], Physical: [], Technological: [],
    };
    for (const c of filtered) if (c.theme in map) map[c.theme].push(c);
    return map;
  }, [filtered]);

  function toggle(id: string) {
    const next = control_ids.includes(id) ? control_ids.filter((c) => c !== id) : [...control_ids, id];
    onChange({ control_ids: next });
  }

  const selectedControls = controls.filter((c) => control_ids.includes(c.id));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Link Controls & Set Review Date</h3>
        <p className="mb-3 text-sm text-gray-600">Selected: <strong>{control_ids.length}</strong> controls</p>

        {selectedControls.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {selectedControls.map((c) => (
              <span key={c.id} className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                {c.control_ref}
                <button type="button" onClick={() => toggle(c.id)} className="ml-0.5 text-blue-500 hover:text-blue-700">×</button>
              </span>
            ))}
          </div>
        )}

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search controls..."
          className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
        {THEME_ORDER.map((theme) => {
          const themeControls = byTheme[theme];
          if (themeControls.length === 0) return null;
          const isOpen = expanded[theme] || !!search.trim();
          const sel = themeControls.filter((c) => control_ids.includes(c.id)).length;
          return (
            <div key={theme} className="border-b border-gray-200 last:border-b-0">
              <button
                type="button"
                onClick={() => setExpanded((p) => ({ ...p, [theme]: !p[theme] }))}
                className="flex w-full items-center justify-between bg-gray-50 px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                <span>{theme} ({themeControls.length})</span>
                <span className="flex items-center gap-2">
                  {sel > 0 && <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{sel}</span>}
                  <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                </span>
              </button>
              {isOpen && (
                <div className="divide-y divide-gray-100">
                  {themeControls.map((c) => {
                    const selected = control_ids.includes(c.id);
                    return (
                      <label key={c.id} className={cn('flex cursor-pointer items-start gap-3 px-4 py-2.5 hover:bg-gray-50', selected && 'bg-blue-50')}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggle(c.id)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-gray-500">{c.control_ref}</span>
                            <span className={cn('rounded border px-1.5 py-0.5 text-xs', controlStatusColor(c.status))}>{c.status}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Review Date</label>
        <input
          type="date"
          value={review_date ?? ''}
          onChange={(e) => onChange({ review_date: e.target.value || null })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
