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
    { href: '/ops-health', label: 'System Status' },
  ];

  return (
    <div className="relative isolate min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-2xl focus:bg-black/80 focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--gb-gold)]/60"
      >
        Skip to content
      </a>

      <InteractiveBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1640px] px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[270px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <div className="glass card-edge flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-3xl p-5 shadow-[var(--shadow-card)]">
                <div className="text-[11px] font-semibold tracking-[0.32em] text-[var(--muted-strong)]">GUIDEDBARAKAH</div>

                <div className="mt-2">
                  <div className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Command Center</div>
                  <div className="mt-2 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] text-[var(--gb-gold)]">
                    MVP
                  </div>
                </div>

                <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {tabs.map((t) => (
                      <NavLink key={t.href} href={t.href} label={t.label} active={pathname === t.href} />
                    ))}
                  </div>
                </div>

                <div className="mt-5 shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <div className="text-xs text-[var(--muted)]">Local-first architecture</div>
                  <div className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    SQLite path:{' '}
                    <code className="break-words rounded-lg border border-[var(--border)] bg-white/5 px-1.5 py-0.5 text-xs">
                      data/guidedbarakah.sqlite
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <header className="glass-strong sticky top-0 z-20 -mx-4 mb-6 border-b border-[var(--border)] px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 xl:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[var(--muted-strong)]">GUIDEDBARAKAH</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold leading-6 tracking-tight text-[var(--foreground)]">Command Center</div>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--gb-gold)]">
                      MVP
                    </span>
                  </div>
                </div>
              </div>

              <nav className="-mx-1 mt-4 overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2 px-1">
                  {tabs.map((t) => (
                    <div key={t.href} className="min-w-[142px]">
                      <NavLink href={t.href} label={t.label} active={pathname === t.href} />
                    </div>
                  ))}
                </div>
              </nav>
            </header>

            <main id="main" className="pb-10">
              {children}
            </main>

            <footer className="xl:hidden pb-8 text-xs text-[var(--muted)]">
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
