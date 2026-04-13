'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRiskWizardStore } from '@/store/wizardStore';
import { createRisk } from '@/hooks/useRisks';
import Step1Category  from './Step1Category';
import Step2Details   from './Step2Details';
import Step3Scoring   from './Step3Scoring';
import Step4RCA       from './Step4RCA';
import Step5Treatment from './Step5Treatment';
import Step6Controls  from './Step6Controls';
import Step7Summary   from './Step7Summary';
import type { FcaTag, RcaMethod, RiskCategory, RiskTreatment, TreatmentAction, FishboneData, FiveWhyData } from '@/types';
import { useState } from 'react';

const STEPS = [
  { number: 1, label: 'Category'  },
  { number: 2, label: 'Details'   },
  { number: 3, label: 'Scoring'   },
  { number: 4, label: 'RCA'       },
  { number: 5, label: 'Treatment' },
  { number: 6, label: 'Controls'  },
  { number: 7, label: 'Review'    },
];

function canProceed(step: number, data: ReturnType<typeof useRiskWizardStore>['data']): boolean {
  switch (step) {
    case 1: return !!data.category;
    case 2: return !!data.title.trim();
    case 3: return !!data.likelihood && !!data.impact;
    case 4: return true; // RCA optional
    case 5: return !!data.treatment;
    case 6: return true; // Controls optional
    case 7: return true;
    default: return true;
  }
}

export default function RiskWizard() {
  const router  = useRouter();
  const store   = useRiskWizardStore();
  const { step, data, nextStep, prevStep, updateData, reset } = store;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        category:             data.category,
        fca_tags:             data.fca_tags,
        title:                data.title,
        description:          data.description || null,
        owner_id:             data.owner_id,
        likelihood:           data.likelihood,
        impact:               data.impact,
        rca_method:           data.rca_method,
        rca_data:             data.rca_data,
        treatment:            data.treatment,
        treatment_plan:       data.treatment_plan,
        residual_likelihood:  data.residual_likelihood,
        residual_impact:      data.residual_impact,
        control_ids:          data.control_ids,
        review_date:          data.review_date,
        status:               data.status,
      };
      const risk = await createRisk(payload);
      reset();
      router.push(`/risks/${risk.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save risk. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step progress bar */}
      <nav className="mb-8">
        <ol className="flex items-center">
          {STEPS.map(({ number, label }, i) => {
            const done    = step > number;
            const current = step === number;
            return (
              <li key={number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                    done    ? 'bg-blue-600 text-white' :
                    current ? 'border-2 border-blue-600 bg-white text-blue-600' :
                              'border-2 border-gray-300 bg-white text-gray-400',
                  )}>
                    {done ? '✓' : number}
                  </div>
                  <span className={cn(
                    'mt-1 hidden text-xs sm:block',
                    current ? 'font-semibold text-blue-600' : 'text-gray-400',
                  )}>
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

      {/* Step content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Step {step}: {STEPS[step - 1].label}
          </h2>
        </div>

        {step === 1 && (
          <Step1Category
            category={data.category}
            fca_tags={data.fca_tags}
            onChange={(category, fca_tags) => updateData({ category: category as RiskCategory | '', fca_tags })}
          />
        )}
        {step === 2 && (
          <Step2Details
            title={data.title}
            description={data.description}
            owner_id={data.owner_id}
            onChange={(partial) => updateData(partial)}
          />
        )}
        {step === 3 && (
          <Step3Scoring
            likelihood={data.likelihood}
            impact={data.impact}
            onChange={(likelihood, impact) => updateData({ likelihood, impact })}
          />
        )}
        {step === 4 && (
          <Step4RCA
            rca_method={data.rca_method}
            rca_data={data.rca_data}
            onChange={(rca_method, rca_data) => updateData({
              rca_method: rca_method as RcaMethod | null,
              rca_data: rca_data as FishboneData | FiveWhyData | null,
            })}
          />
        )}
        {step === 5 && (
          <Step5Treatment
            treatment={data.treatment}
            treatment_plan={data.treatment_plan}
            residual_likelihood={data.residual_likelihood}
            residual_impact={data.residual_impact}
            onChange={(partial) => updateData({
              treatment:           partial.treatment as RiskTreatment | null | undefined,
              treatment_plan:      partial.treatment_plan as TreatmentAction[] | undefined,
              residual_likelihood: partial.residual_likelihood,
              residual_impact:     partial.residual_impact,
            })}
          />
        )}
        {step === 6 && (
          <Step6Controls
            control_ids={data.control_ids}
            onChange={(control_ids) => updateData({ control_ids })}
          />
        )}
        {step === 7 && (
          <Step7Summary
            data={data}
            onReviewDateChange={(review_date) => updateData({ review_date })}
            onStatusChange={(status) => updateData({ status })}
          />
        )}

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={step === 1 ? () => router.push('/risks') : prevStep}
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
              'rounded-md px-5 py-2 text-sm font-semibold text-white transition-all',
              canProceed(step, data)
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-300',
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
            {submitting ? 'Saving…' : 'Register Risk'}
          </button>
        )}
      </div>
    </div>
  );
}
