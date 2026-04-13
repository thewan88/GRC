'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitAccessRequest } from '@/hooks/useTrustCentre';

export default function RequestAccessPage() {
  const [form, setForm] = useState({
    requester_name: '',
    requester_email: '',
    requester_company: '',
    requester_job_title: '',
    purpose: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.requester_name || !form.requester_email || !form.requester_company || !form.purpose) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitAccessRequest(form);
      setSubmitted(true);
    } catch {
      setError('Failed to submit request. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-green-200 bg-green-50 p-10 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h2 className="text-xl font-bold text-green-900">Request Submitted</h2>
        <p className="mt-2 text-sm text-green-700">
          Your access request has been received. Our compliance team will review it and email you within 2 business days.
        </p>
        <a href="/trust-centre" className="mt-6 inline-block text-sm text-blue-600 hover:underline">← Back to Trust Centre</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Request Document Access</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete this form to request access to restricted compliance documentation. Requests are reviewed by our compliance team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.requester_name}
              onChange={(e) => update('requester_name', e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Job Title
            </label>
            <input
              type="text"
              value={form.requester_job_title}
              onChange={(e) => update('requester_job_title', e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Work Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.requester_email}
            onChange={(e) => update('requester_email', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Organisation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.requester_company}
            onChange={(e) => update('requester_company', e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Purpose of Request <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.purpose}
            onChange={(e) => update('purpose', e.target.value)}
            rows={3}
            placeholder="e.g. Due diligence for fund subscription, vendor security assessment..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>

        <p className="text-center text-xs text-slate-400">
          Your information will only be used to process this access request.
        </p>
      </form>
    </div>
  );
}
