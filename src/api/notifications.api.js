import { apiClient, MOCK_MODE, mockDelay, successResponse } from './client';
import { MOCK_NOTIFICATIONS } from '../utils/mockData';

const _notifications = [...MOCK_NOTIFICATIONS];

// GET /api/notifications
export const getNotifications = async () => {
  if (MOCK_MODE) {
    await mockDelay(400);
    return successResponse(_notifications);
  }
  const res = await apiClient.get('/notifications');
  return res.data;
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (id) => {
  if (MOCK_MODE) {
    await mockDelay(200);
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
    await mockDelay(300);
    _notifications.forEach((n) => (n.isRead = true));
    return successResponse({ message: 'All notifications marked as read' });
  }
  const res = await apiClient.patch('/notifications/read-all');
  return res.data;
};
