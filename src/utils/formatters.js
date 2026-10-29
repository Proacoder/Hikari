// ─── Utility helpers for Kaiser AI ─────────────────────────────────────────

import { format, formatDistanceToNow, differenceInDays, parseISO, isValid } from 'date-fns';

// ── Date formatting helper ──────────────────────────────────────────────────
export const safeParseDate = (val) => {
  if (!val) return null;
  try {
    if (typeof val === 'string') {
      let str = val.trim();
      // If ISO string without timezone indicator (e.g., 2026-10-29T13:15:30), treat as UTC
      if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}(?::?\d{2})?$/.test(str)) {
        str = str + 'Z';
      }
      const d = parseISO(str);
      if (isValid(d)) return d;
    }
    const d = new Date(val);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
};

// ── Date formatting ──────────────────────────────────────────────────────────
export const formatDate = (iso) => {
  const d = safeParseDate(iso);
  if (!d) return '—';
  try {
    return format(d, 'd MMM yyyy');
  } catch {
    return '—';
  }
};

export const formatDateTime = (iso) => {
  const d = safeParseDate(iso);
  if (!d) return '—';
  try {
    return format(d, 'd MMM yyyy, h:mm a');
  } catch {
    return '—';
  }
};

export const formatRelative = (iso) => {
  const d = safeParseDate(iso);
  if (!d) return '—';
  try {
    const diffSeconds = Math.round((Date.now() - d.getTime()) / 1000);
    // Recent submissions (<60 seconds or slight clock skew)
    if (diffSeconds < 60 && diffSeconds >= -60) {
      return 'Just now';
    }
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
};

export const daysOpen = (createdAt, resolvedAt = null) => {
  const start = safeParseDate(createdAt);
  if (!start) return 0;
  const end = safeParseDate(resolvedAt) || new Date();
  try {
    return Math.max(0, differenceInDays(end, start));
  } catch {
    return 0;
  }
};

// ── Severity ─────────────────────────────────────────────────────────────────
export const getSeverityLabel = (score) => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

export const getSeverityColor = (score) => {
  if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
  if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
  if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-green-600 bg-green-50 border-green-200';
};

export const getSeverityDotColor = (score) => {
  if (score >= 80) return 'bg-red-500';
  if (score >= 60) return 'bg-orange-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-green-500';
};
// ── Status ───────────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  reported:    'Reported',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  reopened:    'Contested / Reopened',
  escalated:   'Escalated',
  duplicate:   'Duplicate',
};

const STATUS_COLORS = {
  reported:    'text-indigo-600 bg-indigo-50 border-indigo-200',
  assigned:    'text-sky-600 bg-sky-50 border-sky-200',
  in_progress: 'text-amber-600 bg-amber-50 border-amber-200',
  resolved:    'text-green-600 bg-green-50 border-green-200',
  reopened:    'text-red-700 bg-red-50 border-red-300',
  escalated:   'text-rose-700 bg-rose-50 border-rose-300',
  duplicate:   'text-slate-500 bg-slate-50 border-slate-200',
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;
export const getStatusColor = (status) => STATUS_COLORS[status] || 'text-slate-600 bg-slate-50 border-slate-200';

// ── Category ─────────────────────────────────────────────────────────────────
export const CATEGORY_COLORS = {
  Pothole:        'text-stone-600 bg-stone-50 border-stone-200',
  Garbage:        'text-lime-600 bg-lime-50 border-lime-200',
  Drainage:       'text-blue-600 bg-blue-50 border-blue-200',
  Streetlight:    'text-yellow-600 bg-yellow-50 border-yellow-200',
  'Water Leakage':'text-cyan-600 bg-cyan-50 border-cyan-200',
  Other:          'text-slate-600 bg-slate-50 border-slate-200',
};

// ── Misc ──────────────────────────────────────────────────────────────────────
export const classNames = (...classes) => classes.filter(Boolean).join(' ');

