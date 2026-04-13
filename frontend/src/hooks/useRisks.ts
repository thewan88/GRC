import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import type { Risk, ApiResponse } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function useRisks(params?: Record<string, string | number | undefined>) {
  const query = params
    ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
    : '';
  return useSWR<ApiResponse<Risk[]>>(`/risks${query}`, fetcher);
}

export function useRisk(id: string | undefined) {
  return useSWR<ApiResponse<Risk>>(id ? `/risks/${id}` : null, fetcher);
}

export async function createRisk(data: Record<string, unknown>) {
  const res = await api.post('/risks', data);
  await mutate((key: string) => typeof key === 'string' && key.startsWith('/risks'), undefined, { revalidate: true });
  return res.data.data as Risk;
}

export async function updateRisk(id: string, data: Record<string, unknown>) {
  const res = await api.put(`/risks/${id}`, data);
  await mutate(`/risks/${id}`, undefined, { revalidate: true });
  await mutate((key: string) => typeof key === 'string' && key.startsWith('/risks') && !key.includes('/'), undefined, { revalidate: true });
  return res.data.data as Risk;
}
