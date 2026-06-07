import { apiClient } from './client';
import type { SavedJob } from '@/models/savedJob';

export const savedJobsApi = {
  getMine: () => apiClient<SavedJob[]>('/savedjobs/me'),

  save: (jobId: string) =>
    apiClient<SavedJob>('/savedjobs', { method: 'POST', body: { jobId } }),

  unsave: (id: string) =>
    apiClient<void>(`/savedjobs/${id}`, { method: 'DELETE' }),

  unsaveByJob: (jobId: string) =>
    apiClient<void>(`/savedjobs/by-job/${jobId}`, { method: 'DELETE' }),
};
