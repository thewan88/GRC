'use client';

import AssetTable from '@/components/assets/AssetTable';

export default function AssetsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Information Asset Register</h1>
        <p className="text-sm text-gray-500">All registered information assets including personal data, systems and third-party services.</p>
      </div>
      <AssetTable />
    </div>
  );
}
