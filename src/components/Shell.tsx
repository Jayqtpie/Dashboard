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
    <div className="relative isolate min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-2xl focus:bg-black/80 focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--gb-cream)] focus:ring-2 focus:ring-[var(--gb-gold)]/60"
      >
        Skip to content
      </a>

      <InteractiveBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <div className="glass card-edge flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-3xl p-5 shadow-[var(--shadow-card)] lg:[@media(max-height:800px)]:p-4">
                <div className="text-[11px] tracking-[0.38em] text-[var(--muted)]">GUIDEDBARAKAH</div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <div className="min-w-0 text-xl font-semibold leading-7 tracking-tight">
                    Command Center
                  </div>
                  <span className="shrink-0 rounded-full border border-[var(--border)] bg-white/5 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--gb-gold)]">
                    MVP
                  </span>
                </div>

                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 lg:[@media(max-height:800px)]:mt-3">
                  <div className="space-y-2">
                    {tabs.map((t) => (
                      <NavLink key={t.href} href={t.href} label={t.label} active={pathname === t.href} />
                    ))}
                  </div>
                </div>

                <div className="mt-4 shrink-0 rounded-2xl border border-[var(--border)] bg-black/25 p-4 lg:[@media(max-height:800px)]:mt-3 lg:[@media(max-height:800px)]:p-3">
                  <div className="text-xs text-[var(--muted)]">Local-first</div>
                  <div className="mt-1 text-sm leading-6 text-[var(--gb-cream)]">
                    Data lives in{' '}
                    <code className="break-words rounded-lg border border-[var(--border)] bg-white/5 px-1.5 py-0.5 text-xs">
                      data/guidedbarakah.sqlite
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-10 -mx-4 mb-6 border-b border-[var(--border)] bg-black/40 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-black/25 sm:-mx-6 sm:px-6 lg:hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] tracking-[0.34em] text-[var(--muted)]">GUIDEDBARAKAH</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-lg font-semibold leading-6 tracking-tight">Command Center</div>
                    <span className="rounded-full border border-[var(--border)] bg-white/5 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--gb-gold)]">
                      MVP
                    </span>
                  </div>
                </div>
              </div>
              <nav className="mt-4 grid grid-cols-2 gap-2">
                {tabs.map((t) => (
                  <NavLink key={t.href} href={t.href} label={t.label} active={pathname === t.href} />
                ))}
              </nav>
            </header>

            <main id="main" className="pb-10 pt-2 lg:pt-6">
              {children}
            </main>

            <footer className="pb-10 text-xs text-[var(--muted)] lg:hidden">
              Local-first. SQLite stored in{' '}
              <code className="rounded-lg border border-[var(--border)] bg-white/5 px-1.5 py-0.5">
                data/guidedbarakah.sqlite
              </code>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
