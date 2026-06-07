import { apiClient } from './client';
import type {
  PortalApplication,
  PortalCreateJobRequest,
  PortalJob,
  PortalStats,
  PortalUpdateJobRequest,
} from '@/models/portal';

export const portalApi = {
  getStats: () => apiClient<PortalStats>('/portal/stats'),

  getJobs: () => apiClient<PortalJob[]>('/portal/jobs'),

  createJob: (data: PortalCreateJobRequest) =>
    apiClient<PortalJob>('/portal/jobs', { method: 'POST', body: data }),

  updateJob: (id: string, data: PortalUpdateJobRequest) =>
    apiClient<PortalJob>(`/portal/jobs/${id}`, { method: 'PUT', body: data }),

  archiveJob: (id: string) =>
    apiClient<void>(`/portal/jobs/${id}/archive`, { method: 'POST' }),

  getApplications: (jobId?: string) => {
    const query = jobId ? `?jobId=${jobId}` : '';
    return apiClient<PortalApplication[]>(`/portal/applications${query}`);
  },
};
