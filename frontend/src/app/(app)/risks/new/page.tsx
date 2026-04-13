'use client';

import RiskWizard from '@/components/risks/RiskWizard';

export default function NewRiskPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Register New Risk</h1>
        <p className="text-sm text-gray-500">Complete all steps to register a new risk in the register.</p>
      </div>
      <RiskWizard />
    </div>
  );
}
