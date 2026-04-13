'use client';

import { cn } from '@/lib/utils';
import type { AssetType } from '@/types';

const ASSET_TYPES: { value: AssetType; label: string; description: string; icon: string }[] = [
  { value: 'Data',     label: 'Data',     description: 'Databases, files, datasets, personal records',     icon: '💾' },
  { value: 'System',   label: 'System',   description: 'Servers, infrastructure, hardware systems',         icon: '🖥️' },
  { value: 'Software', label: 'Software', description: 'Applications, SaaS tools, operating systems',       icon: '📦' },
  { value: 'People',   label: 'People',   description: 'Staff, contractors, third-party personnel',          icon: '👤' },
  { value: 'Physical', label: 'Physical', description: 'Offices, data centres, physical media',             icon: '🏢' },
  { value: 'Service',  label: 'Service',  description: 'Outsourced services, cloud services, utilities',    icon: '🔧' },
];

interface Props {
  asset_type: AssetType | '';
  onChange: (type: AssetType | '') => void;
}

export default function Step1Type({ asset_type, onChange }: Props) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Asset Type</h3>
      <p className="mb-4 text-xs text-gray-500">Select the type that best describes this information asset.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ASSET_TYPES.map(({ value, label, description, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              'rounded-lg border p-4 text-left transition-all',
              asset_type === value
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50',
            )}
          >
            <div className="mb-2 text-3xl">{icon}</div>
            <div className="text-sm font-semibold text-gray-900">{label}</div>
            <div className="mt-0.5 text-xs text-gray-500">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
