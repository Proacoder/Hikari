import React, { useState } from 'react';
import { Bell, CheckCheck, Search } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { classNames } from '../utils/formatters';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { NotificationItem } from '../components/notifications/NotificationItem';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotif } = useNotifications();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all'); // all | unread
  const [search, setSearch] = useState('');

  const filtered = notifications.filter((item) => {
    if (activeTab === 'unread' && item.isRead) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.body?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">{t('notif.title', 'Notifications Center')}</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {t('notif.sub', 'Real-time alerts, ward updates, and complaint tracking')}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllRead}>
            {t('notif.markAllRead', 'Mark All as Read')}
          </Button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={classNames(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              activeTab === 'all'
                ? 'bg-brand-600 text-white shadow-soft-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={classNames(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              activeTab === 'unread'
                ? 'bg-brand-600 text-white shadow-soft-xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Filter notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Bell size={24} />
            </div>
            <p className="text-sm font-semibold text-neutral-700">
              {activeTab === 'unread' ? t('notif.emptyUnread', 'All caught up!') : t('notif.empty', 'No notifications found.')}
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Any future municipal announcements or progress on your civic grievances will appear here.
            </p>
          </Card>
        ) : (
          filtered.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              isCompact={false}
              onMarkRead={markRead}
              onDelete={deleteNotif}
              viewGrievanceLabel={t('notif.viewComplaint', 'View Grievance')}
              justNowLabel={t('notif.justNow', 'Just now')}
            />
          ))
        )}
      </div>
    </div>
  );
};

