import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  createNotification as apiCreateNotification,
  deleteNotification as apiDeleteNotification
} from '../api/notifications.api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = useCallback(async (id) => {
    try {
      await apiMarkAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      toast.success('All notifications marked as read', { id: 'mark-all-read' });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  const dispatchNotification = useCallback(async ({ title, body, type = 'status_update', complaintId = null }) => {
    try {
      const res = await apiCreateNotification({ title, body, type, complaintId });
      const newNotif = res?.data;
      if (newNotif) {
        setNotifications((prev) => [newNotif, ...prev]);
        toast(
          (t) => (
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="font-bold text-neutral-900">{title}</span>
              <span className="text-neutral-600 line-clamp-2">{body}</span>
            </div>
          ),
          {
            icon: '🔔',
            duration: 4500,
          }
        );
      }
    } catch (err) {
      console.error('Failed to dispatch notification:', err);
    }
  }, []);

  const deleteNotif = useCallback(async (id) => {
    try {
      await apiDeleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification removed');
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        markRead,
        markAllRead,
        dispatchNotification,
        deleteNotif,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};

export default NotificationContext;
