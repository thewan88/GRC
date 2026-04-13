import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import type { TrustCentreProfile, TrustCentreCertification, TrustCentreDocument, ApiResponse } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);
const publicFetcher = (url: string) => api.get(url).then((r) => r.data.data);

// ─── Admin hooks (Sanctum-protected) ──────────────────────────────────────────

export function useTrustCentreProfile() {
  return useSWR<ApiResponse<TrustCentreProfile>>('/trust-centre/profile', fetcher);
}

export function useTrustCentreCertifications() {
  return useSWR<ApiResponse<TrustCentreCertification[]>>('/trust-centre/certifications', fetcher);
}

export function useTrustCentreDocuments() {
  return useSWR<ApiResponse<TrustCentreDocument[]>>('/trust-centre/documents', fetcher);
}

export async function updateProfile(data: Partial<TrustCentreProfile>) {
  const res = await api.put('/trust-centre/profile', data);
  await mutate('/trust-centre/profile', undefined, { revalidate: true });
  return res.data.data as TrustCentreProfile;
}

export async function toggleDocumentPublished(id: string, is_published: boolean) {
  const res = await api.patch(`/trust-centre/documents/${id}`, { is_published });
  await mutate('/trust-centre/documents', undefined, { revalidate: true });
  return res.data.data as TrustCentreDocument;
}

export async function deleteDocument(id: string) {
  await api.delete(`/trust-centre/documents/${id}`);
  await mutate('/trust-centre/documents', undefined, { revalidate: true });
}

// ─── Public hooks (no auth) ────────────────────────────────────────────────────

export function usePublicProfile() {
  return useSWR<TrustCentreProfile>('/trust-centre/profile', publicFetcher);
}

export function usePublicCertifications() {
  return useSWR<TrustCentreCertification[]>('/trust-centre/certifications', publicFetcher);
}

export function usePublicDocuments(visibility?: string) {
  const query = visibility ? `?visibility=${visibility}` : '';
  return useSWR<TrustCentreDocument[]>(`/trust-centre/documents${query}`, publicFetcher);
}

export async function submitAccessRequest(data: {
  requester_name: string;
  requester_email: string;
  requester_company: string;
  requester_job_title: string;
  purpose: string;
}) {
  const res = await api.post('/trust-centre/access-requests', data);
  return res.data;
}
