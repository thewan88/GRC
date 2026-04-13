'use client';

import { useRouter } from 'next/navigation';
import { heatMapCellColor, cn } from '@/lib/utils';
import { LIKELIHOOD_LABELS, IMPACT_LABELS } from '@/lib/constants';
import type { HeatMapCell } from '@/types';

interface Props {
  cells: HeatMapCell[] | undefined;
}

export default function RiskHeatMap({ cells }: Props) {
  const router = useRouter();

  const getCell = (likelihood: number, impact: number): HeatMapCell | undefined =>
    cells?.find((c) => c.likelihood === likelihood && c.impact === impact);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Risk Heat Map</h3>
        <span className="text-xs text-gray-400">Click a cell to filter risks</span>
      </div>

      {/* Y-axis label */}
      <div className="flex gap-3">
        <div className="flex w-6 items-center justify-center">
          <span className="text-xs text-gray-400 -rotate-90 whitespace-nowrap">Impact →</span>
        </div>

        <div className="flex-1">
          {/* Grid: impact axis Y (5=top, 1=bottom), likelihood axis X (1=left, 5=right) */}
          <div className="grid grid-cols-6 gap-1">
            {/* Column headers */}
            <div className="text-center" />
            {[1, 2, 3, 4, 5].map((l) => (
              <div key={l} className="text-center">
                <span className="text-[10px] text-gray-400">{LIKELIHOOD_LABELS[l]?.slice(0, 5)}</span>
              </div>
            ))}

            {/* Rows: impact 5 → 1 (highest at top) */}
            {[5, 4, 3, 2, 1].map((impact) => (
              <>
                <div key={`label-${impact}`} className="flex items-center justify-end pr-1">
                  <span className="text-[10px] text-gray-400">{impact}</span>
                </div>
                {[1, 2, 3, 4, 5].map((likelihood) => {
                  const cell  = getCell(likelihood, impact);
                  const score = likelihood * impact;
                  const count = cell?.count ?? 0;

                  return (
                    <button
                      key={`${likelihood}-${impact}`}
                      onClick={() => router.push(`/risks?likelihood=${likelihood}&impact=${impact}`)}
                      className={cn(
                        'flex h-12 items-center justify-center rounded text-sm font-bold transition-all',
                        heatMapCellColor(score),
                        count > 0 ? 'text-white shadow-sm' : 'text-gray-400',
                      )}
                      title={`L${likelihood} × I${impact} = Score ${score} | ${count} risk${count !== 1 ? 's' : ''}`}
                    >
                      {count > 0 ? count : ''}
                    </button>
                  );
                })}
              </>
            ))}
          </div>

          {/* X-axis label */}
          <div className="mt-1 text-center text-xs text-gray-400">Likelihood →</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: 'Critical (15–25)', color: 'bg-red-500' },
          { label: 'High (10–14)',     color: 'bg-orange-400' },
          { label: 'Medium (5–9)',     color: 'bg-amber-300' },
          { label: 'Low (1–4)',        color: 'bg-green-200' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-gray-600">
            <span className={`h-3 w-3 rounded-sm ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
