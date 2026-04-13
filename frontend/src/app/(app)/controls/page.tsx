'use client';

import ControlRegisterTable from '@/components/controls/ControlRegisterTable';

export default function ControlsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">ISO 27001:2022 Control Register</h1>
        <p className="text-sm text-gray-500">All 93 Annex A controls grouped by theme. Click a row to edit status and implementation notes.</p>
      </div>
      <ControlRegisterTable />
    </div>
  );
}
