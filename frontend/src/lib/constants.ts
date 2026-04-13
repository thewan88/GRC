export const RISK_CATEGORIES = [
  'Operational',
  'Regulatory',
  'Financial',
  'Technology',
  'Reputational',
  'Strategic',
  'Third-Party/Outsourcing',
] as const;

export const FCA_TAGS = ['SYSC', 'COBS', 'MAR', 'Operational Resilience'] as const;

export const RISK_STATUSES = ['Open', 'In Review', 'Closed'] as const;

export const RISK_TREATMENTS = ['Accept', 'Mitigate', 'Transfer', 'Avoid'] as const;

export const ASSET_TYPES = ['Data', 'System', 'Software', 'People', 'Physical', 'Service'] as const;

export const ASSET_CLASSIFICATIONS = ['Public', 'Internal', 'Confidential', 'Restricted'] as const;

export const ASSET_LOCATION_TYPES = ['on-prem', 'cloud', 'third-party', 'hybrid'] as const;

export const ASSET_STATUSES = ['Active', 'Archived', 'Disposed'] as const;

export const CONTROL_THEMES = ['Organisational', 'People', 'Physical', 'Technological'] as const;

export const CONTROL_STATUSES = [
  'Not Applicable',
  'Not Implemented',
  'Planned',
  'Partially Implemented',
  'Implemented',
  'Tested',
] as const;

export const GDPR_LAWFUL_BASIS_OPTIONS = [
  { value: 'consent',              label: 'Art.6(1)(a) — Consent' },
  { value: 'contract',             label: 'Art.6(1)(b) — Contract performance' },
  { value: 'legal_obligation',     label: 'Art.6(1)(c) — Legal obligation' },
  { value: 'vital_interests',      label: 'Art.6(1)(d) — Vital interests' },
  { value: 'public_task',          label: 'Art.6(1)(e) — Public task' },
  { value: 'legitimate_interests', label: 'Art.6(1)(f) — Legitimate interests' },
] as const;

export const GDPR_ART9_BASIS_OPTIONS = [
  { value: 'explicit_consent',     label: 'Art.9(2)(a) — Explicit consent' },
  { value: 'employment_law',       label: 'Art.9(2)(b) — Employment law obligations' },
  { value: 'vital_interests',      label: 'Art.9(2)(c) — Vital interests' },
  { value: 'not_for_profit',       label: 'Art.9(2)(d) — Not-for-profit body' },
  { value: 'made_public',          label: 'Art.9(2)(e) — Manifestly made public' },
  { value: 'legal_claims',         label: 'Art.9(2)(f) — Legal claims' },
  { value: 'substantial_public',   label: 'Art.9(2)(g) — Substantial public interest' },
  { value: 'health_care',          label: 'Art.9(2)(h) — Health/social care' },
  { value: 'public_health',        label: 'Art.9(2)(i) — Public health' },
  { value: 'archiving_research',   label: 'Art.9(2)(j) — Archiving/research/statistics' },
] as const;

export const TRUST_CENTRE_DOCUMENT_CATEGORIES = [
  'Policy', 'DPA', 'PenTest', 'Certificate', 'Report', 'Other',
] as const;

export const ROLES = ['admin', 'risk_manager', 'asset_owner', 'viewer'] as const;

export const ROLE_LABELS: Record<string, string> = {
  admin:        'Admin',
  risk_manager: 'Risk Manager',
  asset_owner:  'Asset Owner',
  viewer:       'Viewer',
};

export const LIKELIHOOD_LABELS: Record<number, string> = {
  1: 'Rare',
  2: 'Unlikely',
  3: 'Possible',
  4: 'Likely',
  5: 'Almost Certain',
};

export const IMPACT_LABELS: Record<number, string> = {
  1: 'Negligible',
  2: 'Minor',
  3: 'Moderate',
  4: 'Major',
  5: 'Catastrophic',
};
