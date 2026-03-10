'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button, NavLink } from '@/components/ui';

type ThemeMode = 'light' | 'dark';

const tabs = [
  { href: '/', label: 'World', detail: 'Orientation and weekly cadence' },
  { href: '/today', label: 'Today', detail: 'Publish, engage, stay deliberate' },
  { href: '/growth', label: 'Signal', detail: 'Metrics, copy, and decisions' },
  { href: '/funnel', label: 'Offers', detail: 'Interest, clicks, and purchases' },
  { href: '/ops-health', label: 'Care', detail: 'Reliability, issues, and calm' },
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--gb-berry)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto max-w-[1480px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="editorial-frame rounded-[40px] px-5 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-10">
          <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-12">
            <aside className="xl:sticky xl:top-6 xl:self-start">
              <div className="space-y-8">
                <div>
                  <div className="eyebrow">GuidedBarakah</div>
                  <Link href="/" className="mt-4 block font-serif-ui text-[2.6rem] leading-[0.92] text-[var(--foreground)] sm:text-[3.1rem]">
                    Command center,
                    <br />
                    reincarnated.
                  </Link>
                  <p className="mt-4 max-w-xs text-sm leading-7 text-[var(--muted)]">
                    Less dashboard cosplay. More brand world, rhythm, and conviction for Muslim creators building serious work.
                  </p>
                </div>

                <nav className="space-y-4">
                  {tabs.map((tab) => (
                    <NavLink key={tab.href} href={tab.href} label={tab.label} detail={tab.detail} active={pathname === tab.href} />
                  ))}
                </nav>

                <div className="section-block">
                  <div className="eyebrow">Principle</div>
                  <div className="mt-3 font-serif-ui text-3xl leading-tight text-[var(--foreground)]">Barakah over noise.</div>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-[var(--muted)]">
                    Choose stronger ideas, calmer systems, and a product that feels composed enough to trust.
                  </p>
                </div>

                <div className="section-block flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Mode</div>
                    <div className="mt-1 text-sm text-[var(--muted-strong)]">{theme === 'dark' ? 'After hours' : 'Day studio'}</div>
                  </div>
                  <Button variant="outline" onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </Button>
                </div>
              </div>
            </aside>

            <main id="main" className="page-shell min-w-0 space-y-10">
              <header className="page-header pb-8">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div>
                    <div className="eyebrow">Workspace</div>
                    <div className="font-serif-ui mt-4 max-w-4xl text-[3.4rem] leading-[0.94] text-[var(--foreground)] sm:text-[4.6rem]">
                      Build a world,
                      <br />
                      not another admin panel.
                    </div>
                    <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                      Editorial pacing, stronger type, cleaner surfaces, and calmer scroll behavior across today, signal, offers, and care.
                    </p>
                  </div>
                  <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--muted-strong)]">
                    Local-first workspace
                  </div>
                </div>
              </header>

              {children}

              <footer className="border-t border-[var(--line)] pt-5 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                GuidedBarakah workspace · premium calm · deliberate systems
              </footer>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
