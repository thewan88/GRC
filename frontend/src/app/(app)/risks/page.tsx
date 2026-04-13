'use client';

import RiskTable from '@/components/risks/RiskTable';

export default function RisksPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Risk Register</h1>
        <p className="text-sm text-gray-500">All registered risks across categories, owners and FCA tags.</p>
      </div>
      <RiskTable />
    </div>
  );
}
