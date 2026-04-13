'use client';

import { CheckCircle2, Shield, Lock, FileText, Download } from 'lucide-react';
import { cn, formatDate, fileSize } from '@/lib/utils';
import { usePublicProfile, usePublicCertifications, usePublicDocuments } from '@/hooks/useTrustCentre';

export default function TrustCentrePage() {
  const { data: profile } = usePublicProfile();
  const { data: certs }   = usePublicCertifications();
  const { data: docs }    = usePublicDocuments('public');

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{profile?.company_name ?? 'Trust Centre'}</h1>
        {profile?.tagline && (
          <p className="mt-2 text-lg text-slate-500">{profile.tagline}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          {profile?.fca_reference && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              FCA Ref: {profile.fca_reference}
            </span>
          )}
          {profile?.ico_reference && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              ICO: {profile.ico_reference}
            </span>
          )}
          {profile?.iso_cert_number && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              ISO 27001: {profile.iso_cert_number}
            </span>
          )}
        </div>
      </div>

      {/* Certifications */}
      {certs && certs.filter((c) => c.is_published).length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Certifications &amp; Accreditations</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certs.filter((c) => c.is_published).map((cert) => (
              <div key={cert.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <p className="font-bold text-slate-900">{cert.name}</p>
                {cert.issuer && <p className="text-sm text-slate-500">{cert.issuer}</p>}
                {cert.certificate_number && (
                  <p className="mt-1 font-mono text-xs text-slate-400">{cert.certificate_number}</p>
                )}
                {cert.expiry_date && (
                  <p className="mt-2 text-xs text-slate-400">Valid until {formatDate(cert.expiry_date)}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Public documents */}
      {docs && docs.filter((d) => d.is_published).length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Public Documents</h2>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {docs.filter((d) => d.is_published).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{doc.title}</p>
                    {doc.description && <p className="text-sm text-slate-500">{doc.description}</p>}
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span>{doc.category}</span>
                      {doc.version && <span>v{doc.version}</span>}
                      {doc.file_size && <span>{fileSize(doc.file_size)}</span>}
                    </div>
                  </div>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/trust-centre/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-4 flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Access request prompt */}
      <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
        <Lock className="mx-auto mb-3 h-8 w-8 text-blue-600" />
        <h2 className="text-lg font-bold text-blue-900">Additional Documents Available</h2>
        <p className="mt-1 text-sm text-blue-700">
          Further documentation (security reports, DPAs, pen test summaries) is available to approved parties.
        </p>
        <a
          href="/trust-centre/request-access"
          className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Request Access
        </a>
      </section>

      {/* Contact */}
      {profile?.contact_email && (
        <p className="text-center text-sm text-slate-400">
          Questions? Contact us at{' '}
          <a href={`mailto:${profile.contact_email}`} className="text-blue-600 hover:underline">
            {profile.contact_email}
          </a>
        </p>
      )}
    </div>
  );
}
