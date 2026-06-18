/** Employer notification events — delivery layer ships in a later phase. */
export type EmployerNotificationType =
  | 'new_application'
  | 'candidate_message'
  | 'interview_accepted'
  | 'interview_cancelled'
  | 'candidate_withdrew'
  | 'job_expired';

export interface EmployerNotificationDefinition {
  type: EmployerNotificationType;
  label: string;
  description: string;
  /** Future: link target in employer portal */
  actionPath?: string;
}

export const EMPLOYER_NOTIFICATION_CATALOG: EmployerNotificationDefinition[] = [
  {
    type: 'new_application',
    label: 'New application',
    description: 'A candidate applied to one of your jobs.',
    actionPath: '/portal/pipeline',
  },
  {
    type: 'candidate_message',
    label: 'Candidate message',
    description: 'A candidate sent you a message.',
    actionPath: '/portal/messages',
  },
  {
    type: 'interview_accepted',
    label: 'Interview accepted',
    description: 'A candidate accepted an interview invitation.',
    actionPath: '/portal/pipeline',
  },
  {
    type: 'interview_cancelled',
    label: 'Interview cancelled',
    description: 'An interview was cancelled.',
    actionPath: '/portal/pipeline',
  },
  {
    type: 'candidate_withdrew',
    label: 'Candidate withdrew',
    description: 'A candidate withdrew their application.',
    actionPath: '/portal/pipeline',
  },
  {
    type: 'job_expired',
    label: 'Job expired',
    description: 'A job posting has expired and needs action.',
    actionPath: '/portal/jobs',
  },
];
