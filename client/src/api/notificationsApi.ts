import { apiClient } from './client';
import type { AppNotification } from '@/models/personalization';

export const notificationsApi = {
  getMine: (limit = 20) =>
    apiClient<AppNotification[]>(`/notifications/me?limit=${limit}`),
  getUnreadCount: () =>
    apiClient<{ count: number }>('/notifications/me/unread-count'),
  markRead: (id: string) =>
    apiClient<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    apiClient<void>('/notifications/me/read-all', { method: 'PATCH' }),
};
