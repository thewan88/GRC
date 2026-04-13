'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Bell } from 'lucide-react';
import api from '@/lib/api';
import type { User } from '@/types';

interface TopBarProps {
  user: User | null;
  pageTitle?: string;
}

export default function TopBar({ user, pageTitle }: TopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      router.push('/login');
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left: breadcrumb / page title */}
      <div className="flex items-center gap-2">
        {pageTitle && (
          <h1 className="text-base font-semibold text-gray-900">{pageTitle}</h1>
        )}
      </div>

      {/* Right: notifications + user menu */}
      <div className="flex items-center gap-3">
        <button
          className="relative rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {user?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-xs text-gray-600">{user?.full_name}</span>
          <button
            onClick={handleLogout}
            className="ml-1 rounded p-0.5 text-gray-400 transition-colors hover:text-red-500"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
