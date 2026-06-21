import type { RecruiterActivityType } from '@/models/recruiter';

export interface PortalWorkspaceActivity {
  type: RecruiterActivityType;
  occurredAt: string;
  message: string;
  applicationId?: string;
  jobId?: string;
  conversationId?: string;
}
