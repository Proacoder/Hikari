// ─── Input with label + error ──────────────────────────────────────────────
import { forwardRef } from 'react';
import { classNames } from '../../utils/formatters';

const baseInput = 'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 focus:border-brand-400';

export const Input = forwardRef(({ label, error, hint, id, required, icon: Icon, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          <Icon size={16} />
        </span>
      )}
      <input
        ref={ref}
        id={id}
        className={classNames(
          baseInput,
          error ? 'border-red-400 focus:ring-red-400' : 'border-neutral-200',
          Icon && 'pl-9',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
    </div>
    {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 flex items-center gap-1">{error}</p>}
    {!error && hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
  </div>
));
Input.displayName = 'Input';
