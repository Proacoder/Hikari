// ─── Skeleton loaders ─────────────────────────────────────────────────────
import { classNames } from '../../utils/formatters';

export const Skeleton = ({ className = '', ...props }) => (
  <div className={classNames('skeleton', className)} {...props} />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-3 shadow-soft">
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-6 w-16 rounded-pill" />
      <Skeleton className="h-6 w-20 rounded-pill" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3">
    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-6 w-20 rounded-pill shrink-0" />
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} className={classNames('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);

export const SkeletonKpiCard = () => (
  <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-soft space-y-3">
    <div className="flex justify-between">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-5 w-14 rounded-pill" />
    </div>
    <Skeleton className="h-7 w-24" />
    <Skeleton className="h-3.5 w-32" />
  </div>
);
