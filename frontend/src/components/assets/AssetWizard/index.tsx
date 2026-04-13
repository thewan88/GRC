'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAssetWizardStore } from '@/store/wizardStore';
import { createAsset } from '@/hooks/useAssets';
import Step1Type          from './Step1Type';
import Step2CoreDetails   from './Step2CoreDetails';
import Step3Classification from './Step3Classification';
import Step4GDPR          from './Step4GDPR';
import Step5ThirdParties  from './Step5ThirdParties';
import Step6LinkRisks     from './Step6LinkRisks';
import Step7LinkControls  from './Step7LinkControls';
import type { AssetType, AssetClassification, AssetLocationType } from '@/types';

const STEPS = [
  { number: 1, label: 'Type'           },
  { number: 2, label: 'Details'        },
  { number: 3, label: 'Classification' },
  { number: 4, label: 'GDPR'           },
  { number: 5, label: 'Third Parties'  },
  { number: 6, label: 'Link Risks'     },
  { number: 7, label: 'Controls'       },
];

function canProceed(step: number, data: ReturnType<typeof useAssetWizardStore>['data']): boolean {
  switch (step) {
    case 1: return !!data.asset_type;
    case 2: return !!data.name.trim();
    case 3: return !!data.classification;
    default: return true;
  }
}

export default function AssetWizard() {
  const router = useRouter();
  const store  = useAssetWizardStore();
  const { step, data, nextStep, prevStep, updateData, reset } = store;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const asset = await createAsset({
        asset_type:              data.asset_type,
        name:                    data.name,
        description:             data.description || null,
        owner_id:                data.owner_id,
        custodian_id:            data.custodian_id,
        location_type:           data.location_type,
        location_detail:         data.location_detail || null,
        classification:          data.classification,
        is_personal_data:        data.is_personal_data,
        is_special_category:     data.is_special_category,
        lawful_basis:            data.lawful_basis,
        special_category_basis:  data.special_category_basis,
        data_subjects:           data.data_subjects,
        retention_period:        data.retention_period || null,
        international_transfers: data.international_transfers,
        transfer_safeguards:     data.transfer_safeguards || null,
        third_parties:           data.third_parties,
        risk_ids:                data.risk_ids,
        control_ids:             data.control_ids,
        review_date:             data.review_date,
      });
      reset();
      router.push(`/assets/${asset.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save asset. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <nav className="mb-8">
        <ol className="flex items-center">
          {STEPS.map(({ number, label }, i) => {
            const done    = step > number;
            const current = step === number;
            return (
              <li key={number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                    done    ? 'bg-blue-600 text-white' :
                    current ? 'border-2 border-blue-600 bg-white text-blue-600' :
                              'border-2 border-gray-300 bg-white text-gray-400',
                  )}>
                    {done ? '✓' : number}
                  </div>
                  <span className={cn('mt-1 hidden text-xs sm:block', current ? 'font-semibold text-blue-600' : 'text-gray-400')}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 border-t-2 mx-1', done ? 'border-blue-600' : 'border-gray-200')} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-gray-900">
          Step {step}: {STEPS[step - 1].label}
        </h2>

        {step === 1 && (
          <Step1Type
            asset_type={data.asset_type}
            onChange={(asset_type) => updateData({ asset_type: asset_type as AssetType | '' })}
          />
        )}
        {step === 2 && (
          <Step2CoreDetails
            name={data.name}
            description={data.description}
            owner_id={data.owner_id}
            custodian_id={data.custodian_id}
            location_type={data.location_type}
            location_detail={data.location_detail}
            onChange={(partial) => updateData(partial)}
          />
        )}
        {step === 3 && (
          <Step3Classification
            classification={data.classification}
            onChange={(cls) => updateData({ classification: cls as AssetClassification | '' })}
          />
        )}
        {step === 4 && (
          <Step4GDPR
            is_personal_data={data.is_personal_data}
            is_special_category={data.is_special_category}
            lawful_basis={data.lawful_basis}
            special_category_basis={data.special_category_basis}
            data_subjects={data.data_subjects}
            retention_period={data.retention_period}
            international_transfers={data.international_transfers}
            transfer_safeguards={data.transfer_safeguards}
            onChange={(partial) => updateData(partial)}
          />
        )}
        {step === 5 && (
          <Step5ThirdParties
            third_parties={data.third_parties}
            onChange={(third_parties) => updateData({ third_parties })}
          />
        )}
        {step === 6 && (
          <Step6LinkRisks
            risk_ids={data.risk_ids}
            onChange={(risk_ids) => updateData({ risk_ids })}
          />
        )}
        {step === 7 && (
          <Step7LinkControls
            control_ids={data.control_ids}
            review_date={data.review_date}
            onChange={(partial) => updateData(partial)}
          />
        )}

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={step === 1 ? () => router.push('/assets') : prevStep}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {step === 1 ? 'Cancel' : '← Back'}
        </button>

        {step < 7 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed(step, data)}
            className={cn(
              'rounded-md px-5 py-2 text-sm font-semibold text-white',
              canProceed(step, data) ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-gray-300',
            )}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Register Asset'}
          </button>
        )}
      </div>
    </div>
  );
}
