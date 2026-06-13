import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getJobShareUrl } from '@/lib/shareUrls';
import type { Job } from '@/models/job';
import styles from './JobShareMenu.module.css';

interface JobShareMenuProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

export function JobShareMenu({ job, open, onClose }: JobShareMenuProps) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const url = getJobShareUrl(job.id);
  const text = `${job.title} at ${job.company}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onPointer = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, [open, onClose]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [url]);

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url });
        onClose();
      } catch {
        /* cancelled */
      }
    }
  }, [text, url, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} role="presentation">
      <div ref={panelRef} className={styles.sheet} role="dialog" aria-label="Share job">
        <div className={styles.handle} aria-hidden />
        <h3 className={styles.title}>Share opportunity</h3>
        <p className={styles.subtitle}>{job.title}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={() => void copyLink()}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <a
            className={styles.action}
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            Telegram
          </a>
          <a
            className={styles.action}
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            WhatsApp
          </a>
          <a
            className={styles.action}
            href={`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`}
            onClick={onClose}
          >
            Email
          </a>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button type="button" className={styles.actionPrimary} onClick={() => void shareNative()}>
              Share…
            </button>
          )}
        </div>
        <button type="button" className={styles.cancel} onClick={onClose}>Cancel</button>
      </div>
    </div>,
    document.body,
  );
}
