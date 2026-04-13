'use client';

import { cn, scoreToLevel, riskLevelColor } from '@/lib/utils';

const LIKELIHOOD_LABELS: Record<number, string> = {
  1: 'Rare',
  2: 'Unlikely',
  3: 'Possible',
  4: 'Likely',
  5: 'Almost Certain',
};

const IMPACT_LABELS: Record<number, string> = {
  1: 'Negligible',
  2: 'Minor',
  3: 'Moderate',
  4: 'Significant',
  5: 'Catastrophic',
};

interface Props {
  likelihood: number | null;
  impact: number | null;
  onChange: (likelihood: number | null, impact: number | null) => void;
}

function ScoreRow({ label, value, labels, onSelect }: {
  label: string;
  value: number | null;
  labels: Record<number, string>;
  onSelect: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={cn(
              'flex flex-1 flex-col items-center rounded-lg border p-2 text-center transition-all',
              value === n
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50',
            )}
          >
            <span className="text-lg font-bold text-gray-900">{n}</span>
            <span className="text-xs text-gray-500">{labels[n]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Step3Scoring({ likelihood, impact, onChange }: Props) {
  const score = likelihood && impact ? likelihood * impact : null;
  const level = score ? scoreToLevel(score) : null;

  return (
    <div className="space-y-6">
      <ScoreRow
        label="Likelihood — how likely is this risk to occur?"
        value={likelihood}
        labels={LIKELIHOOD_LABELS}
        onSelect={(v) => onChange(v, impact)}
      />

      <ScoreRow
        label="Impact — how severe would the consequences be?"
        value={impact}
        labels={IMPACT_LABELS}
        onSelect={(v) => onChange(likelihood, v)}
      />

      {score && level ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Inherent Risk Score</p>
              <p className="text-xs text-gray-500">Likelihood ({likelihood}) × Impact ({impact})</p>
            </div>
            <span className={cn(
              'rounded-md border px-3 py-1 text-xl font-bold',
              riskLevelColor(level),
            )}>
              {score} — {level}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                level === 'Critical' ? 'bg-red-500' :
                level === 'High'     ? 'bg-orange-400' :
                level === 'Medium'   ? 'bg-amber-400' :
                                       'bg-green-400',
              )}
              style={{ width: `${(score / 25) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Low (1–4)</span><span>Medium (5–9)</span><span>High (10–14)</span><span>Critical (15–25)</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
          Select both Likelihood and Impact to see the inherent risk score.
        </div>
      )}
    </div>
  );
}
