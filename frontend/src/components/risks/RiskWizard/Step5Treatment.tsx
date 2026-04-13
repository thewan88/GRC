'use client';

import { cn } from '@/lib/utils';
import { useUsers } from '@/hooks/useUsers';
import type { RiskTreatment, TreatmentAction } from '@/types';

const TREATMENTS: { value: RiskTreatment; label: string; description: string; icon: string }[] = [
  { value: 'Accept',   label: 'Accept',   description: 'Accept the risk as it falls within appetite. Document rationale.',            icon: '✅' },
  { value: 'Mitigate', label: 'Mitigate', description: 'Implement controls to reduce likelihood and/or impact.',                       icon: '🛡️' },
  { value: 'Transfer', label: 'Transfer', description: 'Transfer risk via insurance, contract, or outsourcing.',                       icon: '↗️' },
  { value: 'Avoid',    label: 'Avoid',    description: 'Cease the activity that gives rise to this risk.',                             icon: '🚫' },
];

interface Props {
  treatment: RiskTreatment | null;
  treatment_plan: TreatmentAction[];
  residual_likelihood: number | null;
  residual_impact: number | null;
  onChange: (partial: {
    treatment?: RiskTreatment | null;
    treatment_plan?: TreatmentAction[];
    residual_likelihood?: number | null;
    residual_impact?: number | null;
  }) => void;
}

export default function Step5Treatment({ treatment, treatment_plan, residual_likelihood, residual_impact, onChange }: Props) {
  const { data } = useUsers();
  const users = data?.data ?? [];

  function addAction() {
    onChange({
      treatment_plan: [
        ...treatment_plan,
        { action: '', owner_id: null, target_date: null, status: 'Not Started' },
      ],
    });
  }

  function updateAction(index: number, partial: Partial<TreatmentAction>) {
    const updated = treatment_plan.map((a, i) => i === index ? { ...a, ...partial } : a);
    onChange({ treatment_plan: updated });
  }

  function removeAction(index: number) {
    onChange({ treatment_plan: treatment_plan.filter((_, i) => i !== index) });
  }

  const residualScore = residual_likelihood && residual_impact ? residual_likelihood * residual_impact : null;

  return (
    <div className="space-y-6">
      {/* Treatment type */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Treatment Strategy</h3>
        <div className="grid grid-cols-2 gap-3">
          {TREATMENTS.map(({ value, label, description, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ treatment: value })}
              className={cn(
                'rounded-lg border p-3 text-left transition-all',
                treatment === value
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 bg-white hover:border-blue-300',
              )}
            >
              <div className="mb-1 text-xl">{icon}</div>
              <div className="text-sm font-semibold text-gray-900">{label}</div>
              <div className="text-xs text-gray-500">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action plan — only for Mitigate/Transfer/Avoid */}
      {treatment && treatment !== 'Accept' && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Treatment Actions</h3>
            <button type="button" onClick={addAction} className="text-xs font-medium text-blue-600 hover:text-blue-800">
              + Add Action
            </button>
          </div>

          {treatment_plan.length === 0 ? (
            <p className="text-xs text-gray-400">No actions added yet. Click &ldquo;Add Action&rdquo; to create a treatment step.</p>
          ) : (
            <div className="space-y-3">
              {treatment_plan.map((action, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Action #{i + 1}</span>
                    <button type="button" onClick={() => removeAction(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={action.action}
                        onChange={(e) => updateAction(i, { action: e.target.value })}
                        placeholder="Describe the action to be taken..."
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={action.owner_id ?? ''}
                        onChange={(e) => updateAction(i, { owner_id: e.target.value || null })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">— Action Owner —</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="date"
                        value={action.target_date ?? ''}
                        onChange={(e) => updateAction(i, { target_date: e.target.value || null })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={action.status}
                        onChange={(e) => updateAction(i, { status: e.target.value as TreatmentAction['status'] })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Residual scoring */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Residual Risk Score <span className="font-normal text-gray-400">(after treatment)</span></h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Residual Likelihood</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange({ residual_likelihood: n })}
                  className={cn(
                    'flex-1 rounded border py-1 text-center text-sm font-semibold transition-all',
                    residual_likelihood === n
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Residual Impact</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange({ residual_impact: n })}
                  className={cn(
                    'flex-1 rounded border py-1 text-center text-sm font-semibold transition-all',
                    residual_impact === n
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        {residualScore && (
          <p className="mt-2 text-sm text-gray-600">
            Residual Score: <strong>{residualScore}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
