'use client';

import { cn } from '@/lib/utils';

const LAWFUL_BASES_ART6 = [
  { value: 'consent',              label: 'Consent (Art. 6(1)(a))',               description: 'Data subject has given consent.' },
  { value: 'contract',             label: 'Contract (Art. 6(1)(b))',              description: 'Necessary for a contract with the data subject.' },
  { value: 'legal_obligation',     label: 'Legal Obligation (Art. 6(1)(c))',      description: 'Required by law.' },
  { value: 'vital_interests',      label: 'Vital Interests (Art. 6(1)(d))',       description: 'To protect vital interests of the data subject.' },
  { value: 'public_task',          label: 'Public Task (Art. 6(1)(e))',           description: 'In the public interest or official authority.' },
  { value: 'legitimate_interests', label: 'Legitimate Interests (Art. 6(1)(f))', description: 'Legitimate interests of the controller or third party.' },
];

const LAWFUL_BASES_ART9 = [
  { value: 'explicit_consent',       label: 'Explicit Consent (Art. 9(2)(a))'      },
  { value: 'employment_law',         label: 'Employment / Social Security Law (Art. 9(2)(b))' },
  { value: 'vital_interests_art9',   label: 'Vital Interests (Art. 9(2)(c))'       },
  { value: 'not_for_profit',         label: 'Not-for-Profit Body (Art. 9(2)(d))'   },
  { value: 'made_public',            label: 'Manifestly Made Public (Art. 9(2)(e))'},
  { value: 'legal_claims',           label: 'Legal Claims (Art. 9(2)(f))'          },
  { value: 'substantial_public',     label: 'Substantial Public Interest (Art. 9(2)(g))'},
  { value: 'health_care',            label: 'Health / Social Care (Art. 9(2)(h))' },
  { value: 'public_health',          label: 'Public Health (Art. 9(2)(i))'         },
  { value: 'archiving',              label: 'Archiving / Research / Statistics (Art. 9(2)(j))'},
];

const DATA_SUBJECT_OPTIONS = ['Employees', 'Clients / Investors', 'Prospective Clients', 'Contractors', 'Beneficiaries', 'Third Parties', 'Public'];

interface Props {
  is_personal_data: boolean;
  is_special_category: boolean;
  lawful_basis: string | null;
  special_category_basis: string | null;
  data_subjects: string[];
  retention_period: string;
  international_transfers: boolean;
  transfer_safeguards: string;
  onChange: (partial: {
    is_personal_data?: boolean;
    is_special_category?: boolean;
    lawful_basis?: string | null;
    special_category_basis?: string | null;
    data_subjects?: string[];
    retention_period?: string;
    international_transfers?: boolean;
    transfer_safeguards?: string;
  }) => void;
}

export default function Step4GDPR({
  is_personal_data, is_special_category, lawful_basis, special_category_basis,
  data_subjects, retention_period, international_transfers, transfer_safeguards, onChange,
}: Props) {
  function toggleSubject(s: string) {
    const next = data_subjects.includes(s) ? data_subjects.filter((x) => x !== s) : [...data_subjects, s];
    onChange({ data_subjects: next });
  }

  return (
    <div className="space-y-5">
      {/* Personal data toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <input
          id="is_personal_data"
          type="checkbox"
          checked={is_personal_data}
          onChange={(e) => onChange({ is_personal_data: e.target.checked, is_special_category: e.target.checked ? is_special_category : false })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="is_personal_data" className="cursor-pointer">
          <span className="text-sm font-semibold text-gray-900">Contains Personal Data (UK GDPR)</span>
          <p className="text-xs text-gray-500">Any information relating to an identified or identifiable natural person.</p>
        </label>
      </div>

      {is_personal_data && (
        <>
          {/* Special category */}
          <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <input
              id="is_special_category"
              type="checkbox"
              checked={is_special_category}
              onChange={(e) => onChange({ is_special_category: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="is_special_category" className="cursor-pointer">
              <span className="text-sm font-semibold text-gray-900">Special Category Data (Art. 9)</span>
              <p className="text-xs text-gray-500">Health, biometric, racial/ethnic origin, religious beliefs, etc.</p>
            </label>
          </div>

          {/* Data subjects */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Data Subjects</label>
            <div className="flex flex-wrap gap-2">
              {DATA_SUBJECT_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    data_subjects.includes(s)
                      ? 'border-blue-500 bg-blue-100 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-blue-300',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Lawful basis Art.6 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Lawful Basis — Art. 6 <span className="text-red-500">*</span></label>
            <select
              value={lawful_basis ?? ''}
              onChange={(e) => onChange({ lawful_basis: e.target.value || null })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">— Select lawful basis —</option>
              {LAWFUL_BASES_ART6.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Special category Art.9 basis */}
          {is_special_category && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Special Category Basis — Art. 9 <span className="text-red-500">*</span></label>
              <select
                value={special_category_basis ?? ''}
                onChange={(e) => onChange({ special_category_basis: e.target.value || null })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— Select basis —</option>
                {LAWFUL_BASES_ART9.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Retention period */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Retention Period</label>
            <input
              type="text"
              value={retention_period}
              onChange={(e) => onChange({ retention_period: e.target.value })}
              placeholder="e.g. 7 years from contract end, Delete within 30 days of request"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* International transfers */}
          <div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <input
                id="int_transfers"
                type="checkbox"
                checked={international_transfers}
                onChange={(e) => onChange({ international_transfers: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label htmlFor="int_transfers" className="cursor-pointer">
                <span className="text-sm font-semibold text-gray-900">International Transfers</span>
                <p className="text-xs text-gray-500">Data transferred outside the UK/EEA.</p>
              </label>
            </div>
            {international_transfers && (
              <textarea
                value={transfer_safeguards}
                onChange={(e) => onChange({ transfer_safeguards: e.target.value })}
                rows={2}
                placeholder="Describe transfer safeguards (e.g. Standard Contractual Clauses, adequacy decision)..."
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>
        </>
      )}

      {!is_personal_data && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          Tick the checkbox above if this asset contains personal data to unlock GDPR fields.
        </div>
      )}
    </div>
  );
}
