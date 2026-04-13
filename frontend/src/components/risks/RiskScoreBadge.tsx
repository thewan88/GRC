import { riskLevelColor, cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface Props {
  score: number | null | undefined;
  level: RiskLevel | null | undefined;
  size?: 'sm' | 'md';
  showScore?: boolean;
}

export default function RiskScoreBadge({ score, level, size = 'md', showScore = true }: Props) {
  if (score === null || score === undefined || !level) return <span className="text-gray-400">—</span>;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-md border font-semibold',
      riskLevelColor(level),
      size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
    )}>
      {showScore && <span>{score}</span>}
      <span>{level}</span>
    </span>
  );
}
