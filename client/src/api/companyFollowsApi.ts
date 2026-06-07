import { apiClient } from './client';
import type { CompanyFollow } from '@/models/personalization';

export const companyFollowsApi = {
  getMine: () => apiClient<CompanyFollow[]>('/companyfollows/me'),
  isFollowing: (companyId: string) =>
    apiClient<{ following: boolean }>(`/companyfollows/me/companies/${companyId}`),
  follow: (companyId: string) =>
    apiClient<CompanyFollow>('/companyfollows', {
      method: 'POST',
      body: { companyId },
    }),
  unfollow: (companyId: string) =>
    apiClient<void>(`/companyfollows/me/companies/${companyId}`, { method: 'DELETE' }),
};
