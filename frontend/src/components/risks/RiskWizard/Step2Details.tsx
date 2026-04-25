'use client';

import { useUsers } from '@/hooks/useUsers';
import CreateUserPanel from '@/components/users/CreateUserPanel';

interface Props {
  title: string;
  description: string;
  owner_id: string | null;
  onChange: (partial: { title?: string; description?: string; owner_id?: string | null }) => void;
}

export default function Step2Details({ title, description, owner_id, onChange }: Props) {
  const { data } = useUsers();
  const users = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Risk Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Failure to comply with SYSC 4.1 governance requirements"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Be specific and concise. Include the regulatory or operational context.</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Describe the risk in detail, including potential triggers and consequences..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Risk Owner</label>
        <select
          value={owner_id ?? ''}
          onChange={(e) => onChange({ owner_id: e.target.value || null })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">— Unassigned —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
          ))}
        </select>
        <CreateUserPanel defaultRole="risk_manager" onCreated={(user) => onChange({ owner_id: user.id })} />
        <p className="mt-1 text-xs text-gray-500">The person accountable for managing and monitoring this risk.</p>
      </div>
    </div>
  );
}
