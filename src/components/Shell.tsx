'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button, NavLink } from '@/components/ui';

type ThemeMode = 'light' | 'dark';

const tabs = [
  { href: '/', label: 'Overview', detail: 'Founder priorities and weekly direction' },
  { href: '/today', label: 'Today', detail: 'Ship, engage, finish the essentials' },
  { href: '/growth', label: 'Signal', detail: 'Numbers, hooks, and review decisions' },
  { href: '/funnel', label: 'Offers', detail: 'Trigger, click, purchase conversion' },
  { href: '/ops-health', label: 'Ops', detail: 'Reliability, failures, and cleanup' },
];

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document === 'undefined') return 'dark';
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-[var(--foreground)] focus:bg-[var(--background)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--foreground)]"
      >
        Skip to content
      </a>

      <div className="command-shell">
        <header className="border-b border-[var(--line)]">
          <div className="mx-auto max-w-[1360px] px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <div className="eyebrow">GuidedBarakah · founder command center</div>
                <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
                  <div>
                    <Link href="/" className="block text-[1.85rem] font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--foreground)] sm:text-[2.35rem] lg:text-[2.9rem]">
                      Founder operating surface
                    </Link>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
                      Flat architecture. Hard priorities. Live signal. One place to decide what matters and move.
                    </p>
                  </div>
                  <div className="grid gap-3 border-t border-[var(--line)] pt-3 text-sm text-[var(--muted)] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <div className="flex items-center justify-between gap-4 border-b border-[var(--line-soft)] pb-2">
                      <span className="ui-label">Operating mode</span>
                      <span className="text-[var(--muted-strong)]">{theme === 'dark' ? 'After hours' : 'Daylight review'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-[var(--line-soft)] pb-2">
                      <span className="ui-label">Principle</span>
                      <span className="text-right text-[var(--muted-strong)]">Barakah over noise</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="ui-label">Theme</span>
                      <Button variant="outline" onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
                        {theme === 'dark' ? 'Light' : 'Dark'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-[var(--line)] bg-[var(--surface-muted)]">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <nav className="grid gap-0 md:grid-cols-5" aria-label="Primary">
              {tabs.map((tab, index) => (
                <NavLink key={tab.href} href={tab.href} label={tab.label} detail={tab.detail} active={pathname === tab.href} index={index + 1} />
              ))}
            </nav>
          </div>
        </div>

        <main id="main" className="page-shell min-w-0">
          <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            {children}
            <footer className="mt-12 border-t border-[var(--line)] py-4 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              GuidedBarakah workspace · founder cadence · deliberate systems
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
