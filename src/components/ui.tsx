import Link from 'next/link';
import { ReactNode } from 'react';

export function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="glass card-edge rounded-3xl p-6 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)]">
      {(title || subtitle || right) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold leading-6 tracking-tight text-[var(--gb-cream)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      {children}
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
    'inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px';

  const styles: Record<string, string> = {
    primary:
      'bg-[linear-gradient(180deg,rgba(201,168,76,1),rgba(201,168,76,0.86))] text-black shadow-[0_14px_36px_rgba(201,168,76,0.12)] hover:brightness-[0.99]',
    ghost: 'bg-transparent text-[var(--gb-cream)] hover:bg-white/5',
    outline:
      'bg-transparent text-[var(--gb-cream)] border border-[var(--border)] hover:bg-white/5 hover:border-[rgba(201,168,76,0.30)]',
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
      className="w-full rounded-xl border border-[var(--border)] bg-black/25 px-3.5 py-2.5 text-sm text-[var(--gb-cream)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-teal)]/60"
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
      className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-black/25 px-3.5 py-2.5 text-sm text-[var(--gb-cream)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-teal)]/60"
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
      className={`group flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
        active
          ? 'bg-white/5 text-[var(--gb-cream)] border border-[var(--border)] shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : 'text-[var(--muted)] hover:text-[var(--gb-cream)] hover:bg-white/5'
      }`}
    >
      <span>{label}</span>
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gb-gold)] shadow-[0_0_0_4px_rgba(201,168,76,0.14)]" />
      )}
    </Link>
  );
}
