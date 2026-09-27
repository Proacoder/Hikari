// ─── Card — clean white card with soft shadow ──────────────────────────────
import { classNames } from '../../utils/formatters';

export const Card = ({ children, className = '', padding = 'p-6', hover = false, ...props }) => (
  <div
    className={classNames(
      'bg-white rounded-2xl border border-neutral-100 shadow-soft',
      padding,
      hover && 'hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={classNames('flex items-start justify-between gap-4 mb-5', className)}>
    <div>
      {title && <h3 className="text-base font-semibold text-neutral-900">{title}</h3>}
      {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
