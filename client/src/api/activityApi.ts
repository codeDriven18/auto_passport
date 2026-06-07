import { apiClient } from './client';
import { ActivityType } from '@/models/personalization';

export interface RecordActivityRequest {
  activityType: ActivityType;
  jobId?: string;
  companyId?: string;
}

export const activityApi = {
  record: (payload: RecordActivityRequest) =>
    apiClient('/activities', { method: 'POST', body: payload }),
};
