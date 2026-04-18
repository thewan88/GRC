'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import api, { initCsrf } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const IS_DEV   = process.env.NODE_ENV === 'development';

export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const error  = params.get('error');
  const redirect = params.get('redirect') ?? '/dashboard';
  const [loading, setLoading] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = `${API_BASE}/api/v1/auth/redirect`;
  };

  const handleDevLogin = async () => {
    setDevError(null);
    setLoading(true);
    try {
      await initCsrf();
      await api.post('/auth/dev-login');
      router.push(redirect);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setDevError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">GRC Platform</h1>
          <p className="mt-1 text-sm text-slate-400">
            Governance, Risk &amp; Compliance
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Sign in to your account</h2>
          <p className="mb-6 text-sm text-gray-500">
            Use your Microsoft organisational account to continue.
          </p>

          {error === 'inactive' && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              Your account has been deactivated. Please contact your administrator.
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {/* Microsoft logo SVG */}
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
            {loading ? 'Redirecting...' : 'Sign in with Microsoft'}
          </button>

          {IS_DEV && (
            <>
              <button
                onClick={handleDevLogin}
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Dev Login (admin) — local only'}
              </button>
              {devError && (
                <p className="mt-2 text-xs text-red-600 text-center">{devError}</p>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          FCA Regulated · ISO 27001:2022 · ICO GDPR Registered
        </p>
      </div>
    </div>
  );
}
