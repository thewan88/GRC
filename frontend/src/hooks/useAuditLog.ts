import useSWR from 'swr';
import api from '@/lib/api';
import type { AuditLogEntry, ApiResponse } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function useAuditLog(params?: Record<string, string | number | undefined>) {
  const query = params
    ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
    : '';
  return useSWR<ApiResponse<AuditLogEntry[]>>(`/audit-log${query}`, fetcher);
}
