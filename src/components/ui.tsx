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
    <section
      className={`card-edge theme-fade rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-6 ${className}`}
    >
      {(title || subtitle || right) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 max-w-3xl">
            {title && <h2 className="serif-display text-[1.45rem] leading-tight text-[var(--foreground)]">{title}</h2>}
            {subtitle && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
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
    <section className="motif-panel theme-fade rounded-[32px] border border-[var(--border)] bg-[linear-gradient(135deg,var(--header-grad-from)_0%,var(--header-grad-to)_100%)] p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10 text-[var(--gb-teal)]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0 max-w-3xl text-[var(--foreground)]">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="serif-display mt-3 text-4xl leading-[1.02] text-[var(--foreground)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">{description}</p>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </section>
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
    'inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold tracking-[0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/55 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px';

  const styles: Record<string, string> = {
    primary:
      'bg-[linear-gradient(135deg,var(--gb-teal)_0%,var(--gb-teal-soft)_100%)] text-[var(--gb-cream)] shadow-[0_10px_24px_rgba(26,83,92,0.24)] hover:brightness-105',
    ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--interactive-soft)]',
    outline:
      'border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,white_12%)] text-[var(--foreground)] hover:bg-[var(--surface-soft)]',
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
      className="w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,white_8%)] px-3.5 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/50"
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
      className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,white_8%)] px-3.5 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/50"
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
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/55 ${
        active
          ? 'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--gb-gold)_18%,var(--surface-soft)_82%)_0%,color-mix(in_srgb,var(--gb-teal)_12%,var(--surface-soft)_88%)_100%)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(201,168,76,0.25)]'
          : 'text-[var(--muted-strong)] hover:bg-[var(--surface)]'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full transition ${
          active ? 'bg-[var(--gb-gold)] shadow-[0_0_0_4px_rgba(201,168,76,0.18)]' : 'bg-[var(--border)] group-hover:bg-[var(--gb-teal-soft)]'
        }`}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}
