import { useEffect, useState } from 'react';
import { isImageMimeType, resolveMediaUrl } from '@/lib/mediaUrl';

interface UseMessageAttachmentUrlOptions {
  attachmentUrl?: string | null;
  attachmentContentType?: string | null;
  attachmentFileName?: string | null;
  conversationId: string;
  messageId: string;
  downloadAttachment?: (conversationId: string, messageId: string) => Promise<Blob>;
}

/** Resolve a display URL for chat attachments — public URLs directly, private keys via download API. */
export function useMessageAttachmentUrl({
  attachmentUrl,
  attachmentContentType,
  attachmentFileName,
  conversationId,
  messageId,
  downloadAttachment,
}: UseMessageAttachmentUrlOptions): { src?: string; isImage: boolean; loading: boolean } {
  const isImage = isImageMimeType(attachmentContentType, attachmentFileName);
  const direct = resolveMediaUrl(attachmentUrl);
  const needsAuth = Boolean(
    attachmentUrl
    && isImage
    && downloadAttachment
    && !direct,
  );

  const [blobSrc, setBlobSrc] = useState<string | undefined>();
  const [loading, setLoading] = useState(needsAuth);

  useEffect(() => {
    if (!needsAuth || !downloadAttachment) {
      setBlobSrc(undefined);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void downloadAttachment(conversationId, messageId)
      .then((blob) => {
        if (cancelled) return;
        setBlobSrc(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (!cancelled) setBlobSrc(undefined);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      setBlobSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return undefined;
      });
    };
  }, [needsAuth, downloadAttachment, conversationId, messageId, attachmentUrl]);

  const src = direct ?? blobSrc;

  return { src, isImage, loading: needsAuth && loading };
}
