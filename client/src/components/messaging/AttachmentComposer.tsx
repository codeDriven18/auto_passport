import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IconFile, IconX } from '@/components/icons/Icons';
import { formatFileSize, isImageFile } from '@/lib/messaging/chatMessages';
import styles from './AttachmentComposer.module.css';

export interface PendingAttachment {
  id: string;
  file: File;
  previewUrl?: string;
}

interface AttachmentComposerProps {
  open: boolean;
  items: PendingAttachment[];
  caption: string;
  sending: boolean;
  onCaptionChange: (value: string) => void;
  onRemove: (id: string) => void;
  onCancel: () => void;
  onSend: () => void;
}

export function createPendingAttachment(file: File): PendingAttachment {
  const isImage = isImageFile(file);
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: isImage ? URL.createObjectURL(file) : undefined,
  };
}

export function revokePendingAttachment(item: PendingAttachment) {
  if (item.previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(item.previewUrl);
  }
}

export function revokeAllPending(items: PendingAttachment[]) {
  items.forEach(revokePendingAttachment);
}

export function AttachmentComposer({
  open,
  items,
  caption,
  sending,
  onCaptionChange,
  onRemove,
  onCancel,
  onSend,
}: AttachmentComposerProps) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  const handleTransitionEnd = useCallback(() => {
    if (!open) setMounted(false);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={[styles.overlay, open ? styles.overlayOpen : ''].filter(Boolean).join(' ')}
      role="presentation"
      onClick={onCancel}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className={[styles.sheet, open ? styles.sheetOpen : ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Review attachment before sending"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>Send attachment</h2>
          <button type="button" className={styles.closeBtn} onClick={onCancel} aria-label="Cancel">
            <IconX size={20} />
          </button>
        </header>

        <div className={styles.previews}>
          {items.map((item) => (
            <div key={item.id} className={styles.previewItem}>
              {item.previewUrl ? (
                <img src={item.previewUrl} alt="" className={styles.previewImage} />
              ) : (
                <div className={styles.filePreview}>
                  <IconFile size={28} />
                  <span className={styles.fileName}>{item.file.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(item.file.size)}</span>
                </div>
              )}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.file.name}`}
                disabled={sending}
              >
                <IconX size={14} />
              </button>
            </div>
          ))}
        </div>

        <label className={styles.captionLabel}>
          Caption
          <textarea
            className={styles.captionInput}
            rows={2}
            placeholder="Add a message (optional)"
            value={caption}
            disabled={sending}
            onChange={(e) => onCaptionChange(e.target.value)}
          />
        </label>

        <footer className={styles.footer}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={sending}>
            Cancel
          </Button>
          <Button type="button" onClick={onSend} loading={sending} disabled={items.length === 0 || sending}>
            Send
          </Button>
        </footer>
      </div>
    </div>
  );
}
