import { ApplicationStatus, ApplicationStatusLabels } from '@/models/enums';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: ApplicationStatus;
  compact?: boolean;
}

const statusClass: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: styles.pending,
  [ApplicationStatus.Applied]: styles.applied,
  [ApplicationStatus.UnderReview]: styles.review,
  [ApplicationStatus.Shortlisted]: styles.shortlisted,
  [ApplicationStatus.InterviewInvited]: styles.interview,
  [ApplicationStatus.Interviewing]: styles.interview,
  [ApplicationStatus.OfferSent]: styles.offer,
  [ApplicationStatus.Hired]: styles.hired,
  [ApplicationStatus.Rejected]: styles.rejected,
  [ApplicationStatus.Withdrawn]: styles.withdrawn,
};

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${compact ? styles.compact : ''} ${statusClass[status]}`}>
      {ApplicationStatusLabels[status]}
    </span>
  );
}
