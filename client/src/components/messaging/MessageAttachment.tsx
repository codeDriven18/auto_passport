import { useMessageAttachmentUrl } from '@/hooks/useMessageAttachmentUrl';
import { IconFile } from '@/components/icons/Icons';
import { formatFileSize } from '@/lib/messaging/chatMessages';
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
  const isUploading = message.uploadStatus === 'uploading';
  const isFailed = message.uploadStatus === 'failed';
  const hasServerAttachment = Boolean(message.attachmentUrl);

  const { src: resolvedSrc, isImage, loading } = useMessageAttachmentUrl({
    attachmentUrl: hasServerAttachment ? message.attachmentUrl : undefined,
    attachmentContentType: message.attachmentContentType,
    attachmentFileName: message.attachmentFileName,
    conversationId,
    messageId: message.id,
    downloadAttachment: hasServerAttachment ? downloadAttachment : undefined,
  });

  const previewSrc = message.localPreviewUrl ?? resolvedSrc;
  const showAsImage = isImage || Boolean(message.localPreviewUrl);

  if (!hasServerAttachment && !message.localPreviewUrl && !isFailed) return null;

  if (showAsImage) {
    if (loading && !message.localPreviewUrl) {
      return <span className={styles.imageLoading}>Loading image…</span>;
    }
    if (previewSrc) {
      return (
        <div className={styles.imageAttachmentWrap}>
          <button
            type="button"
            className={styles.imageAttachment}
            onClick={() => !isUploading && onExpandImage(previewSrc)}
            disabled={isUploading}
            aria-label={`View image ${message.attachmentFileName ?? ''}`.trim()}
          >
            <img src={previewSrc} alt={message.attachmentFileName ?? 'Shared image'} className={styles.imagePreview} />
            {isUploading && <span className={styles.uploadOverlay} aria-hidden>Uploading…</span>}
          </button>
        </div>
      );
    }
  }

  const fileName = message.attachmentFileName ?? 'Attachment';
  const fileSize = message.attachmentFileSize ? formatFileSize(message.attachmentFileSize) : undefined;

  return (
    <div className={[styles.fileCardWrap, isUploading ? styles.fileCardUploading : ''].filter(Boolean).join(' ')}>
      <div className={styles.fileCard}>
        <span className={styles.fileIcon} aria-hidden>
          <IconFile size={22} />
        </span>
        <span className={styles.fileMeta}>
          <span className={styles.fileName}>{fileName}</span>
          {fileSize && <span className={styles.fileSize}>{fileSize}</span>}
          {isUploading && <span className={styles.fileUploading}>Uploading…</span>}
          {isFailed && <span className={styles.fileFailed}>Upload failed</span>}
        </span>
        {!isUploading && hasServerAttachment && (
          <button
            type="button"
            className={styles.fileDownloadBtn}
            onClick={() => void onDownload(message)}
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
}
