'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Bell, Search, Command, Sparkles } from 'lucide-react';
import { Button } from '@procura/ui';
import { cn } from '@procura/ui';

const quickActions = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'Subscriptions', href: '/subscriptions' },
  { label: 'Approvals', href: '/approvals' },
  { label: 'Renewals', href: '/renewals' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'AI Assistant', href: '/assistant' },
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' },
  { label: 'Audit Log', href: '/audit' },
];

export function Header() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: notifData } = useQuery({
    queryKey: ['unread-count', orgId],
    queryFn: () => api.get<any>('/notifications/unread-count', { organizationId: orgId || '' }),
    enabled: !!orgId,
    refetchInterval: 30000,
  });

  const unreadCount = (notifData as any)?.count ?? (notifData as any)?.unreadCount ?? 0;

  const filtered = quickActions.filter(
    (a) => a.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    setSelectedIdx(0);
  }, [searchOpen]);

  const navigate = (href: string) => {
    setSearchOpen(false);
    setQuery('');
    window.location.href = href;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-500 w-[280px]"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search anything...</span>
          <kbd className="ml-auto flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
        <div className="ml-1">
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: 'h-7 w-7 rounded-full ring-2 ring-slate-100',
                userButtonPopoverCard: 'shadow-xl rounded-xl border border-slate-200',
              },
            }}
          />
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages and actions..."
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
                  if (e.key === 'ArrowUp') setSelectedIdx((i) => Math.max(i - 1, 0));
                  if (e.key === 'Enter' && filtered[selectedIdx]) navigate(filtered[selectedIdx].href);
                }}
              />
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">ESC</kbd>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-slate-400">No results found</p>
              ) : (
                filtered.map((item, idx) => (
                  <button
                    key={item.href}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      idx === selectedIdx ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50',
                    )}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                    {item.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
