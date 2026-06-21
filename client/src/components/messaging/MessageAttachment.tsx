import { useMessageAttachmentUrl } from '@/hooks/useMessageAttachmentUrl';
import { IconFile } from '@/components/icons/Icons';
import type { ChatMessage } from '@/models/messaging';
import styles from './ChatView.module.css';

interface MessageAttachmentProps {
  message: ChatMessage;
  conversationId: string;
  downloadAttachment?: (conversationId: string, messageId: string) => Promise<Blob>;
  onExpandImage: (src: string) => void;
  onDownload: (message: ChatMessage) => void;
}

export function MessageAttachment({
  message,
  conversationId,
  downloadAttachment,
  onExpandImage,
  onDownload,
}: MessageAttachmentProps) {
  const { src, isImage, loading } = useMessageAttachmentUrl({
    attachmentUrl: message.attachmentUrl,
    attachmentContentType: message.attachmentContentType,
    attachmentFileName: message.attachmentFileName,
    conversationId,
    messageId: message.id,
    downloadAttachment,
  });

  if (!message.attachmentUrl) return null;

  if (isImage) {
    if (loading) {
      return <span className={styles.imageLoading}>Loading image…</span>;
    }
    if (src) {
      return (
        <button
          type="button"
          className={styles.imageAttachment}
          onClick={() => onExpandImage(src)}
          aria-label={`View image ${message.attachmentFileName ?? ''}`.trim()}
        >
          <img src={src} alt={message.attachmentFileName ?? 'Shared image'} className={styles.imagePreview} />
        </button>
      );
    }
  }

  return (
    <button
      type="button"
      className={styles.fileCard}
      onClick={() => void onDownload(message)}
    >
      <span className={styles.fileIcon} aria-hidden>
        <IconFile size={22} />
      </span>
      <span className={styles.fileMeta}>
        <span className={styles.fileName}>
          {message.attachmentFileName ?? 'Download file'}
        </span>
      </span>
    </button>
  );
}
