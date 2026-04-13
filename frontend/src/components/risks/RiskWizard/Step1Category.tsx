'use client';

import { cn } from '@/lib/utils';
import type { RiskCategory, FcaTag } from '@/types';

const CATEGORIES: { value: RiskCategory; label: string; description: string; icon: string }[] = [
  { value: 'Operational',               label: 'Operational',              description: 'Process, systems, people failures',          icon: '⚙️' },
  { value: 'Regulatory',                label: 'Regulatory',               description: 'Non-compliance with laws and regulations',    icon: '⚖️' },
  { value: 'Financial',                 label: 'Financial',                description: 'Financial loss, credit, liquidity risk',      icon: '💰' },
  { value: 'Technology',                label: 'Technology',               description: 'IT systems, cyber, data security',            icon: '💻' },
  { value: 'Reputational',              label: 'Reputational',             description: 'Brand damage, public perception',             icon: '📣' },
  { value: 'Strategic',                 label: 'Strategic',                description: 'Business strategy, market, competitive',      icon: '🎯' },
  { value: 'Third-Party/Outsourcing',   label: 'Third-Party / Outsourcing', description: 'Vendor, supplier, outsourced service risk',  icon: '🤝' },
];

const FCA_TAGS: { value: FcaTag; label: string; description: string }[] = [
  { value: 'SYSC',                   label: 'SYSC',                    description: 'Senior Management Arrangements, Systems & Controls' },
  { value: 'COBS',                   label: 'COBS',                    description: 'Conduct of Business Sourcebook' },
  { value: 'MAR',                    label: 'MAR',                     description: 'Market Conduct (Market Abuse Regulation)' },
  { value: 'Operational Resilience', label: 'Operational Resilience',  description: 'FCA/PRA Operational Resilience requirements' },
];

interface Props {
  category: RiskCategory | '';
  fca_tags: FcaTag[];
  onChange: (category: RiskCategory | '', fca_tags: FcaTag[]) => void;
}

export default function Step1Category({ category, fca_tags, onChange }: Props) {
  function toggleTag(tag: FcaTag) {
    const next = fca_tags.includes(tag) ? fca_tags.filter((t) => t !== tag) : [...fca_tags, tag];
    onChange(category, next);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Risk Category</h3>
        <p className="mb-4 text-xs text-gray-500">Select the primary category that best describes this risk.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map(({ value, label, description, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value, fca_tags)}
              className={cn(
                'rounded-lg border p-3 text-left transition-all',
                category === value
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50',
              )}
            >
              <div className="mb-1 text-xl">{icon}</div>
              <div className="text-sm font-semibold text-gray-900">{label}</div>
              <div className="text-xs text-gray-500">{description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">FCA Tags <span className="font-normal text-gray-400">(optional)</span></h3>
        <p className="mb-4 text-xs text-gray-500">Tag relevant FCA regulatory sourcebooks or requirements.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FCA_TAGS.map(({ value, label, description }) => {
            const checked = fca_tags.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleTag(value)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                  checked
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50',
                )}
              >
                <div className={cn(
                  'mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2',
                  checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300',
                )}>
                  {checked && (
                    <svg className="h-full w-full text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
