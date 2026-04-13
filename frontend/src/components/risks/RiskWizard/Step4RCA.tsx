'use client';

import { cn } from '@/lib/utils';
import type { RcaMethod, FishboneData, FiveWhyData } from '@/types';

interface Props {
  rca_method: RcaMethod | null;
  rca_data: FishboneData | FiveWhyData | null;
  onChange: (method: RcaMethod | null, data: FishboneData | FiveWhyData | null) => void;
}

const FISHBONE_CATEGORIES = [
  { key: 'people',      label: 'People',      placeholder: 'Staff training, competency, workload, human error...' },
  { key: 'process',     label: 'Process',     placeholder: 'Procedures, workflows, controls, approval chains...' },
  { key: 'technology',  label: 'Technology',  placeholder: 'Systems, software, infrastructure, integrations...' },
  { key: 'environment', label: 'Environment', placeholder: 'Regulatory changes, market conditions, external events...' },
  { key: 'management',  label: 'Management',  placeholder: 'Oversight, governance, decision-making, culture...' },
  { key: 'materials',   label: 'Materials',   placeholder: 'Data quality, documentation, resources, tools...' },
] as const;

function FishboneForm({ data, onChange }: { data: FishboneData; onChange: (d: FishboneData) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {FISHBONE_CATEGORIES.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
          <textarea
            value={data.causes[key]}
            onChange={(e) => onChange({ causes: { ...data.causes, [key]: e.target.value } })}
            placeholder={placeholder}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

function FiveWhyForm({ data, onChange }: { data: FiveWhyData; onChange: (d: FiveWhyData) => void }) {
  function updateWhy(index: number, field: 'why' | 'answer', value: string) {
    const updated = data.whys.map((w, i) => i === index ? { ...w, [field]: value } : w);
    onChange({ whys: updated });
  }

  function addWhy() {
    onChange({ whys: [...data.whys, { why: '', answer: '' }] });
  }

  function removeWhy(index: number) {
    if (data.whys.length <= 3) return;
    onChange({ whys: data.whys.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      {data.whys.map((pair, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Why #{i + 1}</span>
            {data.whys.length > 3 && (
              <button type="button" onClick={() => removeWhy(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            )}
          </div>
          <input
            type="text"
            value={pair.why}
            onChange={(e) => updateWhy(i, 'why', e.target.value)}
            placeholder={`Why did the problem occur? (Why #${i + 1})`}
            className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <textarea
            value={pair.answer}
            onChange={(e) => updateWhy(i, 'answer', e.target.value)}
            placeholder="Answer / root cause analysis..."
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addWhy}
        className="text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        + Add another Why
      </button>
    </div>
  );
}

const defaultFishbone: FishboneData = {
  causes: { people: '', process: '', technology: '', environment: '', management: '', materials: '' },
};

const defaultFiveWhy: FiveWhyData = {
  whys: [
    { why: '', answer: '' },
    { why: '', answer: '' },
    { why: '', answer: '' },
  ],
};

export default function Step4RCA({ rca_method, rca_data, onChange }: Props) {
  function selectMethod(method: RcaMethod) {
    if (method === 'fishbone') {
      onChange(method, rca_data && 'causes' in rca_data ? rca_data : defaultFishbone);
    } else {
      onChange(method, rca_data && 'whys' in rca_data ? rca_data : defaultFiveWhy);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Root Cause Analysis Method</h3>
        <p className="mb-4 text-xs text-gray-500">Choose the method that best suits the complexity of this risk.</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => selectMethod('fishbone')}
            className={cn(
              'rounded-lg border p-4 text-left transition-all',
              rca_method === 'fishbone'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-blue-300',
            )}
          >
            <div className="mb-1 text-2xl">🐟</div>
            <div className="text-sm font-semibold text-gray-900">Fishbone (Ishikawa)</div>
            <div className="text-xs text-gray-500">Analyse causes across 6 categories: People, Process, Technology, Environment, Management, Materials.</div>
          </button>
          <button
            type="button"
            onClick={() => selectMethod('five_why')}
            className={cn(
              'rounded-lg border p-4 text-left transition-all',
              rca_method === 'five_why'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-blue-300',
            )}
          >
            <div className="mb-1 text-2xl">❓</div>
            <div className="text-sm font-semibold text-gray-900">5-Why Analysis</div>
            <div className="text-xs text-gray-500">Iteratively ask &ldquo;why?&rdquo; at least 3 times to drill down to the root cause.</div>
          </button>
        </div>
      </div>

      {rca_method === 'fishbone' && rca_data && 'causes' in rca_data && (
        <FishboneForm data={rca_data as FishboneData} onChange={(d) => onChange('fishbone', d)} />
      )}

      {rca_method === 'five_why' && rca_data && 'whys' in rca_data && (
        <FiveWhyForm data={rca_data as FiveWhyData} onChange={(d) => onChange('five_why', d)} />
      )}
    </div>
  );
}
