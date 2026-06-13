import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getProfileShareUrl } from '@/lib/shareUrls';
import styles from '@/components/jobs/JobShareMenu.module.css';

interface ProfileShareMenuProps {
  profileId: string;
  displayName: string;
  open: boolean;
  onClose: () => void;
}

export function ProfileShareMenu({ profileId, displayName, open, onClose }: ProfileShareMenuProps) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const url = getProfileShareUrl(profileId);
  const text = `${displayName} on SwipeJobs`;

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
      <div ref={panelRef} className={styles.sheet} role="dialog" aria-label="Share profile">
        <div className={styles.handle} aria-hidden />
        <h3 className={styles.title}>Share profile</h3>
        <p className={styles.subtitle}>{displayName}</p>
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
