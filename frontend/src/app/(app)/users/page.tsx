'use client';

import { useState } from 'react';
import { cn, formatDate } from '@/lib/utils';
import { useUsers, updateUserRole, deactivateUser } from '@/hooks/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { User } from '@/types';

const ROLES: { value: User['role']; label: string; description: string }[] = [
  { value: 'admin',         label: 'Admin',         description: 'Full access including user management' },
  { value: 'risk_manager',  label: 'Risk Manager',  description: 'Create/edit risks and assets, view audit log' },
  { value: 'asset_owner',   label: 'Asset Owner',   description: 'Create/edit own assets' },
  { value: 'viewer',        label: 'Viewer',        description: 'Read-only access to all registers' },
];

const ROLE_BADGE: Record<User['role'], string> = {
  admin:        'bg-purple-100 text-purple-800',
  risk_manager: 'bg-blue-100 text-blue-800',
  asset_owner:  'bg-teal-100 text-teal-800',
  viewer:       'bg-gray-100 text-gray-600',
};

export default function UsersPage() {
  const { user: currentUser }     = useCurrentUser();
  const { data, isLoading, mutate } = useUsers() as ReturnType<typeof useUsers> & { mutate?: () => void };
  const users = data?.data ?? [];
  const [saving, setSaving]       = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">You do not have permission to manage users.</p>
      </div>
    );
  }

  async function handleRoleChange(userId: string, role: User['role']) {
    setSaving(userId);
    try {
      await updateUserRole(userId, role);
    } finally {
      setSaving(null);
    }
  }

  async function handleDeactivate(userId: string) {
    if (!confirm('Deactivate this user? They will no longer be able to log in.')) return;
    setSaving(userId);
    try {
      await deactivateUser(userId);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">Manage roles for users who have logged in via Microsoft Entra ID.</p>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLES.map(({ value, label, description }) => (
          <div key={value} className="rounded-lg border border-gray-200 bg-white p-3">
            <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', ROLE_BADGE[value])}>{label}</span>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['User', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className={cn('hover:bg-gray-50', !user.is_active && 'opacity-50')}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isCurrentUser ? (
                        <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', ROLE_BADGE[user.role])}>
                          {user.role}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          disabled={saving === user.id || !user.is_active}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-40"
                        >
                          {ROLES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                      )}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.last_login)}</td>
                    <td className="px-4 py-3">
                      {!isCurrentUser && user.is_active && (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          disabled={saving === user.id}
                          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
