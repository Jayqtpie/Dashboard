import Link from 'next/link';
import { ReactNode } from 'react';

export function Card({
  title,
  subtitle,
  children,
  right,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`command-band ${className}`}>
      {(title || subtitle || right) && (
        <div className="mb-6 grid gap-4 border-b border-[var(--line)] pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0 max-w-4xl">
            {title ? <h2 className="font-serif-ui text-[2rem] leading-[0.95] text-[var(--foreground)] sm:text-[2.75rem]">{title}</h2> : null}
            {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-[15px]">{subtitle}</p> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description: string;
  right?: ReactNode;
}) {
  return (
    <section className="page-header">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div className="min-w-0 max-w-5xl">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="font-serif-ui mt-4 text-[3.15rem] leading-[0.9] text-[var(--foreground)] sm:text-[4.8rem] lg:text-[6rem]">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">{description}</p>
        </div>
        {right ? <div className="relative z-10 border-l border-[var(--line)] pl-0 lg:pl-6">{right}</div> : null}
      </div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
  accent = 'plum',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: 'plum' | 'peach' | 'sage';
}) {
  const accentMap = {
    plum: 'text-[var(--foreground)]',
    peach: 'text-[var(--gb-amber)]',
    sage: 'text-[var(--gb-green)]',
  };

  return (
    <div className="stat-tile border-l border-[var(--line)] pl-4 sm:pl-5">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">{label}</div>
      <div className={`mt-3 text-[2rem] font-semibold leading-none sm:text-[2.65rem] ${accentMap[accent]}`}>{value}</div>
      {hint ? <div className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">{hint}</div> : null}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'outline';
  disabled?: boolean;
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center border px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-amber)] disabled:cursor-not-allowed disabled:opacity-50';

  const styles: Record<string, string> = {
    primary: 'border-[var(--gb-amber)] bg-[var(--gb-amber)] text-[var(--gb-black)] hover:brightness-105',
    ghost: 'border-transparent bg-transparent text-[var(--foreground)] hover:border-[var(--line)] hover:bg-[var(--interactive-soft)]',
    outline: 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:border-[var(--line-strong)] hover:bg-[var(--interactive-soft)]',
  };

  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="input-surface w-full px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-amber)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      className="input-surface min-h-32 w-full px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-amber)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export function NavLink({
  href,
  label,
  active,
  detail,
  index,
}: {
  href: string;
  label: string;
  active: boolean;
  detail?: string;
  index?: number;
}) {
  return (
    <Link
      href={href}
      className={`group block border-r border-[var(--line)] px-0 py-4 first:border-l md:px-4 ${active ? 'bg-[var(--surface-muted)] text-[var(--foreground)]' : 'text-[var(--muted-strong)] hover:bg-[var(--interactive-soft)] hover:text-[var(--foreground)]'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-amber)]`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">{String(index ?? 0).padStart(2, '0')}</span>
        <span className={`h-px flex-1 ${active ? 'bg-[var(--gb-amber)]' : 'bg-[var(--line)] group-hover:bg-[var(--line-strong)]'}`} />
      </div>
      <div className="mt-3 text-base font-semibold uppercase tracking-[0.08em]">{label}</div>
      {detail ? <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{detail}</div> : null}
    </Link>
  );
}
