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
