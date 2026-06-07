import type { Job } from './job';

export interface SavedJob {
  id: string;
  savedAt: string;
  userProfileId: string;
  jobId: string;
  job?: Job;
}

export interface CreateSavedJobRequest {
  jobId: string;
}
