'use client';

import { useUsers } from '@/hooks/useUsers';
import type { AssetLocationType } from '@/types';

const LOCATION_TYPES: { value: AssetLocationType; label: string }[] = [
  { value: 'on-prem',     label: 'On-Premises' },
  { value: 'cloud',       label: 'Cloud' },
  { value: 'third-party', label: 'Third-Party' },
  { value: 'hybrid',      label: 'Hybrid' },
];

interface Props {
  name: string;
  description: string;
  owner_id: string | null;
  custodian_id: string | null;
  location_type: AssetLocationType | null;
  location_detail: string;
  onChange: (partial: {
    name?: string;
    description?: string;
    owner_id?: string | null;
    custodian_id?: string | null;
    location_type?: AssetLocationType | null;
    location_detail?: string;
  }) => void;
}

export default function Step2CoreDetails({ name, description, owner_id, custodian_id, location_type, location_detail, onChange }: Props) {
  const { data } = useUsers();
  const users = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Asset Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Customer Data Warehouse, HR System, Office Building"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          placeholder="Describe the asset, its purpose, and how it is used..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Asset Owner</label>
          <select
            value={owner_id ?? ''}
            onChange={(e) => onChange({ owner_id: e.target.value || null })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">— Unassigned —</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-500">Accountable for the asset.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Custodian</label>
          <select
            value={custodian_id ?? ''}
            onChange={(e) => onChange({ custodian_id: e.target.value || null })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">— Unassigned —</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-500">Day-to-day responsible party.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location Type</label>
          <select
            value={location_type ?? ''}
            onChange={(e) => onChange({ location_type: (e.target.value as AssetLocationType) || null })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">— Select —</option>
            {LOCATION_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location Detail</label>
          <input
            type="text"
            value={location_detail}
            onChange={(e) => onChange({ location_detail: e.target.value })}
            placeholder="e.g. AWS eu-west-2, Nutanix Cluster 1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
