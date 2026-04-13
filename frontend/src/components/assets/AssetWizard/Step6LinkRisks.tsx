'use client';

import { useState, useMemo } from 'react';
import { cn, riskLevelColor } from '@/lib/utils';
import { useRisks } from '@/hooks/useRisks';

interface Props {
  risk_ids: string[];
  onChange: (ids: string[]) => void;
}

export default function Step6LinkRisks({ risk_ids, onChange }: Props) {
  const { data } = useRisks();
  const risks = data?.data ?? [];
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return risks;
    const q = search.toLowerCase();
    return risks.filter(
      (r) => r.risk_id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q),
    );
  }, [risks, search]);

  function toggle(id: string) {
    const next = risk_ids.includes(id) ? risk_ids.filter((r) => r !== id) : [...risk_ids, id];
    onChange(next);
  }

  const selectedRisks = risks.filter((r) => risk_ids.includes(r.id));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Link Risks</h3>
        <p className="mb-3 text-sm text-gray-600">
          Associate risks that affect this asset. Selected: <strong>{risk_ids.length}</strong>
        </p>

        {selectedRisks.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {selectedRisks.map((r) => (
              <span key={r.id} className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                {r.risk_id}
                <button type="button" onClick={() => toggle(r.id)} className="ml-0.5 text-blue-500 hover:text-blue-700">×</button>
              </span>
            ))}
          </div>
        )}

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search risks by ID, title or category..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-400">No risks found.</p>
        ) : (
          filtered.map((r) => {
            const selected = risk_ids.includes(r.id);
            return (
              <label key={r.id} className={cn('flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50', selected && 'bg-blue-50')}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(r.id)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{r.risk_id}</span>
                    <span className={cn('rounded border px-1.5 py-0.5 text-xs font-semibold', riskLevelColor(r.risk_level))}>
                      {r.risk_level}
                    </span>
                    <span className="text-xs text-gray-400">{r.category}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{r.title}</p>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
