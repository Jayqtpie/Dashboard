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
      className={`glass card-edge rounded-3xl p-4 shadow-[var(--shadow-card)] transition duration-300 hover:shadow-[var(--shadow-card-hover)] sm:p-6 ${className}`}
    >
      {(title || subtitle || right) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold leading-6 tracking-tight text-[var(--foreground)]">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>}
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
    <section className="glass-strong card-edge rounded-3xl p-5 shadow-[var(--shadow-card)] sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="text-[11px] font-semibold tracking-[0.26em] text-[var(--muted-strong)]">{eyebrow}</div>
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">{description}</p>
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
    'inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold tracking-[0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px';

  const styles: Record<string, string> = {
    primary:
      'bg-[linear-gradient(180deg,#d9bc6a,#c7a34c)] text-[#1f1b10] shadow-[0_14px_34px_rgba(201,168,76,0.22)] hover:brightness-105',
    ghost: 'bg-transparent text-[var(--foreground)] hover:bg-white/5',
    outline:
      'border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:border-[rgba(201,168,76,0.34)] hover:bg-white/5',
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
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-teal)]/55"
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
      className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-teal)]/55"
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
      className={`group flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold tracking-[0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
        active
          ? 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-white/5 hover:text-[var(--foreground)]'
      }`}
    >
      <span className="truncate">{label}</span>
      <span
        className={`h-2 w-2 rounded-full transition ${
          active ? 'bg-[var(--gb-gold)] shadow-[0_0_0_4px_rgba(201,168,76,0.18)]' : 'bg-transparent'
        }`}
      />
    </Link>
  );
}
