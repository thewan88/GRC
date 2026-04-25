'use client';

import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Plus, X } from 'lucide-react';
import { createUser } from '@/hooks/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { User } from '@/types';

const ROLES: { value: User['role']; label: string }[] = [
  { value: 'viewer',       label: 'Viewer' },
  { value: 'asset_owner',  label: 'Asset Owner' },
  { value: 'risk_manager', label: 'Risk Manager' },
  { value: 'admin',        label: 'Admin' },
];

interface Props {
  defaultRole?: User['role'];
  onCreated?: (user: User) => void;
}

export default function CreateUserPanel({ defaultRole = 'viewer', onCreated }: Props) {
  const { user: currentUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (currentUser?.role !== 'admin') {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const user = await createUser({
        full_name: fullName.trim(),
        email: email.trim(),
        role,
      });

      setFullName('');
      setEmail('');
      setRole(defaultRole);
      setIsOpen(false);
      onCreated?.(user);
    } catch (err) {
      if (isAxiosError(err)) {
        const errors = err.response?.data?.errors;
        const firstError = errors && typeof errors === 'object'
          ? Object.values(errors).flat().find((message): message is string => typeof message === 'string')
          : null;

        setError(firstError ?? 'Could not create user. Please try again.');
      } else {
        setError('Could not create user. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        <Plus className="h-3 w-3" />
        Create user
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-md border border-blue-100 bg-blue-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-blue-900">Create invited user</p>
        <button type="button" onClick={() => setIsOpen(false)} className="text-blue-500 hover:text-blue-700">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full name"
        required
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as User['role'])}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {ROLES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Creating...' : 'Create user'}
      </button>
    </form>
  );
}
