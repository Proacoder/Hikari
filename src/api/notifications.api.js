import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_NOTIFICATIONS } from '../utils/mockData';

let _notifications = Array.isArray(MOCK_NOTIFICATIONS) ? [...MOCK_NOTIFICATIONS] : [];

// GET /api/notifications
export const getNotifications = async () => {
  if (MOCK_MODE) {
    await mockDelay(250);
    return successResponse([..._notifications]);
  }
  const res = await apiClient.get('/notifications');
  return res.data;
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (id) => {
  if (MOCK_MODE) {
    await mockDelay(150);
    const n = _notifications.find((x) => x.id === id);
    if (n) n.isRead = true;
    return successResponse(n);
  }
  const res = await apiClient.patch(`/notifications/${id}/read`);
  return res.data;
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async () => {
  if (MOCK_MODE) {
    await mockDelay(200);
    _notifications.forEach((n) => (n.isRead = true));
    return successResponse({ message: 'All notifications marked as read' });
  }
  const res = await apiClient.patch('/notifications/read-all');
  return res.data;
};

// POST /api/notifications (Dispatch a new notification locally or to server)
export const createNotification = async (payload) => {
  if (MOCK_MODE) {
    await mockDelay(100);
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: payload.type || 'status_update',
      title: payload.title || 'Civic Alert',
      body: payload.body || '',
      complaintId: payload.complaintId || null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    _notifications.unshift(newNotif);
    return successResponse(newNotif);
  }
  const res = await apiClient.post('/notifications', payload);
  return res.data;
};

// DELETE /api/notifications/:id
export const deleteNotification = async (id) => {
  if (MOCK_MODE) {
    await mockDelay(150);
    _notifications = _notifications.filter((n) => n.id !== id);
    return successResponse({ success: true, id });
  }
  const res = await apiClient.delete(`/notifications/${id}`);
  return res.data;
};
