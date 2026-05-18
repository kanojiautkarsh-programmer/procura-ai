'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Receipt, CreditCard, Building2, CheckSquare,
  Bell, BarChart3, Sparkles, Settings, Shield, ChevronLeft,
  ChevronRight, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { cn } from '@procura/ui';

const primaryNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/vendors', label: 'Vendors', icon: Building2 },
];

const workflowNav = [
  { href: '/approvals', label: 'Approvals', icon: CheckSquare },
  { href: '/renewals', label: 'Renewals', icon: Bell },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/assistant', label: 'Assistant', icon: Sparkles },
];

const bottomNav = [
  { href: '/audit', label: 'Audit Log', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive(href)
          ? 'nav-active'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        collapsed && 'justify-center px-2',
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className={cn('h-4 w-4 shrink-0', isActive(href) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')} />
      <span className={cn('transition-opacity duration-150', collapsed && 'hidden')}>{label}</span>
    </Link>
  );

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-200 bg-white transition-all duration-200',
        collapsed ? 'w-[60px]' : 'w-[240px]',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-slate-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold text-white">
            P
          </div>
          <span className={cn('text-base tracking-tight text-slate-900 transition-opacity', collapsed && 'hidden')}>
            Procura <span className="font-normal text-slate-400">AI</span>
          </span>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600', collapsed && 'ml-0')}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
        <div className={cn('mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400', collapsed && 'sr-only')}>
          Main
        </div>
        <nav className="space-y-0.5">
          {primaryNav.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>

        <div className={cn('mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400', collapsed && 'sr-only')}>
          Workflow
        </div>
        <nav className="space-y-0.5">
          {workflowNav.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-slate-200 px-2 py-2">
        <nav className="space-y-0.5">
          {bottomNav.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>
      </div>
    </aside>
  );
}
