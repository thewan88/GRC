'use client';

import AssetWizard from '@/components/assets/AssetWizard';

export default function NewAssetPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Register New Asset</h1>
        <p className="text-sm text-gray-500">Complete all steps to register a new information asset.</p>
      </div>
      <AssetWizard />
    </div>
  );
}
