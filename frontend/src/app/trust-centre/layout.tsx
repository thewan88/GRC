import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust Centre',
  description: 'Compliance portal — certifications, security posture and documentation.',
};

export default function TrustCentreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public nav */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-4">
          <a href="/trust-centre" className="text-lg font-bold text-slate-900">Trust Centre</a>
          <a
            href="/trust-centre/request-access"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Request Access
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 mt-16">
        This compliance portal is powered by an internal GRC platform.
      </footer>
    </div>
  );
}
