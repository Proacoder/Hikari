// ─── Complaint-domain components ──────────────────────────────────────────
import { Link } from 'react-router-dom';
import {
  ThumbsUp, MessageSquare, Clock, MapPin, ChevronRight,
  AlertTriangle, CheckCircle, Loader, Circle, Hash
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import {
  formatRelative, daysOpen, getSeverityLabel, getSeverityColor,
  getSeverityDotColor, getStatusLabel, getStatusColor, CATEGORY_COLORS, truncate
} from '../../utils/formatters';

// ── Category Icon ─────────────────────────────────────────────────────────────
const CATEGORY_LUCIDE = {
  Pothole:       '🕳️',
  Garbage:       '🗑️',
  Drainage:      '💧',
  Streetlight:   '💡',
  'Water Leakage': '🚰',
  Other:         '📋',
};

export const CategoryIcon = ({ category, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-sm', md: 'w-9 h-9 text-base', lg: 'w-12 h-12 text-xl' };
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <div className={`${sizes[size]} rounded-xl border flex items-center justify-center shrink-0 ${colors}`}>
      <span>{CATEGORY_LUCIDE[category] || '📋'}</span>
    </div>
  );
};

// ── Severity Badge ─────────────────────────────────────────────────────────────
export const SeverityBadge = ({ score, level }) => {
  const val = score ?? level ?? 0;
  const label = getSeverityLabel(val);
  const colorCls = getSeverityColor(val);
  const dotCls   = getSeverityDotColor(val);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${colorCls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
      {label} · {val}
    </span>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const label    = getStatusLabel(status);
  const colorCls = getStatusColor(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${colorCls}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-70" />
      {label}
    </span>
  );
};

// ── Complaint Card ─────────────────────────────────────────────────────────────
export const ComplaintCard = ({ complaint }) => {
  const {
    id, title, category, severity, status, upvoteCount,
    commentCount, createdAt, resolvedAt, imageUrl, ward
  } = complaint;

  return (
    <Card hover className="overflow-hidden p-0">
      <Link to={`/app/complaint/${id}`} className="block">
        {/* Image */}
        <div className="relative h-40 bg-neutral-100 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={`Photo of ${title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CategoryIcon category={category} size="lg" />
            </div>
          )}
          <div className="absolute top-2.5 left-2.5">
            <SeverityBadge score={severity} />
          </div>
          <div className="absolute top-2.5 right-2.5">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <CategoryIcon category={category} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">{title}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-400">
                <MapPin size={11} />
                <span>Ward {ward}</span>
                <span>·</span>
                <Clock size={11} />
                <span>{formatRelative(createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-50">
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <ThumbsUp size={13} />
                {upvoteCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={13} />
                {commentCount}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {daysOpen(createdAt, resolvedAt)}d
              </span>
            </div>
            <ChevronRight size={16} className="text-neutral-300" />
          </div>
        </div>
      </Link>
    </Card>
  );
};

// ── Status Timeline ───────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { key: 'reported',    label: 'Reported',    icon: AlertTriangle },
  { key: 'assigned',   label: 'Assigned',    icon: Hash          },
  { key: 'in_progress',label: 'In Progress', icon: Loader        },
  { key: 'resolved',   label: 'Resolved',    icon: CheckCircle   },
];

const STATUS_ORDER = { reported: 0, assigned: 1, in_progress: 2, resolved: 3 };

export const StatusTimeline = ({ status, complaint }) => {
  const currentIdx = STATUS_ORDER[status] ?? 0;
  return (
    <ol className="relative">
      {TIMELINE_STEPS.map((step, idx) => {
        const done    = idx < currentIdx;
        const active  = idx === currentIdx;
        const future  = idx > currentIdx;
        const Icon    = step.icon;
        return (
          <li key={step.key} className="flex gap-4 pb-6 last:pb-0">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10
                ${done   ? 'bg-brand-600 border-brand-600 text-white'            : ''}
                ${active ? 'bg-white border-brand-600 text-brand-600 shadow-brand' : ''}
                ${future ? 'bg-neutral-100 border-neutral-200 text-neutral-300'  : ''}
              `}>
                <Icon size={14} strokeWidth={active ? 2.5 : 2} />
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={`w-0.5 flex-1 mt-1 ${done ? 'bg-brand-400' : 'bg-neutral-200'}`} />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 pt-1 pb-4">
              <p className={`text-sm font-semibold ${active ? 'text-brand-700' : done ? 'text-neutral-700' : 'text-neutral-400'}`}>
                {step.label}
              </p>
              {active && (
                <p className="text-xs text-brand-600 mt-0.5 font-medium">Current status</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
