import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, Clock, ThumbsUp, MessageSquare, AlertTriangle, Check } from 'lucide-react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/notifications.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatRelative } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getNotifications();
        setNotifications(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    if (type === 'resolved') return <CheckCircle2 size={16} className="text-emerald-600" />;
    if (type === 'upvote') return <ThumbsUp size={16} className="text-brand-600" />;
    if (type === 'comment') return <MessageSquare size={16} className="text-sky-600" />;
    return <AlertTriangle size={16} className="text-amber-600" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Notifications</h1>
          <p className="text-xs text-neutral-500">Live ticket milestones, officer updates, and community activity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="rounded-full text-xs">
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <Card
            key={item.id}
            hover
            className={`p-4 transition-all flex items-start gap-4 ${
              !item.isRead ? 'bg-brand-50/40 border-brand-200' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white shadow-soft-sm shrink-0 border border-neutral-100">
              {getIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <Link
                  to={`/app/complaint/${item.complaintId}`}
                  className="font-bold text-sm text-neutral-900 hover:text-brand-700 hover:underline"
                >
                  {item.title}
                </Link>
                <span className="text-[11px] text-neutral-400">{formatRelative(item.createdAt)}</span>
              </div>
              <p className="text-xs text-neutral-600">{item.body}</p>
            </div>

            {!item.isRead && (
              <button
                onClick={() => handleMarkOne(item.id)}
                className="p-1 text-neutral-400 hover:text-brand-600 cursor-pointer"
                title="Mark as read"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 block"></span>
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
