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
    <section className={`panel panel-hover rounded-[32px] p-5 sm:p-6 ${className}`}>
      {(title || subtitle || right) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            {title ? <h2 className="font-serif-ui text-[1.5rem] leading-tight text-[var(--foreground)]">{title}</h2> : null}
            {subtitle ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
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
    <section className="hero-panel rounded-[36px] p-6 sm:p-8 lg:p-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0 max-w-3xl">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="font-serif-ui mt-3 text-4xl leading-[1.02] text-[var(--foreground)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">{description}</p>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
  accent = 'teal',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: 'teal' | 'gold' | 'cream';
}) {
  return (
    <div className={`metric-tile metric-${accent} rounded-[28px] p-4 sm:p-5`}>
      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">{label}</div>
      <div className="mt-3 text-3xl font-semibold leading-none text-[var(--foreground)] sm:text-4xl">{value}</div>
      {hint ? <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{hint}</div> : null}
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
    'inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold tracking-[0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px';

  const styles: Record<string, string> = {
    primary:
      'bg-[linear-gradient(135deg,var(--gb-teal)_0%,color-mix(in_srgb,var(--gb-teal)_82%,white_18%)_100%)] text-[var(--gb-cream)] shadow-[0_14px_32px_rgba(26,83,92,0.22)] hover:brightness-105',
    ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--interactive-soft)]',
    outline:
      'border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,white_8%)] text-[var(--foreground)] hover:bg-[var(--surface-soft)]',
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
      className="w-full rounded-[20px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,white_6%)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/50"
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
      className="min-h-28 w-full rounded-[20px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,white_6%)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/50"
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
}: {
  href: string;
  label: string;
  active: boolean;
  detail?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between gap-3 rounded-[24px] px-4 py-3.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
        active
          ? 'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--gb-gold)_12%,white_88%),color-mix(in_srgb,var(--gb-teal)_10%,white_90%))] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(201,168,76,0.24)]'
          : 'text-[var(--muted-strong)] hover:bg-[var(--interactive-soft)]'
      }`}
    >
      <div className="min-w-0">
        <div className="font-semibold">{label}</div>
        {detail ? <div className="mt-0.5 truncate text-xs text-[var(--muted)]">{detail}</div> : null}
      </div>
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full transition ${
          active ? 'bg-[var(--gb-gold)] shadow-[0_0_0_5px_rgba(201,168,76,0.14)]' : 'bg-[var(--border)] group-hover:bg-[var(--gb-teal-soft)]'
        }`}
      />
    </Link>
  );
}
