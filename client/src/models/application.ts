import type { ApplicationStatus } from './enums';
import type { Job } from './job';

export interface JobApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
  userProfileId: string;
  jobId: string;
  job?: Job;
}

export interface CreateApplicationRequest {
  jobId: string;
}
