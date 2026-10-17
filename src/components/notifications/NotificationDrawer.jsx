import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { classNames } from '../../utils/formatters';
import { NotificationItem } from './NotificationItem';

export const NotificationDrawer = () => {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    markRead,
    markAllRead,
    deleteNotif
  } = useNotifications();

  const { t } = useLanguage();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  if (!isDrawerOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-100">
          
          {/* Header */}
          <div className="p-4 sm:px-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-neutral-900">{t('notif.title', 'Notifications Center')}</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500">{t('notif.sub', 'Real-time alerts & grievance updates')}</p>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subheader Toolbar & Tabs */}
          <div className="px-4 sm:px-6 py-2.5 border-b border-neutral-100 flex items-center justify-between text-xs bg-white">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter('all')}
                className={classNames(
                  'px-2.5 py-1 rounded-lg font-medium transition-colors',
                  filter === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={classNames(
                  'px-2.5 py-1 rounded-lg font-medium transition-colors',
                  filter === 'unread'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800 transition-colors"
              >
                <CheckCheck size={14} />
                <span>{t('notif.markAllRead', 'Mark all read')}</span>
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-2 sm:p-3 space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <Bell size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-700">
                    {filter === 'unread' ? t('notif.emptyUnread', 'All caught up!') : t('notif.empty', 'No notifications')}
                  </p>
                  <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                    {filter === 'unread'
                      ? 'You have read all municipal alerts and ticket updates.'
                      : 'You will receive notifications when civic issues are submitted or updated.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  item={notif}
                  isCompact={true}
                  onMarkRead={markRead}
                  onDelete={deleteNotif}
                  onGrievanceClick={(item) => {
                    markRead(item.id);
                    setIsDrawerOpen(false);
                  }}
                  viewGrievanceLabel={t('notif.viewComplaint', 'View Grievance')}
                  justNowLabel={t('notif.justNow', 'Just now')}
                />
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500">
            <Link
              to="/app/notifications"
              onClick={() => setIsDrawerOpen(false)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
            >
              <span>{t('notif.fullCenter', 'Open Full Notifications Center')}</span>
              <ExternalLink size={12} />
            </Link>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900"
            >
              {t('common.close', 'Close')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

