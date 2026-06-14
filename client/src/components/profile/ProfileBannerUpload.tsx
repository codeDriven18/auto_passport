import { useCallback, useRef, useState, type DragEvent } from 'react';
import styles from './ProfileBannerUpload.module.css';

const MAX_BYTES = 512 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

interface ProfileBannerUploadProps {
  bannerUrl?: string;
  uploading: boolean;
  uploadProgress: number;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}

async function compressBanner(file: File): Promise<File> {
  if (file.size <= MAX_BYTES || !file.type.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const maxHeight = 600;
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.82),
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

export function ProfileBannerUpload({
  bannerUrl,
  uploading,
  uploadProgress,
  onUpload,
  onRemove,
}: ProfileBannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayUrl = previewUrl ?? bannerUrl;

  const validateAndUpload = useCallback(async (file: File) => {
    setLocalError(null);
    if (!ALLOWED_TYPES.has(file.type)) {
      setLocalError('Use JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > MAX_BYTES * 4) {
      setLocalError('Image is too large. Max 512 KB after compression.');
      return;
    }

    const compressed = await compressBanner(file);
    if (compressed.size > MAX_BYTES) {
      setLocalError('Image is too large. Choose a smaller photo.');
      return;
    }

    const preview = URL.createObjectURL(compressed);
    setPreviewUrl(preview);
    try {
      await onUpload(compressed);
    } finally {
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
    }
  }, [onUpload]);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void validateAndUpload(file);
  };

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.preview} ${displayUrl ? styles.previewHasImage : ''} ${dragOver ? styles.dragOver : ''}`}
        style={displayUrl ? { backgroundImage: `url(${displayUrl})` } : undefined}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => inputRef.current?.click()}
        aria-label="Profile background image"
      >
        {uploading && (
          <div className={styles.progressOverlay} aria-hidden="true">
            {uploadProgress}%
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btn}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {bannerUrl ? 'Change background' : 'Upload background'}
        </button>
        {bannerUrl && (
          <button
            type="button"
            className={styles.btnGhost}
            disabled={uploading}
            onClick={() => void onRemove()}
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void validateAndUpload(file);
          e.target.value = '';
        }}
      />

      <p className={styles.hint}>Wide cover image for your profile header. Max 512 KB.</p>
      {localError && <p className={styles.error}>{localError}</p>}
    </div>
  );
}
