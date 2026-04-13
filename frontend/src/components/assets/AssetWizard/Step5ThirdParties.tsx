'use client';

import type { ThirdParty } from '@/types';

interface Props {
  third_parties: ThirdParty[];
  onChange: (third_parties: ThirdParty[]) => void;
}

export default function Step5ThirdParties({ third_parties, onChange }: Props) {
  function add() {
    onChange([...third_parties, { party_name: '', purpose: null, dpa_reference: null }]);
  }

  function update(index: number, partial: Partial<ThirdParty>) {
    onChange(third_parties.map((tp, i) => i === index ? { ...tp, ...partial } : tp));
  }

  function remove(index: number) {
    onChange(third_parties.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Third-Party Processors / Controllers</h3>
        <p className="mb-4 text-xs text-gray-500">
          Record any third parties that process or access data associated with this asset (e.g. cloud providers, outsourced processors, data brokers).
        </p>
      </div>

      {third_parties.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="mb-3 text-sm text-gray-400">No third parties added.</p>
          <button type="button" onClick={add} className="text-sm font-medium text-blue-600 hover:text-blue-800">
            + Add Third Party
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {third_parties.map((tp, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Third Party #{i + 1}</span>
                  <button type="button" onClick={() => remove(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Organisation Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={tp.party_name}
                      onChange={(e) => update(i, { party_name: e.target.value })}
                      placeholder="e.g. AWS, Salesforce, Computershare"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Purpose</label>
                    <input
                      type="text"
                      value={tp.purpose ?? ''}
                      onChange={(e) => update(i, { purpose: e.target.value || null })}
                      placeholder="e.g. Cloud hosting, CRM"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">DPA Reference</label>
                    <input
                      type="text"
                      value={tp.dpa_reference ?? ''}
                      onChange={(e) => update(i, { dpa_reference: e.target.value || null })}
                      placeholder="e.g. DPA-2024-001"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={add} className="text-sm font-medium text-blue-600 hover:text-blue-800">
            + Add Another Third Party
          </button>
        </>
      )}
    </div>
  );
}
