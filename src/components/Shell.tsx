'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button, NavLink } from '@/components/ui';

type ThemeMode = 'light' | 'dark';

const tabs = [
  { href: '/', label: 'Home', detail: 'Your workspace overview' },
  { href: '/today', label: 'Today', detail: 'Daily rhythm and focus' },
  { href: '/growth', label: 'Growth', detail: 'Signals, copy, and notes' },
  { href: '/funnel', label: 'Offers', detail: 'Keyword and conversion flow' },
  { href: '/ops-health', label: 'Care', detail: 'Operations and reliability' },
];

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document === 'undefined') return 'light';
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark' || current === 'light') return current;

    try {
      const saved = localStorage.getItem('gb-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('gb-theme', theme);
    } catch {}
  }, [theme]);

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--gb-teal)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
            <div className="panel flex h-full flex-col rounded-[36px] p-4 sm:p-5">
              <div className="ornament-divider pb-5">
                <div className="eyebrow">GuidedBarakah</div>
                <Link href="/" className="mt-3 block font-serif-ui text-3xl leading-tight text-[var(--foreground)]">
                  Creator workspace
                </Link>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  A quieter home for Muslim creators and entrepreneurs building with intention.
                </p>
              </div>

              <nav className="mt-5 space-y-2">
                {tabs.map((tab) => (
                  <NavLink
                    key={tab.href}
                    href={tab.href}
                    label={tab.label}
                    detail={tab.detail}
                    active={pathname === tab.href}
                  />
                ))}
              </nav>

              <div className="mt-5 rounded-[28px] border border-[var(--border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--gb-gold)_12%,var(--surface)_88%),color-mix(in_srgb,var(--gb-teal)_12%,var(--surface-soft)_88%))] p-4">
                <div className="eyebrow">Guiding principle</div>
                <div className="mt-2 font-serif-ui text-2xl text-[var(--foreground)]">Barakah over hustle</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Choose clarity, protect your energy, and let the workspace feel supportive rather than loud.
                </p>
              </div>

              <div className="mt-auto space-y-4 pt-5">
                <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Theme</div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-sm text-[var(--muted-strong)]">{theme === 'dark' ? 'Evening mode' : 'Day mode'}</div>
                    <Button variant="outline" onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
                      {theme === 'dark' ? 'Light' : 'Dark'}
                    </Button>
                  </div>
                </div>

                <div className="rounded-[28px] bg-[var(--shell-release-from)] px-4 py-5 text-[var(--gb-cream)]">
                  <div className="text-xs uppercase tracking-[0.18em] text-[rgba(250,240,230,0.72)]">Built around</div>
                  <div className="mt-2 font-serif-ui text-2xl">Steady work</div>
                  <p className="mt-2 text-sm leading-6 text-[rgba(250,240,230,0.82)]">
                    Today, growth, offers, and business care—organized as one coherent practice.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main id="main" className="min-w-0 space-y-6">
            <header className="panel rounded-[36px] px-5 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="eyebrow">Workspace</div>
                  <div className="mt-2 font-serif-ui text-[2rem] leading-tight text-[var(--foreground)] sm:text-[2.4rem]">
                    Build with calm confidence.
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                    A more spacious, editorial home for your daily rhythm, audience learning, offer health, and operational care.
                  </p>
                </div>
                <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--muted-strong)]">
                  Local-first workspace
                </div>
              </div>
            </header>

            {children}

            <footer className="px-2 pb-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              GuidedBarakah workspace · grounded systems · premium calm
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
