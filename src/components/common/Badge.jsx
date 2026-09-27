// ─── Badge ───────────────────────────────────────────────────────────────────
import { classNames } from '../../utils/formatters';

const BADGE_VARIANTS = {
  green:    'text-green-700 bg-green-50 border-green-200',
  red:      'text-red-700 bg-red-50 border-red-200',
  orange:   'text-orange-700 bg-orange-50 border-orange-200',
  amber:    'text-amber-700 bg-amber-50 border-amber-200',
  blue:     'text-blue-700 bg-blue-50 border-blue-200',
  indigo:   'text-indigo-700 bg-indigo-50 border-indigo-200',
  sky:      'text-sky-700 bg-sky-50 border-sky-200',
  slate:    'text-slate-600 bg-slate-50 border-slate-200',
  brand:    'text-brand-700 bg-brand-50 border-brand-200',
  success:  'text-emerald-700 bg-emerald-50 border-emerald-200',
  warning:  'text-amber-700 bg-amber-50 border-amber-200',
  danger:   'text-red-700 bg-red-50 border-red-200',
};

export const Badge = ({ children, variant = 'slate', dot = false, className = '' }) => (
  <span
    className={classNames(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-semibold border',
      BADGE_VARIANTS[variant] || BADGE_VARIANTS.slate,
      className
    )}
  >
    {dot && (
      <span className={classNames('w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0')} />
    )}
    {children}
  </span>
);
