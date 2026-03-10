'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button, NavLink } from '@/components/ui';

type ThemeMode = 'light' | 'dark';

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

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  const tabs = [
    { href: '/today', label: 'Today' },
    { href: '/growth', label: 'Growth' },
    { href: '/funnel', label: 'Funnel' },
    { href: '/ops-health', label: 'Operations' },
  ];

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[var(--gb-teal)] focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto w-full max-w-[1500px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <header className="theme-fade rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_92%,white_8%),var(--surface))] p-4 shadow-[var(--shadow-card)] sm:p-6 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="eyebrow">GuidedBarakah workspace</p>
                  <h1 className="serif-display mt-3 text-3xl leading-tight text-[var(--foreground)] sm:text-4xl">
                    Build with clarity. Grow with barakah.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                    A calmer operating space for today&apos;s work, growth review, funnel visibility, and business health — designed to support steady progress over hustle.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[var(--muted-strong)]">
                    Premium refresh
                  </span>
                  <Button variant="outline" onClick={toggleTheme}>
                    {theme === 'dark' ? 'Light' : 'Dark'} mode
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
                <nav className="theme-fade rounded-[26px] border border-[var(--border)] bg-[var(--surface-soft)] p-2.5">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {tabs.map((t) => (
                      <NavLink key={t.href} href={t.href} label={t.label} active={pathname === t.href} />
                    ))}
                  </div>
                </nav>

                <div className="motif-panel rounded-[26px] border border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--gb-gold)_10%,var(--surface)_90%),color-mix(in_srgb,var(--gb-teal)_10%,var(--surface-soft)_90%))] p-4 text-[var(--foreground)]">
                  <div className="eyebrow">Guiding principle</div>
                  <div className="serif-display mt-2 text-2xl text-[var(--foreground)]">Barakah over hustle</div>
                  <p className="mt-2 pr-12 text-sm leading-6 text-[var(--muted)]">
                    Tight alignment, gentle hierarchy, and practical data capture without the command-center noise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <main id="main" className="min-w-0">
            {children}
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-6 space-y-4">
              <section className="theme-fade rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
                <div className="eyebrow">Workspace</div>
                <div className="serif-display mt-2 text-2xl text-[var(--foreground)]">Local-first foundation</div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Your data stays close: fast edits, predictable writes, and a grounded workflow built on local persistence.
                </p>
                <code className="mt-4 block rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--muted-strong)]">
                  data/guidedbarakah.sqlite
                </code>
              </section>

              <section className="theme-fade rounded-[28px] border border-[var(--border)] bg-[linear-gradient(145deg,var(--shell-release-from),var(--shell-release-to))] p-5 text-[var(--gb-cream)] shadow-[var(--shadow-card)]">
                <div className="eyebrow !text-[rgba(250,240,230,0.72)]">Design note</div>
                <div className="serif-display mt-2 text-2xl">Fresh premium pass</div>
                <p className="mt-3 text-sm leading-6 text-[rgba(250,240,230,0.84)]">
                  Softer surfaces, stronger brand color, and a more editorial rhythm across the dashboard.
                </p>
              </section>
            </div>
          </aside>
        </div>

        <footer className="mt-8 border-t border-[var(--border)] pt-4 text-xs tracking-[0.12em] text-[var(--muted)] uppercase">
          GuidedBarakah dashboard · local-first SQLite · calmer execution layer
        </footer>
      </div>
    </div>
  );
}
