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
    <div className="glass rounded-2xl p-5 shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_10px_30px_rgba(0,0,0,0.35)]">
      {(title || subtitle || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-sm font-semibold tracking-wide text-[var(--gb-cream)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
            )}
          </div>
          {right}
        </div>
      )}
      {children}
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
    'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--gb-gold)]/50 disabled:opacity-50 disabled:cursor-not-allowed';
  const styles: Record<string, string> = {
    primary:
      'bg-[var(--gb-gold)] text-black hover:brightness-95 shadow-[0_6px_18px_rgba(201,168,76,0.18)]',
    ghost: 'bg-transparent text-[var(--gb-cream)] hover:bg-white/5',
    outline:
      'bg-transparent text-[var(--gb-cream)] border border-[var(--border)] hover:bg-white/5',
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
      className="w-full rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2 text-sm text-[var(--gb-cream)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gb-teal)]/60"
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
      className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2 text-sm text-[var(--gb-cream)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gb-teal)]/60"
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
      className={`rounded-xl px-3 py-2 text-sm transition ${
        active
          ? 'bg-white/5 text-[var(--gb-cream)] border border-[var(--border)]'
          : 'text-[var(--muted)] hover:text-[var(--gb-cream)] hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );
}
