'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { cn, controlStatusColor, formatDate } from '@/lib/utils';
import { updateControl } from '@/hooks/useControls';
import { useUsers } from '@/hooks/useUsers';
import type { Control, ControlStatus } from '@/types';

const STATUSES: ControlStatus[] = [
  'Not Applicable',
  'Not Implemented',
  'Planned',
  'Partially Implemented',
  'Implemented',
  'Tested',
];

interface Props {
  control: Control;
  onClose: () => void;
  onUpdated: (updated: Control) => void;
}

export default function ControlDetailPanel({ control, onClose, onUpdated }: Props) {
  const { data: usersData } = useUsers();
  const users = usersData?.data ?? [];

  const [status, setStatus]                     = useState<ControlStatus>(control.status);
  const [naJustification, setNaJustification]   = useState(control.na_justification ?? '');
  const [implNotes, setImplNotes]               = useState(control.implementation_notes ?? '');
  const [ownerId, setOwnerId]                   = useState(control.owner?.id ?? '');
  const [reviewDate, setReviewDate]             = useState(control.last_review_date ?? '');
  const [saving, setSaving]                     = useState(false);
  const [error, setError]                       = useState<string | null>(null);
  const [success, setSuccess]                   = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateControl(control.id, {
        status,
        na_justification:      naJustification || null,
        implementation_notes:  implNotes || null,
        owner_id:              ownerId || null,
        last_review_date:      reviewDate || null,
      });
      onUpdated(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sticky top-6 rounded-xl border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 rounded-t-xl">
        <div>
          <p className="font-mono text-sm font-semibold text-gray-600">{control.control_ref}</p>
          <p className="text-sm font-bold text-gray-900 leading-tight mt-0.5">{control.name}</p>
        </div>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4 space-y-4">
        {/* Description */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Description</p>
          <p className="text-sm text-gray-600">{control.description}</p>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ControlStatus)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="mt-1">
            <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', controlStatusColor(status))}>
              {status}
            </span>
          </div>
        </div>

        {/* N/A justification */}
        {status === 'Not Applicable' && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              N/A Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={naJustification}
              onChange={(e) => setNaJustification(e.target.value)}
              rows={3}
              placeholder="Explain why this control is not applicable..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Implementation notes */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Implementation Notes</label>
          <textarea
            value={implNotes}
            onChange={(e) => setImplNotes(e.target.value)}
            rows={4}
            placeholder="Describe how this control is implemented, any gaps, or planned actions..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Owner + Review date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Owner</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">— None —</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">Review Date</label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Evidence list (read-only) */}
        {control.evidence && control.evidence.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Evidence ({control.evidence.length})</p>
            <ul className="space-y-1">
              {control.evidence.map((e, i) => (
                <li key={i} className="text-sm text-blue-600 hover:underline">
                  <a href={e.url_or_ref} target="_blank" rel="noreferrer">{e.title}</a>
                  <span className="ml-2 text-xs text-gray-400">{formatDate(e.added_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Linked risks */}
        {control.risks && control.risks.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Linked Risks</p>
            <div className="flex flex-wrap gap-1">
              {control.risks.map((r) => (
                <a key={r.id} href={`/risks/${r.id}`}
                  className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                >
                  {r.risk_id}
                </a>
              ))}
            </div>
          </div>
        )}

        {error   && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">Saved successfully.</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
