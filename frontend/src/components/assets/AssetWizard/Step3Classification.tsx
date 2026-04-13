'use client';

import { cn, classificationColor } from '@/lib/utils';
import type { AssetClassification } from '@/types';

const CLASSIFICATIONS: { value: AssetClassification; label: string; description: string }[] = [
  { value: 'Public',       label: 'Public',       description: 'Information approved for public release. No harm if disclosed.' },
  { value: 'Internal',     label: 'Internal',     description: 'For internal use only. Limited harm if disclosed externally.' },
  { value: 'Confidential', label: 'Confidential', description: 'Sensitive business information. Significant harm if disclosed.' },
  { value: 'Restricted',   label: 'Restricted',   description: 'Highly sensitive. Serious or critical harm if disclosed.' },
];

interface Props {
  classification: AssetClassification | '';
  onChange: (cls: AssetClassification | '') => void;
}

export default function Step3Classification({ classification, onChange }: Props) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Data Classification</h3>
      <p className="mb-4 text-xs text-gray-500">
        Select the classification level that reflects the sensitivity and handling requirements of this asset.
      </p>
      <div className="space-y-3">
        {CLASSIFICATIONS.map(({ value, label, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              'flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all',
              classification === value
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-blue-300',
            )}
          >
            <span className={cn('rounded border px-2.5 py-1 text-sm font-bold', classificationColor(value))}>
              {label}
            </span>
            <span className="text-sm text-gray-600">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
