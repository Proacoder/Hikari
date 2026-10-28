import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  createNotification as apiCreateNotification,
  deleteNotification as apiDeleteNotification,
} from '../api/notifications.api';
import { MOCK_MODE } from '../api/client';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    // Only fetch when authenticated — notifications require auth in live mode
    const token = localStorage.getItem('kaiser_token');
    if (!MOCK_MODE && !token) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      // 401 = not logged in, silently clear; other errors log
      if (err?.response?.status !== 401) {
        console.error('Failed to load notifications:', err?.message || err);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when user changes (login/logout)
  useEffect(() => {
    let isMounted = true;
    void Promise.resolve().then(() => {
      if (isMounted) {
        fetchNotifications();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchNotifications, user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = useCallback(async (id) => {
    try {
      await apiMarkAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err?.message || err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read', { id: 'mark-all-read' });
    } catch (err) {
      console.error('Failed to mark all as read:', err?.message || err);
    }
  }, []);

  const dispatchNotification = useCallback(
    async ({ title, body, type = 'status_update', complaintId = null }) => {
      // In live mode, notifications are created server-side when events happen.
      // This client-side dispatch only stores locally (mock mode) or posts to server.
      try {
        const res = await apiCreateNotification({ title, body, type, complaintId });
        const newNotif = res?.data;
        if (newNotif) {
          setNotifications((prev) => [newNotif, ...prev]);
          toast(
            () => (
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="font-bold text-neutral-900">{title}</span>
                <span className="text-neutral-600 line-clamp-2">{body}</span>
              </div>
            ),
            { icon: '🔔', duration: 4500 }
          );
        }
      } catch (err) {
        // In live mode, if user isn't logged in, notification creation will fail —
        // show a client-only toast instead
        if (err?.response?.status === 401) {
          toast(title, { icon: '🔔', duration: 4500 });
        } else {
          console.error('Failed to dispatch notification:', err?.message || err);
        }
      }
    },
    []
  );

  const deleteNotif = useCallback(async (id) => {
    try {
      await apiDeleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification removed');
    } catch (err) {
      console.error('Failed to delete notification:', err?.message || err);
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
