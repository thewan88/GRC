// ─── API Response Envelope ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  errors: null | Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
}

// ─── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'risk_manager' | 'asset_owner' | 'viewer';
  is_active: boolean;
  last_login: string | null;
  created_at?: string;
}

export interface UserRef {
  id: string;
  name: string;
}

// ─── Risk ──────────────────────────────────────────────────────────────────────

export type RiskCategory = 'Operational' | 'Regulatory' | 'Financial' | 'Technology' | 'Reputational' | 'Strategic' | 'Third-Party/Outsourcing';
export type RiskLevel    = 'Critical' | 'High' | 'Medium' | 'Low';
export type RiskStatus   = 'Open' | 'In Review' | 'Closed';
export type RiskTreatment = 'Accept' | 'Mitigate' | 'Transfer' | 'Avoid';
export type FcaTag = 'SYSC' | 'COBS' | 'MAR' | 'Operational Resilience';
export type RcaMethod = 'fishbone' | 'five_why';

export interface TreatmentAction {
  action: string;
  owner_id: string | null;
  owner_name?: string;
  target_date: string | null;
  status: 'Not Started' | 'In Progress' | 'Complete';
}

export interface FishboneData {
  causes: {
    people:      string;
    process:     string;
    technology:  string;
    environment: string;
    management:  string;
    materials:   string;
  };
}

export interface FiveWhyData {
  whys: Array<{ why: string; answer: string }>;
}

export interface ControlRef {
  id: string;
  ref: string;
  name: string;
}

export interface Risk {
  id: string;
  risk_id: string;
  title: string;
  description: string | null;
  category: RiskCategory;
  fca_tags: FcaTag[];
  owner: UserRef | null;
  likelihood: number;
  impact: number;
  inherent_score: number;
  risk_level: RiskLevel;
  treatment: RiskTreatment | null;
  residual_likelihood: number | null;
  residual_impact: number | null;
  residual_score: number | null;
  residual_level: RiskLevel | null;
  review_date: string | null;
  status: RiskStatus;
  created_at: string;
  updated_at: string;
  controls: ControlRef[];
  // Detailed view only
  rca_method?: RcaMethod | null;
  rca_data?: FishboneData | FiveWhyData | null;
  treatment_plan?: TreatmentAction[];
  created_by?: UserRef | null;
  assets?: Array<{ id: string; asset_id: string; name: string }>;
}

// ─── Asset ─────────────────────────────────────────────────────────────────────

export type AssetType           = 'Data' | 'System' | 'Software' | 'People' | 'Physical' | 'Service';
export type AssetClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';
export type AssetLocationType   = 'on-prem' | 'cloud' | 'third-party' | 'hybrid';
export type AssetStatus         = 'Active' | 'Archived' | 'Disposed';

export interface ThirdParty {
  id?: string;
  party_name: string;
  purpose: string | null;
  dpa_reference: string | null;
}

export interface Asset {
  id: string;
  asset_id: string;
  name: string;
  description: string | null;
  asset_type: AssetType;
  owner: UserRef | null;
  custodian: UserRef | null;
  classification: AssetClassification;
  is_personal_data: boolean;
  is_special_category: boolean;
  lawful_basis: string | null;
  retention_period: string | null;
  international_transfers: boolean;
  location_type: AssetLocationType | null;
  location_detail: string | null;
  review_date: string | null;
  status: AssetStatus;
  gdpr_completeness: number;
  third_parties: ThirdParty[];
  created_at: string;
  updated_at: string;
  // Detailed view only
  special_category_basis?: string | null;
  data_subjects?: string[];
  transfer_safeguards?: string | null;
  vulnerability_notes?: string | null;
  risks?: Array<{ id: string; risk_id: string; title: string; status: RiskStatus }>;
  controls?: ControlRef[];
  created_by?: UserRef | null;
}

// ─── Control ───────────────────────────────────────────────────────────────────

export type ControlTheme  = 'Organisational' | 'People' | 'Physical' | 'Technological';
export type ControlStatus = 'Not Applicable' | 'Not Implemented' | 'Planned' | 'Partially Implemented' | 'Implemented' | 'Tested';

export interface EvidenceItem {
  title: string;
  url_or_ref: string;
  added_at: string;
}

export interface Control {
  id: string;
  control_ref: string;
  name: string;
  description: string;
  theme: ControlTheme;
  status: ControlStatus;
  is_applicable: boolean;
  is_implemented: boolean;
  na_justification: string | null;
  implementation_notes: string | null;
  evidence: EvidenceItem[];
  owner: UserRef | null;
  last_review_date: string | null;
  updated_at: string;
  // Detailed view only
  risks?: Array<{ id: string; risk_id: string; title: string; status: RiskStatus }>;
  assets?: Array<{ id: string; asset_id: string; name: string }>;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  risks_by_level: Record<RiskLevel, number>;
  total_open_risks: number;
  control_compliance: Record<ControlTheme, { total: number; applicable: number; implemented: number; percentage: number }>;
  gdpr: {
    total_assets: number;
    personal_data_assets: number;
    by_classification: Record<AssetClassification, number>;
  };
  treatment_plan: { overdue: number; dueSoon: number; onTrack: number };
}

export interface HeatMapCell {
  likelihood: number;
  impact: number;
  score: number;
  level: RiskLevel;
  count: number;
}

export interface RiskTrendPoint {
  month: string;
  label: string;
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
}

export interface UpcomingItem {
  type: 'risk' | 'asset';
  id: string;
  ref: string;
  title: string;
  owner: string | null;
  review_date: string;
  level: RiskLevel | null;
}

// ─── Audit Log ─────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  user: { id?: string; name?: string; email: string };
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  resource_type: string;
  resource_id: string;
  resource_ref: string | null;
  changed_fields: string[];
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ─── Trust Centre ──────────────────────────────────────────────────────────────

export interface TrustCentreProfile {
  company_name: string;
  tagline: string | null;
  logo_path: string | null;
  contact_email: string | null;
  fca_reference: string | null;
  ico_reference: string | null;
  iso_cert_number: string | null;
  description: string | null;
}

export interface TrustCentreCertification {
  id: string;
  name: string;
  issuer: string | null;
  certificate_number: string | null;
  issued_date: string | null;
  expiry_date: string | null;
  is_published: boolean;
  display_order: number;
}

export interface TrustCentreDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  visibility: 'public' | 'request_required' | 'nda_required';
  version: string | null;
  file_name: string | null;
  file_size: number | null;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
}
