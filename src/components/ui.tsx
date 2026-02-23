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
    <section className="glass rounded-2xl p-5 shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_18px_50px_rgba(0,0,0,0.45)] transition hover:shadow-[0_0_0_1px_rgba(201,168,76,0.12),0_22px_60px_rgba(0,0,0,0.52)]">
      {(title || subtitle || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-wide text-[var(--gb-cream)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{subtitle}</p>
            )}
          </div>
          {right}
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
    'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px';

  const styles: Record<string, string> = {
    primary:
      'bg-[linear-gradient(180deg,rgba(201,168,76,1),rgba(201,168,76,0.88))] text-black shadow-[0_10px_28px_rgba(201,168,76,0.10)] hover:brightness-[0.98]',
    ghost: 'bg-transparent text-[var(--gb-cream)] hover:bg-white/5',
    outline:
      'bg-transparent text-[var(--gb-cream)] border border-[var(--border)] hover:bg-white/5 hover:border-[rgba(201,168,76,0.28)]',
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
      className="w-full rounded-xl border border-[var(--border)] bg-black/25 px-3 py-2 text-sm text-[var(--gb-cream)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-teal)]/55"
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
      className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-black/25 px-3 py-2 text-sm text-[var(--gb-cream)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-teal)]/55"
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
      className={`rounded-xl px-3 py-2 text-sm font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
        active
          ? 'bg-white/5 text-[var(--gb-cream)] border border-[var(--border)] shadow-[0_1px_0_rgba(255,255,255,0.05)]'
          : 'text-[var(--muted)] hover:text-[var(--gb-cream)] hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );
}
