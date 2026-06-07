import { apiClient } from './client';
import type { UserDashboard } from '@/models/dashboard';

export const dashboardApi = {
  getMyDashboard: () => apiClient<UserDashboard>('/dashboard/me'),
};
