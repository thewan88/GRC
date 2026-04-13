'use client';

import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { DashboardSummary } from '@/types';

interface Props { summary: DashboardSummary | undefined; }

function trafficLight(condition: 'green' | 'amber' | 'red') {
  switch (condition) {
    case 'green': return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Compliant' };
    case 'amber': return { icon: AlertCircle,  color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Attention' };
    case 'red':   return { icon: XCircle,      color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200',   label: 'At Risk' };
  }
}

export default function RegulatoryBadges({ summary }: Props) {
  // FCA: amber if any Critical regulatory risks, red if 2+
  const criticalRegulatoryRisks = summary?.risks_by_level?.Critical ?? 0;
  const fcaStatus = criticalRegulatoryRisks === 0 ? 'green' : criticalRegulatoryRisks < 2 ? 'amber' : 'red';

  // ISO 27001: based on overall implemented percentage across all themes
  const themes = Object.values(summary?.control_compliance ?? {});
  const avgCompliance = themes.length > 0
    ? themes.reduce((sum, t) => sum + t.percentage, 0) / themes.length
    : 0;
  const isoStatus = avgCompliance >= 80 ? 'green' : avgCompliance >= 50 ? 'amber' : 'red';

  // ICO GDPR: based on personal data asset GDPR completeness (using gdpr.personal_data_assets as proxy)
  const personalDataAssets = summary?.gdpr?.personal_data_assets ?? 0;
  const totalAssets         = summary?.gdpr?.total_assets ?? 0;
  const gdprStatus          = totalAssets === 0 ? 'green' : personalDataAssets / totalAssets < 0.5 ? 'green' : 'amber';

  const badges = [
    { label: 'FCA SYSC',       status: fcaStatus,  subtitle: 'Financial Conduct Authority' },
    { label: 'ISO 27001:2022', status: isoStatus,  subtitle: `${Math.round(avgCompliance)}% controls implemented` },
    { label: 'ICO GDPR',       status: gdprStatus, subtitle: 'UK GDPR compliance' },
  ] as const;

  return (
    <div className="space-y-2">
      {badges.map(({ label, status, subtitle }) => {
        const { icon: Icon, color, bg, border, label: statusLabel } = trafficLight(status);
        return (
          <div key={label} className={`flex items-center justify-between rounded-md border ${border} ${bg} px-4 py-3`}>
            <div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
            <div className={`flex items-center gap-1.5 ${color}`}>
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{statusLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
