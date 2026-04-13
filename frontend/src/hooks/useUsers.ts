import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import type { User, ApiResponse } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function useUsers() {
  return useSWR<ApiResponse<User[]>>('/users', fetcher);
}

export function useUser(id: string | undefined) {
  return useSWR<ApiResponse<User>>(id ? `/users/${id}` : null, fetcher);
}

export async function updateUserRole(id: string, role: User['role']) {
  const res = await api.patch(`/users/${id}/role`, { role });
  await mutate('/users', undefined, { revalidate: true });
  return res.data.data as User;
}

export async function deactivateUser(id: string) {
  const res = await api.delete(`/users/${id}`);
  await mutate('/users', undefined, { revalidate: true });
  return res.data.data as User;
}
