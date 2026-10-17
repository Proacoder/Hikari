import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Check, Trash2, ExternalLink,
  AlertTriangle, CheckCircle2, MessageSquare, ThumbsUp, UserCheck
} from 'lucide-react';
import { formatRelative, classNames } from '../../utils/formatters';

const getNotificationIcon = (type, size = 16) => {
  switch (type) {
    case 'resolved':
      return <CheckCircle2 size={size} className="text-emerald-600" />;
    case 'comment':
      return <MessageSquare size={size} className="text-sky-600" />;
    case 'upvote':
      return <ThumbsUp size={size} className="text-amber-600" />;
    case 'assigned':
      return <UserCheck size={size} className="text-indigo-600" />;
    case 'alert':
      return <AlertTriangle size={size} className="text-rose-600" />;
    default:
      return <Bell size={size} className="text-brand-600" />;
  }
};

export const NotificationItem = ({
  item,
  onMarkRead,
  onDelete,
  onGrievanceClick,
  isCompact = false,
  viewGrievanceLabel = 'View Grievance',
  justNowLabel = 'Just now',
}) => {
  return (
    <div
      className={classNames(
        'rounded-xl border transition-all text-xs relative group',
        isCompact ? 'p-3 space-y-2' : 'p-4 space-y-2 hover:shadow-soft-md',
        item.isRead
          ? 'bg-white border-neutral-100 hover:border-neutral-200'
          : 'bg-brand-50/40 border-brand-200 shadow-soft-xs'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={classNames(
              'rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5',
              isCompact ? 'w-7 h-7' : 'w-9 h-9'
            )}
          >
            {getNotificationIcon(item.type, isCompact ? 15 : 18)}
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className={classNames(
                  'text-neutral-900 truncate',
                  isCompact ? 'text-xs' : 'text-sm',
                  item.isRead ? 'font-medium' : 'font-bold'
                )}
              >
                {item.title}
              </h4>
              {!item.isRead && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
              )}
            </div>
            <p className={classNames('text-neutral-600 leading-relaxed', isCompact ? 'text-[11px]' : 'text-xs max-w-2xl')}>
              {item.body}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {!item.isRead && (
            <button
              onClick={() => onMarkRead?.(item.id)}
              title="Mark as read"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-neutral-100 transition-colors"
            >
              <Check size={isCompact ? 14 : 16} />
            </button>
          )}
          <button
            onClick={() => onDelete?.(item.id)}
            title="Delete notification"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={isCompact ? 13 : 15} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-100/60">
        <span>{item.createdAt ? formatRelative(item.createdAt) : justNowLabel}</span>
        {item.complaintId && (
          <Link
            to="/app/my-complaints"
            onClick={() => onGrievanceClick?.(item)}
            className="font-medium text-brand-600 hover:underline flex items-center gap-1"
          >
            <span>{viewGrievanceLabel}</span>
            <ExternalLink size={11} />
          </Link>
        )}
      </div>
    </div>
  );
};
