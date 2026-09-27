import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, ExternalLink, Filter,
  Search, Shield, CheckCircle2, MessageSquare, ThumbsUp, UserCheck, AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { formatRelative, classNames } from '../utils/formatters';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

const getIcon = (type) => {
  switch (type) {
    case 'resolved':
      return <CheckCircle2 size={18} className="text-emerald-600" />;
    case 'comment':
      return <MessageSquare size={18} className="text-sky-600" />;
    case 'upvote':
      return <ThumbsUp size={18} className="text-amber-600" />;
    case 'assigned':
      return <UserCheck size={18} className="text-indigo-600" />;
    default:
      return <Bell size={18} className="text-brand-600" />;
  }
};

export const NotificationsPage = () => {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotif, loading } = useNotifications();
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
            <Card
              key={item.id}
              className={classNames(
                'p-4 transition-all hover:shadow-soft-md border',
                item.isRead ? 'border-neutral-100 bg-white' : 'border-brand-200 bg-brand-50/30'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={classNames('text-sm text-neutral-900', item.isRead ? 'font-medium' : 'font-bold')}>
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                      {item.body}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400">
                      <span>{item.createdAt ? formatRelative(item.createdAt) : t('notif.justNow', 'Just now')}</span>
                      {item.complaintId && (
                        <Link
                          to={`/app/my-complaints`}
                          className="font-medium text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <span>{t('notif.viewComplaint', 'View Grievance')}</span>
                          <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!item.isRead && (
                    <button
                      onClick={() => markRead(item.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-neutral-100 transition-colors"
                      title={t('notif.markRead', 'Mark read')}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(item.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
