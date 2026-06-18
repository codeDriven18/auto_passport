import { Link } from 'react-router-dom';
import { EmployerPageHeader } from '@/components/employer/EmployerPageHeader';
import { INTERVIEW_PHASE_LABELS, PIPELINE_COLUMNS } from '@/lib/employer/pipelineArchitecture';
import styles from './PortalWorkspacePage.module.css';

export function PortalPipelinePage() {
  return (
    <section className={styles.page}>
      <EmployerPageHeader
        title="Hiring pipeline"
        subtitle="Manage candidates across Applied → Reviewing → Shortlisted → Interview → Offer → Hired → Rejected."
      />

      <div className={styles.placeholder}>
        <p className={styles.placeholderText}>
          The kanban board ships in the next phase. Architecture is reserved for seven columns with
          interview sub-states ({INTERVIEW_PHASE_LABELS.requested},{' '}
          {INTERVIEW_PHASE_LABELS.scheduled},{' '}
          {INTERVIEW_PHASE_LABELS.completed}) and calendar-ready scheduling fields.
        </p>

        <div className={styles.pipelinePreview} aria-hidden>
          {PIPELINE_COLUMNS.map((column) => (
            <span key={column.id} className={styles.pipelineColumnChip}>
              {column.label}
            </span>
          ))}
        </div>

        <Link to="/portal/applications" className={styles.cta}>
          View candidates list
        </Link>
      </div>
    </section>
  );
}
