import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import type { Control, ApiResponse } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function useControls(params?: Record<string, string | undefined>) {
  const query = params
    ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][])).toString()
    : '';
  return useSWR<ApiResponse<Control[]>>(`/controls${query}`, fetcher);
}

export function useControl(id: string | undefined) {
  return useSWR<ApiResponse<Control>>(id ? `/controls/${id}` : null, fetcher);
}

export async function updateControl(id: string, data: Record<string, unknown>) {
  const res = await api.put(`/controls/${id}`, data);
  await mutate(`/controls/${id}`, undefined, { revalidate: true });
  await mutate((key: string) => typeof key === 'string' && key.startsWith('/controls') && !key.includes('/'), undefined, { revalidate: true });
  return res.data.data as Control;
}
