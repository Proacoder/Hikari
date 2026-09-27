// ─── Utility helpers for Kaiser AI ─────────────────────────────────────────

import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

// ── Date formatting ──────────────────────────────────────────────────────────
export const formatDate = (iso) => {
  if (!iso) return '—';
  return format(parseISO(iso), 'd MMM yyyy');
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  return format(parseISO(iso), 'd MMM yyyy, h:mm a');
};

export const formatRelative = (iso) => {
  if (!iso) return '—';
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
};

export const daysOpen = (createdAt, resolvedAt = null) => {
  if (!createdAt) return 0;
  const end = resolvedAt ? parseISO(resolvedAt) : new Date();
  return differenceInDays(end, parseISO(createdAt));
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

export const getSeverityMarkerColor = (score) => {
  if (score >= 80) return '#dc2626';
  if (score >= 60) return '#ea580c';
  if (score >= 40) return '#d97706';
  return '#16a34a';
};

// ── Status ───────────────────────────────────────────────────────────────────
export const STATUS_LABELS = {
  reported:    'Reported',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  duplicate:   'Duplicate',
};

export const STATUS_COLORS = {
  reported:    'text-indigo-600 bg-indigo-50 border-indigo-200',
  assigned:    'text-sky-600 bg-sky-50 border-sky-200',
  in_progress: 'text-amber-600 bg-amber-50 border-amber-200',
  resolved:    'text-green-600 bg-green-50 border-green-200',
  duplicate:   'text-slate-500 bg-slate-50 border-slate-200',
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;
export const getStatusColor = (status) => STATUS_COLORS[status] || 'text-slate-600 bg-slate-50 border-slate-200';

// ── Category ─────────────────────────────────────────────────────────────────
export const CATEGORY_ICONS = {
  Pothole:       '🕳️',
  Garbage:       '🗑️',
  Drainage:      '💧',
  Streetlight:   '💡',
  'Water Leakage': '🚰',
  Other:         '📋',
};

export const CATEGORY_COLORS = {
  Pothole:        'text-stone-600 bg-stone-50 border-stone-200',
  Garbage:        'text-lime-600 bg-lime-50 border-lime-200',
  Drainage:       'text-blue-600 bg-blue-50 border-blue-200',
  Streetlight:    'text-yellow-600 bg-yellow-50 border-yellow-200',
  'Water Leakage':'text-cyan-600 bg-cyan-50 border-cyan-200',
  Other:          'text-slate-600 bg-slate-50 border-slate-200',
};

// ── Number formatting ─────────────────────────────────────────────────────────
export const formatNumber = (n) => {
  if (n === undefined || n === null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const formatPercent = (n, decimals = 1) => {
  return `${Number(n).toFixed(decimals)}%`;
};

// ── Misc ──────────────────────────────────────────────────────────────────────
export const truncate = (str, max = 80) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};

export const getInitials = (name = '') => {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');
