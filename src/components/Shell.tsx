'use client';

import { usePathname } from 'next/navigation';
import { NavLink } from '@/components/ui';
import InteractiveBackground from '@/components/InteractiveBackground';
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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-black/80 focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--gb-cream)] focus:ring-2 focus:ring-[var(--gb-gold)]/60"
      >
        Skip to content
      </a>

      <InteractiveBackground />

      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <div className="text-[11px] tracking-[0.32em] text-[var(--muted)]">GUIDEDBARAKAH</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-lg font-semibold leading-6 tracking-tight">
                Command Center
              </div>
              <span className="rounded-full border border-[var(--border)] bg-white/5 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--gb-gold)]">
                MVP
              </span>
            </div>
          </div>

          <nav className="flex gap-1 rounded-2xl border border-[var(--border)] bg-white/5 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            {tabs.map((t) => (
              <NavLink key={t.href} href={t.href} label={t.label} active={pathname === t.href} />
            ))}
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 py-8">
        {children}
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 pt-4 text-xs text-[var(--muted)]">
        Local-first. SQLite stored in{' '}
        <code className="rounded-lg border border-[var(--border)] bg-white/5 px-1.5 py-0.5">data/guidedbarakah.sqlite</code>
      </footer>
    </div>
  );
}
