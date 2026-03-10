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
    <section className={`section-block ${className}`}>
      {(title || subtitle || right) && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            {title ? <h2 className="font-serif-ui text-[1.9rem] leading-[1.02] text-[var(--foreground)] sm:text-[2.25rem]">{title}</h2> : null}
            {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-[15px]">{subtitle}</p> : null}
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
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:items-end">
        <div className="min-w-0 max-w-4xl">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="font-serif-ui mt-4 text-[3.2rem] leading-[0.95] text-[var(--foreground)] sm:text-[4.6rem] lg:text-[5.5rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">{description}</p>
        </div>
        {right ? <div className="relative z-10">{right}</div> : null}
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
    plum: 'text-[var(--gb-berry)] [data-theme=dark]:text-[var(--gb-apricot)]',
    peach: 'text-[var(--gb-wine)] [data-theme=dark]:text-[var(--gb-apricot)]',
    sage: 'text-[var(--gb-berry)] [data-theme=dark]:text-[var(--gb-sage)]',
  };

  return (
    <div className="stat-tile border-l border-[var(--line)] pl-4 sm:pl-5">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">{label}</div>
      <div className={`mt-3 text-3xl font-semibold leading-none sm:text-4xl ${accentMap[accent]}`}>{value}</div>
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
    'inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold tracking-[0.02em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-peach)]/70 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px';

  const styles: Record<string, string> = {
    primary:
      'bg-[linear-gradient(135deg,var(--gb-berry)_0%,color-mix(in_srgb,var(--gb-plum)_72%,black_28%)_100%)] text-[var(--gb-cream)] shadow-[0_18px_40px_rgba(58,29,70,0.24)] hover:brightness-105',
    ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--interactive-soft)]',
    outline:
      'border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-strong)_90%,white_10%)] text-[var(--foreground)] hover:bg-[var(--surface-soft)]',
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
      className="input-surface w-full rounded-[20px] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-peach)]/60"
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
      className="input-surface min-h-32 w-full rounded-[24px] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-peach)]/60"
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
      className={`group grid gap-1 border-l pl-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-peach)]/70 ${
        active ? 'border-[var(--gb-peach)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted-strong)] hover:border-[var(--line)] hover:text-[var(--foreground)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold">{label}</span>
        <span
          className={`h-2 w-2 rounded-full transition ${
            active ? 'bg-[var(--gb-peach)] shadow-[0_0_0_6px_rgba(243,181,138,0.14)]' : 'bg-[var(--border)] group-hover:bg-[var(--gb-berry)]'
          }`}
        />
      </div>
      {detail ? <div className="text-xs leading-5 text-[var(--muted)]">{detail}</div> : null}
    </Link>
  );
}
