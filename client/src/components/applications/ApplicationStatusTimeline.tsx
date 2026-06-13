import { ApplicationStatus, ApplicationStatusLabels } from '@/models/enums';
import type { ApplicationStatusHistoryEntry } from '@/models/application';
import styles from './ApplicationStatusTimeline.module.css';

const TIMELINE_STEPS: ApplicationStatus[] = [
  ApplicationStatus.Submitted,
  ApplicationStatus.UnderReview,
  ApplicationStatus.Accepted,
];

interface ApplicationStatusTimelineProps {
  currentStatus: ApplicationStatus;
  statusHistory: ApplicationStatusHistoryEntry[];
  appliedAt: string;
}

function formatStepDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function resolveSteps(
  currentStatus: ApplicationStatus,
  statusHistory: ApplicationStatusHistoryEntry[],
  appliedAt: string,
): { status: ApplicationStatus; label: string; date?: string; state: 'done' | 'current' | 'pending' | 'rejected' | 'withdrawn' }[] {
  const historyByStatus = new Map<ApplicationStatus, string>();
  for (const entry of [...statusHistory].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
  )) {
    historyByStatus.set(entry.status, entry.changedAt);
  }
  if (!historyByStatus.has(ApplicationStatus.Submitted)) {
    historyByStatus.set(ApplicationStatus.Submitted, appliedAt);
  }

  if (currentStatus === ApplicationStatus.Rejected) {
    return [
      {
        status: ApplicationStatus.Submitted,
        label: ApplicationStatusLabels[ApplicationStatus.Submitted],
        date: historyByStatus.get(ApplicationStatus.Submitted),
        state: 'done',
      },
      {
        status: ApplicationStatus.UnderReview,
        label: ApplicationStatusLabels[ApplicationStatus.UnderReview],
        date: historyByStatus.get(ApplicationStatus.UnderReview),
        state: historyByStatus.has(ApplicationStatus.UnderReview) ? 'done' : 'pending',
      },
      {
        status: ApplicationStatus.Rejected,
        label: ApplicationStatusLabels[ApplicationStatus.Rejected],
        date: historyByStatus.get(ApplicationStatus.Rejected),
        state: 'rejected',
      },
    ];
  }

  if (currentStatus === ApplicationStatus.Withdrawn) {
    return [
      {
        status: ApplicationStatus.Submitted,
        label: ApplicationStatusLabels[ApplicationStatus.Submitted],
        date: historyByStatus.get(ApplicationStatus.Submitted),
        state: 'done',
      },
      {
        status: ApplicationStatus.Withdrawn,
        label: ApplicationStatusLabels[ApplicationStatus.Withdrawn],
        date: historyByStatus.get(ApplicationStatus.Withdrawn),
        state: 'withdrawn',
      },
    ];
  }

  const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;

  return TIMELINE_STEPS.map((status, index) => {
    let state: 'done' | 'current' | 'pending';
    if (index < effectiveIndex) state = 'done';
    else if (index === effectiveIndex) state = 'current';
    else state = 'pending';

    return {
      status,
      label: ApplicationStatusLabels[status],
      date: historyByStatus.get(status),
      state,
    };
  });
}

export function ApplicationStatusTimeline({
  currentStatus,
  statusHistory,
  appliedAt,
}: ApplicationStatusTimelineProps) {
  const normalizedStatus = currentStatus === ApplicationStatus.Pending
    ? ApplicationStatus.Submitted
    : currentStatus;
  const steps = resolveSteps(normalizedStatus, statusHistory, appliedAt);

  return (
    <ol className={styles.timeline} aria-label="Application status">
      {steps.map((step, index) => (
        <li
          key={`${step.status}-${index}`}
          className={`${styles.step} ${styles[step.state]}`}
        >
          <span className={styles.dot} aria-hidden />
          <div className={styles.stepBody}>
            <span className={styles.label}>{step.label}</span>
            {step.date && <span className={styles.date}>{formatStepDate(step.date)}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
