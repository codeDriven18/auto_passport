import { ApplicationStatus } from '@/models/enums';

/** Kanban column identifiers — canonical employer pipeline model. */
export type PipelineColumnId =
  | 'applied'
  | 'reviewing'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

/** Sub-state within the Interview column (calendar/scheduling ready). */
export type InterviewPhase = 'none' | 'requested' | 'scheduled' | 'completed';

export interface PipelineColumnDefinition {
  id: PipelineColumnId;
  label: string;
  /** Application statuses grouped into this column */
  statuses: ApplicationStatus[];
  /** Interview sub-phases shown inside the Interview column */
  interviewPhases?: InterviewPhase[];
}

export const PIPELINE_COLUMNS: PipelineColumnDefinition[] = [
  {
    id: 'applied',
    label: 'Applied',
    statuses: [ApplicationStatus.Pending, ApplicationStatus.Applied],
  },
  {
    id: 'reviewing',
    label: 'Reviewing',
    statuses: [ApplicationStatus.UnderReview],
  },
  {
    id: 'shortlisted',
    label: 'Shortlisted',
    statuses: [ApplicationStatus.Shortlisted],
  },
  {
    id: 'interview',
    label: 'Interview',
    statuses: [ApplicationStatus.InterviewInvited, ApplicationStatus.Interviewing],
    interviewPhases: ['requested', 'scheduled', 'completed'],
  },
  {
    id: 'offer',
    label: 'Offer',
    statuses: [ApplicationStatus.OfferSent],
  },
  {
    id: 'hired',
    label: 'Hired',
    statuses: [ApplicationStatus.Hired],
  },
  {
    id: 'rejected',
    label: 'Rejected',
    statuses: [ApplicationStatus.Rejected, ApplicationStatus.Withdrawn],
  },
];

export const INTERVIEW_PHASE_LABELS: Record<InterviewPhase, string> = {
  none: 'Interview',
  requested: 'Interview requested',
  scheduled: 'Interview scheduled',
  completed: 'Interview completed',
};

export function resolvePipelineColumn(status: ApplicationStatus): PipelineColumnId {
  const match = PIPELINE_COLUMNS.find((column) => column.statuses.includes(status));
  return match?.id ?? 'applied';
}
