'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, ExternalLink } from 'lucide-react';
import { useRisk, updateRisk } from '@/hooks/useRisks';
import { useAuditLog } from '@/hooks/useAuditLog';
import RiskScoreBadge from '@/components/risks/RiskScoreBadge';
import { cn, formatDate, formatDateTime, riskLevelColor, controlStatusColor } from '@/lib/utils';
import { useState } from 'react';
import type { RiskStatus, FcaTag } from '@/types';

const FCA_TAG_COLORS: Record<FcaTag, string> = {
  'SYSC':                  'bg-purple-100 text-purple-800 border-purple-200',
  'COBS':                  'bg-sky-100 text-sky-800 border-sky-200',
  'MAR':                   'bg-pink-100 text-pink-800 border-pink-200',
  'Operational Resilience': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function RiskDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const { data, isLoading } = useRisk(id);
  const { data: auditData } = useAuditLog({ resource_type: 'Risk', resource_id: id });
  const risk  = data?.data;
  const audit = auditData?.data ?? [];

  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">Risk not found.</p>
        <Link href="/risks" className="mt-2 inline-block text-sm text-blue-600 hover:underline">Back to Risk Register</Link>
      </div>
    );
  }

  async function changeStatus(status: RiskStatus) {
    if (!risk) return;
    setUpdatingStatus(true);
    await updateRisk(risk.id, { status });
    setUpdatingStatus(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button onClick={() => router.push('/risks')} className="mt-0.5 text-gray-400 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-400">{risk.risk_id}</span>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                risk.status === 'Closed'    ? 'bg-gray-100 text-gray-600' :
                risk.status === 'In Review' ? 'bg-blue-100 text-blue-700' :
                                              'bg-green-100 text-green-700',
              )}>
                {risk.status}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-gray-900">{risk.title}</h1>
            <p className="text-sm text-gray-500">{risk.category} · Owner: {risk.owner?.name ?? '—'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={risk.status}
            disabled={updatingStatus}
            onChange={(e) => changeStatus(e.target.value as RiskStatus)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — main detail */}
        <div className="space-y-6 lg:col-span-2">

          {/* Description */}
          {risk.description && (
            <Card title="Description">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{risk.description}</p>
            </Card>
          )}

          {/* Scoring */}
          <Card title="Risk Scoring">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">Inherent Risk</p>
                <RiskScoreBadge score={risk.inherent_score} level={risk.risk_level} />
                <p className="mt-1 text-xs text-gray-400">Likelihood {risk.likelihood} × Impact {risk.impact}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">Residual Risk</p>
                <RiskScoreBadge score={risk.residual_score} level={risk.residual_level} />
                {risk.residual_likelihood && risk.residual_impact && (
                  <p className="mt-1 text-xs text-gray-400">Likelihood {risk.residual_likelihood} × Impact {risk.residual_impact}</p>
                )}
              </div>
            </div>
          </Card>

          {/* RCA */}
          {risk.rca_method && risk.rca_data && (
            <Card title={`Root Cause Analysis — ${risk.rca_method === 'fishbone' ? 'Fishbone (Ishikawa)' : '5-Why Analysis'}`}>
              {risk.rca_method === 'fishbone' && 'causes' in risk.rca_data && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(risk.rca_data.causes).map(([key, value]) => (
                    value ? (
                      <div key={key}>
                        <p className="text-xs font-semibold capitalize text-gray-500">{key}</p>
                        <p className="text-sm text-gray-700">{String(value)}</p>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
              {risk.rca_method === 'five_why' && 'whys' in risk.rca_data && (
                <div className="space-y-3">
                  {risk.rca_data.whys.map((pair, i) => (
                    (pair.why || pair.answer) ? (
                      <div key={i} className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-blue-600">Why #{i + 1}: {pair.why}</p>
                        <p className="mt-1 text-sm text-gray-700">{pair.answer}</p>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Treatment */}
          {risk.treatment && (
            <Card title={`Treatment — ${risk.treatment}`}>
              {risk.treatment_plan && risk.treatment_plan.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Action</th>
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Owner</th>
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Due</th>
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {risk.treatment_plan.map((action, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-3 text-gray-900">{action.action}</td>
                        <td className="py-2 pr-3 text-gray-600">{action.owner_name ?? '—'}</td>
                        <td className="py-2 pr-3 text-gray-600">{formatDate(action.target_date)}</td>
                        <td className="py-2">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            action.status === 'Complete'   ? 'bg-green-100 text-green-700' :
                            action.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                              'bg-gray-100 text-gray-600',
                          )}>
                            {action.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-400">No treatment actions recorded.</p>
              )}
            </Card>
          )}

          {/* Linked Controls */}
          {risk.controls && risk.controls.length > 0 && (
            <Card title={`Linked Controls (${risk.controls.length})`}>
              <div className="flex flex-wrap gap-2">
                {risk.controls.map((c) => (
                  <Link
                    key={c.id}
                    href={`/controls/${c.id}`}
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

          {/* Linked Assets */}
          {risk.assets && risk.assets.length > 0 && (
            <Card title={`Linked Assets (${risk.assets.length})`}>
              <div className="flex flex-wrap gap-2">
                {risk.assets.map((a) => (
                  <Link
                    key={a.id}
                    href={`/assets/${a.id}`}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="font-mono">{a.asset_id}</span>
                    <span className="text-gray-500">{a.name}</span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column — meta + audit */}
        <div className="space-y-6">
          <Card title="Details">
            <dl className="space-y-3">
              <MetaRow label="Risk ID"><span className="font-mono">{risk.risk_id}</span></MetaRow>
              <MetaRow label="Category">{risk.category}</MetaRow>
              <MetaRow label="FCA Tags">
                <div className="flex flex-wrap gap-1">
                  {risk.fca_tags?.length > 0
                    ? risk.fca_tags.map((t) => (
                        <span key={t} className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', FCA_TAG_COLORS[t])}>{t}</span>
                      ))
                    : <span className="text-gray-400">—</span>}
                </div>
              </MetaRow>
              <MetaRow label="Owner">{risk.owner?.name ?? '—'}</MetaRow>
              <MetaRow label="Review Date">{formatDate(risk.review_date)}</MetaRow>
              <MetaRow label="Created">{formatDate(risk.created_at)}</MetaRow>
              <MetaRow label="Updated">{formatDate(risk.updated_at)}</MetaRow>
            </dl>
          </Card>

          {/* Audit trail */}
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
                    {entry.changed_fields?.length > 0 && (
                      <p className="mt-0.5 text-gray-400">Changed: {entry.changed_fields.join(', ')}</p>
                    )}
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

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-right text-xs text-gray-900">{children}</dd>
    </div>
  );
}
