import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { RiskCategory, FcaTag, RcaMethod, FishboneData, FiveWhyData, RiskTreatment, TreatmentAction, AssetType, AssetClassification, AssetLocationType, ThirdParty } from '@/types';

// ─── Risk Wizard State ─────────────────────────────────────────────────────────

export interface RiskWizardData {
  category: RiskCategory | '';
  fca_tags: FcaTag[];
  title: string;
  description: string;
  owner_id: string | null;
  likelihood: number | null;
  impact: number | null;
  rca_method: RcaMethod | null;
  rca_data: FishboneData | FiveWhyData | null;
  treatment: RiskTreatment | null;
  treatment_plan: TreatmentAction[];
  control_ids: string[];
  review_date: string | null;
  status: 'Open' | 'In Review';
}

interface RiskWizardStore {
  step: number;
  data: RiskWizardData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<RiskWizardData>) => void;
  reset: () => void;
}

const defaultRiskData: RiskWizardData = {
  category: '',
  fca_tags: [],
  title: '',
  description: '',
  owner_id: null,
  likelihood: null,
  impact: null,
  rca_method: null,
  rca_data: null,
  treatment: null,
  treatment_plan: [],
  control_ids: [],
  review_date: null,
  status: 'Open',
};

function normaliseRiskData(data: Partial<RiskWizardData> | undefined): RiskWizardData {
  return {
    ...defaultRiskData,
    ...data,
    fca_tags: Array.isArray(data?.fca_tags) ? data.fca_tags : [],
    treatment_plan: Array.isArray(data?.treatment_plan) ? data.treatment_plan : [],
    control_ids: Array.isArray(data?.control_ids) ? data.control_ids : [],
  };
}

export const useRiskWizardStore = create<RiskWizardStore>()(
  persist(
    (set) => ({
      step: 1,
      data: normaliseRiskData(),
      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 7) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
      updateData: (partial) => set((s) => ({ data: normaliseRiskData({ ...s.data, ...partial }) })),
      reset: () => set({ step: 1, data: defaultRiskData }),
    }),
    {
      name: 'grc-risk-wizard',
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => {
        const state = persisted as Partial<RiskWizardStore> | undefined;

        return {
          ...current,
          ...state,
          data: normaliseRiskData(state?.data),
        };
      },
    },
  ),
);

// ─── Asset Wizard State ────────────────────────────────────────────────────────

export interface AssetWizardData {
  asset_type: AssetType | '';
  name: string;
  description: string;
  owner_id: string | null;
  custodian_id: string | null;
  location_type: AssetLocationType | null;
  location_detail: string;
  classification: AssetClassification | '';
  is_personal_data: boolean;
  is_special_category: boolean;
  lawful_basis: string | null;
  special_category_basis: string | null;
  data_subjects: string[];
  retention_period: string;
  international_transfers: boolean;
  transfer_safeguards: string;
  third_parties: ThirdParty[];
  risk_ids: string[];
  control_ids: string[];
  review_date: string | null;
}

interface AssetWizardStore {
  step: number;
  data: AssetWizardData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<AssetWizardData>) => void;
  reset: () => void;
}

const defaultAssetData: AssetWizardData = {
  asset_type: '',
  name: '',
  description: '',
  owner_id: null,
  custodian_id: null,
  location_type: null,
  location_detail: '',
  classification: '',
  is_personal_data: false,
  is_special_category: false,
  lawful_basis: null,
  special_category_basis: null,
  data_subjects: [],
  retention_period: '',
  international_transfers: false,
  transfer_safeguards: '',
  third_parties: [],
  risk_ids: [],
  control_ids: [],
  review_date: null,
};

export const useAssetWizardStore = create<AssetWizardStore>()(
  persist(
    (set) => ({
      step: 1,
      data: defaultAssetData,
      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 7) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
      updateData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
      reset: () => set({ step: 1, data: defaultAssetData }),
    }),
    {
      name: 'grc-asset-wizard',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

// ─── UI Store ──────────────────────────────────────────────────────────────────

interface UiStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    }),
    { name: 'grc-ui', storage: createJSONStorage(() => localStorage) },
  ),
);
