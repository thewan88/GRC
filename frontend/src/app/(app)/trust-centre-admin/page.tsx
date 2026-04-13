'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2, Download } from 'lucide-react';
import { cn, formatDate, fileSize } from '@/lib/utils';
import {
  useTrustCentreProfile,
  useTrustCentreCertifications,
  useTrustCentreDocuments,
  updateProfile,
  toggleDocumentPublished,
  deleteDocument,
} from '@/hooks/useTrustCentre';
import type { TrustCentreDocument } from '@/types';

const VISIBILITY_BADGE: Record<TrustCentreDocument['visibility'], string> = {
  public:           'bg-green-100 text-green-700',
  request_required: 'bg-amber-100 text-amber-700',
  nda_required:     'bg-red-100 text-red-700',
};

const VISIBILITY_LABEL: Record<TrustCentreDocument['visibility'], string> = {
  public:           'Public',
  request_required: 'Access Required',
  nda_required:     'NDA Required',
};

export default function TrustCentreAdminPage() {
  const { data: profileData } = useTrustCentreProfile();
  const { data: certsData }   = useTrustCentreCertifications();
  const { data: docsData }    = useTrustCentreDocuments();

  const profile = profileData?.data;
  const certs   = certsData?.data ?? [];
  const docs    = docsData?.data ?? [];

  const [savingProfile, setSavingProfile]   = useState(false);
  const [tagline, setTagline]               = useState(profile?.tagline ?? '');
  const [contactEmail, setContactEmail]     = useState(profile?.contact_email ?? '');
  const [fcaRef, setFcaRef]                 = useState(profile?.fca_reference ?? '');
  const [icoRef, setIcoRef]                 = useState(profile?.ico_reference ?? '');
  const [isoCert, setIsoCert]               = useState(profile?.iso_cert_number ?? '');

  async function handleSaveProfile() {
    setSavingProfile(true);
    await updateProfile({ tagline, contact_email: contactEmail, fca_reference: fcaRef, ico_reference: icoRef, iso_cert_number: isoCert });
    setSavingProfile(false);
  }

  async function handleToggleDoc(doc: TrustCentreDocument) {
    await toggleDocumentPublished(doc.id, !doc.is_published);
  }

  async function handleDeleteDoc(doc: TrustCentreDocument) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    await deleteDocument(doc.id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Trust Centre Admin</h1>
        <p className="text-sm text-gray-500">Manage your public compliance portal, certifications and documents.</p>
      </div>

      {/* Profile section */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Company Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Regulated, Transparent, Trusted"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="compliance@company.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">FCA Reference</label>
            <input
              type="text"
              value={fcaRef}
              onChange={(e) => setFcaRef(e.target.value)}
              placeholder="e.g. 123456"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">ICO Registration</label>
            <input
              type="text"
              value={icoRef}
              onChange={(e) => setIcoRef(e.target.value)}
              placeholder="e.g. ZA123456"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">ISO 27001 Certificate No.</label>
            <input
              type="text"
              value={isoCert}
              onChange={(e) => setIsoCert(e.target.value)}
              placeholder="e.g. IS 123456"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Certifications ({certs.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {certs.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No certifications added.</p>
          ) : (
            certs.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.issuer} · {cert.certificate_number}</p>
                  <p className="text-xs text-gray-400">Expires: {formatDate(cert.expiry_date)}</p>
                </div>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  cert.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
                )}>
                  {cert.is_published ? 'Published' : 'Hidden'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Documents ({docs.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['Title', 'Category', 'Version', 'Visibility', 'Size', 'Updated', 'Published', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400">No documents uploaded.</td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      {doc.description && <p className="text-xs text-gray-400">{doc.description}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{doc.category}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{doc.version ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', VISIBILITY_BADGE[doc.visibility])}>
                        {VISIBILITY_LABEL[doc.visibility]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{fileSize(doc.file_size)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{formatDate(doc.updated_at)}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        doc.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
                      )}>
                        {doc.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleDoc(doc)}
                          title={doc.is_published ? 'Unpublish' : 'Publish'}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          {doc.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/trust-centre/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteDoc(doc)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
