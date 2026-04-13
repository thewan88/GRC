'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Database,
  ShieldCheck,
  FileText,
  Users,
  Globe,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/wizardStore';
import type { User } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',          href: '/dashboard',          icon: LayoutDashboard },
  { label: 'Risk Register',      href: '/risks',              icon: AlertTriangle },
  { label: 'Asset Register',     href: '/assets',             icon: Database },
  { label: 'Control Register',   href: '/controls',           icon: ShieldCheck },
  { label: 'Audit Log',          href: '/audit-log',          icon: FileText },
  { label: 'Users',              href: '/users',              icon: Users,           adminOnly: true },
  { label: 'Trust Centre Admin', href: '/trust-centre-admin', icon: Globe,           adminOnly: true },
];

interface SidebarProps {
  user: User | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname  = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const canSee = (item: NavItem) => {
    if (!item.adminOnly) return true;
    return user?.role === 'admin';
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 text-slate-100 transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-700 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="ml-3 text-sm font-bold tracking-wide text-white">GRC Platform</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-2">
          {navItems.filter(canSee).map((item) => {
            const Icon    = item.icon;
            const active  = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    sidebarCollapsed && 'justify-center px-2',
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + collapse toggle */}
      <div className="border-t border-slate-700 p-3">
        {!sidebarCollapsed && user && (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {user.full_name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user.full_name}</p>
              <p className="truncate text-xs capitalize text-slate-400">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />
          }
        </button>
      </div>
    </aside>
  );
}
