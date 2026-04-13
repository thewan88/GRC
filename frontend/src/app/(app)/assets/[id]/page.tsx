'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useAsset } from '@/hooks/useAssets';
import { useAuditLog } from '@/hooks/useAuditLog';
import { cn, formatDate, formatDateTime, classificationColor } from '@/lib/utils';

export default function AssetDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const { data, isLoading } = useAsset(id);
  const { data: auditData } = useAuditLog({ resource_type: 'Asset', resource_id: id });
  const asset = data?.data;
  const audit = auditData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">Asset not found.</p>
        <Link href="/assets" className="mt-2 inline-block text-sm text-blue-600 hover:underline">Back to Asset Register</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push('/assets')} className="mt-0.5 text-gray-400 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-400">{asset.asset_id}</span>
            <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', classificationColor(asset.classification))}>
              {asset.classification}
            </span>
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              asset.status === 'Disposed' ? 'bg-red-100 text-red-700' :
              asset.status === 'Archived' ? 'bg-gray-100 text-gray-600' :
                                            'bg-green-100 text-green-700',
            )}>
              {asset.status}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-gray-900">{asset.name}</h1>
          <p className="text-sm text-gray-500">{asset.asset_type} · Owner: {asset.owner?.name ?? '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          {asset.description && (
            <Card title="Description">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{asset.description}</p>
            </Card>
          )}

          {/* GDPR */}
          {asset.is_personal_data && (
            <Card title="GDPR / UK Data Protection">
              <div className="space-y-3">
                <Row label="Personal Data">Yes{asset.is_special_category ? ' (Special Category)' : ''}</Row>
                <Row label="Lawful Basis (Art.6)">{asset.lawful_basis ?? '—'}</Row>
                {asset.is_special_category && (
                  <Row label="Special Category Basis">{asset.special_category_basis ?? '—'}</Row>
                )}
                <Row label="Data Subjects">
                  {(asset.data_subjects && asset.data_subjects.length > 0)
                    ? asset.data_subjects.join(', ')
                    : '—'}
                </Row>
                <Row label="Retention Period">{asset.retention_period ?? '—'}</Row>
                <Row label="International Transfers">{asset.international_transfers ? 'Yes' : 'No'}</Row>
                {asset.international_transfers && asset.transfer_safeguards && (
                  <Row label="Transfer Safeguards">{asset.transfer_safeguards}</Row>
                )}
              </div>
            </Card>
          )}

          {/* Third parties */}
          {asset.third_parties && asset.third_parties.length > 0 && (
            <Card title={`Third-Party Processors (${asset.third_parties.length})`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Organisation</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Purpose</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">DPA Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {asset.third_parties.map((tp, i) => (
                    <tr key={i}>
                      <td className="py-2 font-medium text-gray-900">{tp.party_name}</td>
                      <td className="py-2 text-gray-600">{tp.purpose ?? '—'}</td>
                      <td className="py-2 font-mono text-gray-500">{tp.dpa_reference ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Linked Risks */}
          {asset.risks && asset.risks.length > 0 && (
            <Card title={`Linked Risks (${asset.risks.length})`}>
              <div className="flex flex-wrap gap-2">
                {asset.risks.map((r) => (
                  <Link key={r.id} href={`/risks/${r.id}`}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="font-mono">{r.risk_id}</span>
                    <span className="text-gray-500">{r.title}</span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Linked Controls */}
          {asset.controls && asset.controls.length > 0 && (
            <Card title={`Linked Controls (${asset.controls.length})`}>
              <div className="flex flex-wrap gap-2">
                {asset.controls.map((c) => (
                  <Link key={c.id} href={`/controls/${c.id}`}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="font-mono">{c.ref}</span>
                    <span className="text-gray-500">{c.name}</span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card title="Details">
            <dl className="space-y-3">
              <MetaRow label="Asset ID"><span className="font-mono">{asset.asset_id}</span></MetaRow>
              <MetaRow label="Type">{asset.asset_type}</MetaRow>
              <MetaRow label="Classification">
                <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', classificationColor(asset.classification))}>
                  {asset.classification}
                </span>
              </MetaRow>
              <MetaRow label="Owner">{asset.owner?.name ?? '—'}</MetaRow>
              <MetaRow label="Custodian">{asset.custodian?.name ?? '—'}</MetaRow>
              <MetaRow label="Location">{asset.location_type ?? '—'}{asset.location_detail ? ` — ${asset.location_detail}` : ''}</MetaRow>
              <MetaRow label="Review Date">{formatDate(asset.review_date)}</MetaRow>
              <MetaRow label="Created">{formatDate(asset.created_at)}</MetaRow>
            </dl>
          </Card>

          {audit.length > 0 && (
            <Card title="Audit Trail">
              <div className="space-y-2">
                {audit.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="text-xs">
                    <span className={cn(
                      'mr-1.5 rounded px-1.5 py-0.5 font-semibold',
                      entry.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                      entry.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                   'bg-blue-100 text-blue-700',
                    )}>
                      {entry.action}
                    </span>
                    <span className="text-gray-600">{entry.user.email}</span>
                    <span className="ml-1 text-gray-400">{formatDateTime(entry.created_at)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-1.5">
      <span className="w-40 flex-shrink-0 text-xs font-medium text-gray-500">{label}</span>
      <span className="flex-1 text-sm text-gray-900">{children}</span>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-right text-xs text-gray-900">{children}</dd>
    </div>
  );
}
