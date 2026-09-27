// ─── Button — three variants: primary (filled), secondary (outline), ghost ──
import React from 'react';
import { classNames } from '../../utils/formatters';

const VARIANTS = {
  primary:   'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-brand hover:shadow-brand-lg border border-brand-600',
  secondary: 'bg-white text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-400 border border-brand-300',
  ghost:     'bg-transparent text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-400 border border-transparent',
  outline:   'bg-white text-neutral-700 hover:bg-neutral-50 focus-visible:ring-neutral-400 border border-neutral-300',
  danger:    'bg-white text-red-600 hover:bg-red-50 border border-red-300 focus-visible:ring-red-400',
  accent:    'bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500 shadow-accent border border-accent-600',
};

const SIZES = {
  xs: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  sm: 'px-4 py-2 text-sm rounded-xl gap-2',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
  xl: 'px-8 py-4 text-lg rounded-pill gap-3',
};

const renderIconNode = (iconProp, size = 18) => {
  if (!iconProp) return null;
  if (React.isValidElement(iconProp)) {
    return <span className="shrink-0">{iconProp}</span>;
  }
  const IconComponent = iconProp;
  return <span className="shrink-0"><IconComponent size={size} /></span>;
};

export const Button = ({
  children,
  variant = 'primary',
  size    = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      className={classNames(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'active:scale-[0.98]',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        renderIconNode(icon)
      )}
      {children}
      {!loading && renderIconNode(iconRight)}
    </button>
  );
};
