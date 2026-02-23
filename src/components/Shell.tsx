'use client';

import { usePathname } from 'next/navigation';
import { NavLink } from '@/components/ui';
import { ReactNode } from 'react';

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const tabs = [
    { href: '/today', label: 'Today' },
    { href: '/growth', label: 'Growth' },
    { href: '/funnel', label: 'Funnel' },
    { href: '/ops-health', label: 'Ops Health' },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="text-xs tracking-[0.25em] text-[var(--muted)]">GUIDEDBARAKAH</div>
            <div className="text-lg font-semibold leading-6">
              Command Center <span className="text-[var(--gb-gold)]">MVP</span>
            </div>
          </div>
          <nav className="flex gap-1 rounded-2xl bg-white/5 p-1">
            {tabs.map((t) => (
              <NavLink key={t.href} href={t.href} label={t.label} active={pathname === t.href} />
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 pt-4 text-xs text-[var(--muted)]">
        Local-first. SQLite stored in <code className="rounded bg-white/5 px-1 py-0.5">data/guidedbarakah.sqlite</code>
      </footer>
    </div>
  );
}
