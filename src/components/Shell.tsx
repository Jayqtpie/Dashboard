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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[var(--gb-indigo)] focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto w-full max-w-[1560px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="theme-fade rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">GuidedBarakah Platform</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">Command Center</h1>
                <p className="mt-2 text-sm text-[var(--muted)]">Daily execution, growth analytics, funnel tracking, and operations in one workspace.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--muted-strong)]">
                  UI v2
                </span>
                <Button variant="outline" onClick={toggleTheme}>
                  {theme === 'dark' ? 'Light' : 'Dark'} mode
                </Button>
              </div>
            </div>

            <nav className="theme-fade hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-2 md:block">
              <div className="grid grid-cols-4 gap-2">
                {tabs.map((t) => (
                  <NavLink key={t.href} href={t.href} label={t.label} active={pathname === t.href} />
                ))}
              </div>
            </nav>

            <nav className="grid grid-cols-2 gap-2 md:hidden">
              {tabs.map((t) => (
                <NavLink key={t.href} href={t.href} label={t.label} active={pathname === t.href} />
              ))}
            </nav>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
          <main id="main" className="min-w-0">
            {children}
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-6 space-y-4">
              <section className="theme-fade rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Workspace</div>
                <div className="mt-2 text-lg font-semibold text-[var(--foreground)]">Local-first data</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Your dashboard writes directly to local storage for fast and predictable execution.
                </p>
                <code className="mt-4 block rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--muted-strong)]">
                  data/guidedbarakah.sqlite
                </code>
              </section>

              <section className="theme-fade rounded-3xl border border-[var(--border)] bg-[linear-gradient(145deg,var(--shell-release-from),var(--shell-release-to))] p-5 text-white shadow-[var(--shadow-card)]">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">Release</div>
                <div className="mt-2 text-2xl font-semibold">UI v2</div>
                <p className="mt-2 text-sm text-indigo-100">Hard refresh layout with a productized SaaS visual system.</p>
              </section>
            </div>
          </aside>
        </div>

        <footer className="mt-8 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
          GuidedBarakah Command Center · UI v2 · Local-first SQLite architecture
        </footer>
      </div>
    </div>
  );
}
