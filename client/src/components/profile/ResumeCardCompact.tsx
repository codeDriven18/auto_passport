import { useRef } from 'react';
import { IconFile } from '@/components/icons/Icons';
import styles from './ResumeCardCompact.module.css';

interface ResumeCardCompactProps {
  fileName?: string;
  uploadedAt?: string;
  busy?: boolean;
  onReplace: (file: File) => void;
  onPreview: () => void;
  onDelete: () => void;
}

function formatUpdatedLabel(uploadedAt?: string): string {
  if (!uploadedAt) return 'Recently uploaded';
  const diffMs = Date.now() - new Date(uploadedAt).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated 1 day ago';
  return `Updated ${days} days ago`;
}

export function ResumeCardCompact({
  fileName,
  uploadedAt,
  busy = false,
  onReplace,
  onPreview,
  onDelete,
}: ResumeCardCompactProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasResume = Boolean(fileName);

  return (
    <section className={styles.card} aria-label="Resume">
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden>
          <IconFile size={18} />
        </span>
        <div className={styles.meta}>
          <p className={styles.title}>Resume</p>
          {hasResume ? (
            <>
              <span className={styles.fileName}>{fileName}</span>
              <p className={styles.updated}>{formatUpdatedLabel(uploadedAt)}</p>
            </>
          ) : (
            <p className={styles.emptyText}>Upload a resume for Quick Apply.</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btn}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {hasResume ? 'Replace' : 'Upload'}
        </button>
        {hasResume && (
          <>
            <button type="button" className={styles.btnGhost} disabled={busy} onClick={onPreview}>
              Preview
            </button>
            <button type="button" className={styles.btnDanger} disabled={busy} onClick={onDelete}>
              Delete
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className={styles.uploadInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onReplace(file);
          e.target.value = '';
        }}
      />
    </section>
  );
}
