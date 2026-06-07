import { ApplicationStatus, ApplicationStatusLabels } from '@/models/enums';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusClass: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: styles.pending,
  [ApplicationStatus.Submitted]: styles.submitted,
  [ApplicationStatus.UnderReview]: styles.review,
  [ApplicationStatus.Accepted]: styles.accepted,
  [ApplicationStatus.Rejected]: styles.rejected,
  [ApplicationStatus.Withdrawn]: styles.withdrawn,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${statusClass[status]}`}>
      {ApplicationStatusLabels[status]}
    </span>
  );
}
