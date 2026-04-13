'use client';

import { cn, scoreToLevel, riskLevelColor, formatDate } from '@/lib/utils';
import { useControls } from '@/hooks/useControls';
import { useUsers } from '@/hooks/useUsers';
import type { RiskWizardData } from '@/store/wizardStore';

interface Props {
  data: RiskWizardData;
  onReviewDateChange: (date: string | null) => void;
  onStatusChange: (status: 'Open' | 'In Review') => void;
}

export default function Step7Summary({ data, onReviewDateChange, onStatusChange }: Props) {
  const { data: controlsData } = useControls();
  const { data: usersData }    = useUsers();
  const allControls = controlsData?.data ?? [];
  const allUsers    = usersData?.data ?? [];

  const inherentScore  = data.likelihood && data.impact ? data.likelihood * data.impact : null;
  const residualScore  = data.residual_likelihood && data.residual_impact ? data.residual_likelihood * data.residual_impact : null;
  const inherentLevel  = inherentScore ? scoreToLevel(inherentScore) : null;
  const residualLevel  = residualScore ? scoreToLevel(residualScore) : null;
  const owner          = allUsers.find((u) => u.id === data.owner_id);
  const linkedControls = allControls.filter((c) => data.control_ids.includes(c.id));

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Review all details before submitting. You can go back to edit any section.</p>

      {/* Core details */}
      <Section title="Risk Details">
        <Row label="Category">{data.category || '—'}</Row>
        <Row label="FCA Tags">
          {data.fca_tags.length > 0
            ? data.fca_tags.map((t) => (
                <span key={t} className="mr-1 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-800">{t}</span>
              ))
            : '—'}
        </Row>
        <Row label="Title"><span className="font-medium">{data.title || '—'}</span></Row>
        <Row label="Description">{data.description || '—'}</Row>
        <Row label="Risk Owner">{owner ? `${owner.full_name} (${owner.email})` : '—'}</Row>
      </Section>

      {/* Scoring */}
      <Section title="Risk Scoring">
        <Row label="Inherent Score">
          {inherentScore && inherentLevel ? (
            <span className={cn('rounded-md border px-2 py-0.5 text-sm font-semibold', riskLevelColor(inherentLevel))}>
              {inherentScore} — {inherentLevel}
            </span>
          ) : '—'}
        </Row>
        <Row label="Residual Score">
          {residualScore && residualLevel ? (
            <span className={cn('rounded-md border px-2 py-0.5 text-sm font-semibold', riskLevelColor(residualLevel))}>
              {residualScore} — {residualLevel}
            </span>
          ) : '—'}
        </Row>
      </Section>

      {/* RCA */}
      <Section title="Root Cause Analysis">
        <Row label="Method">{data.rca_method ? (data.rca_method === 'fishbone' ? 'Fishbone (Ishikawa)' : '5-Why Analysis') : '—'}</Row>
      </Section>

      {/* Treatment */}
      <Section title="Treatment">
        <Row label="Strategy">{data.treatment || '—'}</Row>
        <Row label="Actions">{data.treatment_plan.length > 0 ? `${data.treatment_plan.length} action(s)` : '—'}</Row>
      </Section>

      {/* Controls */}
      {linkedControls.length > 0 && (
        <Section title={`Linked Controls (${linkedControls.length})`}>
          <div className="flex flex-wrap gap-1">
            {linkedControls.map((c) => (
              <span key={c.id} className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                {c.control_ref} — {c.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Review date + status */}
      <Section title="Schedule & Status">
        <Row label="Review Date">
          <input
            type="date"
            value={data.review_date ?? ''}
            onChange={(e) => onReviewDateChange(e.target.value || null)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </Row>
        <Row label="Status">
          <select
            value={data.status}
            onChange={(e) => onStatusChange(e.target.value as 'Open' | 'In Review')}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
          </select>
        </Row>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      </div>
      <div className="divide-y divide-gray-100 px-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5">
      <span className="w-32 flex-shrink-0 text-xs font-medium text-gray-500">{label}</span>
      <span className="flex-1 text-sm text-gray-900">{children}</span>
    </div>
  );
}
