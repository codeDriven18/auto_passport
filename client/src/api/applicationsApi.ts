import { apiClient } from './client';
import type { JobApplication } from '@/models/application';

export const applicationsApi = {
  getMine: () => apiClient<JobApplication[]>('/applications/me'),

  apply: (jobId: string) =>
    apiClient<JobApplication>('/applications', { method: 'POST', body: { jobId } }),

  withdraw: (id: string) =>
    apiClient<void>(`/applications/${id}`, { method: 'DELETE' }),
};
