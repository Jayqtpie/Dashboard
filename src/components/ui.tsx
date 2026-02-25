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
      className={`card-edge rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-6 ${className}`}
    >
      {(title || subtitle || right) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-semibold leading-6 tracking-tight text-[var(--foreground)]">{title}</h2>}
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
    <section className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,#ffffff_0%,#f2f8ff_100%)] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">{eyebrow}</div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.02em] text-[var(--foreground)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">{description}</p>
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
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold tracking-[0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-cyan)]/55 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px';

  const styles: Record<string, string> = {
    primary:
      'bg-[linear-gradient(135deg,var(--gb-indigo)_0%,var(--gb-violet)_100%)] text-white shadow-[0_8px_24px_rgba(30,58,138,0.28)] hover:brightness-110',
    ghost: 'bg-transparent text-[var(--foreground)] hover:bg-slate-100',
    outline: 'border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-slate-50',
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
      className="w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-cyan)]/50"
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
      className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-cyan)]/50"
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
      className={`group flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-cyan)]/55 ${
        active
          ? 'bg-[linear-gradient(135deg,#dbeafe_0%,#ede9fe_100%)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(30,58,138,0.16)]'
          : 'text-[var(--muted-strong)] hover:bg-white'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full transition ${
          active ? 'bg-[var(--gb-violet)] shadow-[0_0_0_4px_rgba(124,58,237,0.15)]' : 'bg-slate-300 group-hover:bg-slate-400'
        }`}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}
