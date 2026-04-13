import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import type { Asset, ApiResponse } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function useAssets(params?: Record<string, string | number | undefined>) {
  const query = params
    ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
    : '';
  return useSWR<ApiResponse<Asset[]>>(`/assets${query}`, fetcher);
}

export function useAsset(id: string | undefined) {
  return useSWR<ApiResponse<Asset>>(id ? `/assets/${id}` : null, fetcher);
}

export async function createAsset(data: Record<string, unknown>) {
  const res = await api.post('/assets', data);
  await mutate((key: string) => typeof key === 'string' && key.startsWith('/assets'), undefined, { revalidate: true });
  return res.data.data as Asset;
}

export async function updateAsset(id: string, data: Record<string, unknown>) {
  const res = await api.put(`/assets/${id}`, data);
  await mutate(`/assets/${id}`, undefined, { revalidate: true });
  await mutate((key: string) => typeof key === 'string' && key.startsWith('/assets') && !key.includes('/'), undefined, { revalidate: true });
  return res.data.data as Asset;
}
