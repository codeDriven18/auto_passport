import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCamera } from '@/components/icons/Icons';
import { ProfileCoverHero } from '@/components/profile/ProfileCoverHero';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import styles from './CoverUploader.module.css';

const MAX_BYTES = 512 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const CROP_WIDTH = 1200;
const CROP_HEIGHT = 600;
const FRAME_W = 320;
const FRAME_H = 160;

interface CoverUploaderProps {
  bannerUrl?: string;
  uploading?: boolean;
  uploadProgress?: number;
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  children?: ReactNode;
}

interface CropState {
  src: string;
  fileName: string;
  naturalWidth: number;
  naturalHeight: number;
  offsetX: number;
  offsetY: number;
  displayScale: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function exportCroppedImage(crop: CropState): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = crop.src;
  });

  const frameW = CROP_WIDTH;
  const frameH = CROP_HEIGHT;
  const scaleX = frameW / FRAME_W;
  const scaleY = frameH / FRAME_H;
  const scale = crop.displayScale;
  const drawW = image.naturalWidth * scale * scaleX;
  const drawH = image.naturalHeight * scale * scaleY;
  const left = frameW / 2 + crop.offsetX * scaleX - drawW / 2;
  const top = frameH / 2 + crop.offsetY * scaleY - drawH / 2;

  const canvas = document.createElement('canvas');
  canvas.width = frameW;
  canvas.height = frameH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.drawImage(image, left, top, drawW, drawH);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.84),
  );
  if (!blob) throw new Error('Export failed');
  if (blob.size > MAX_BYTES) {
    const smaller = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.72),
    );
    if (!smaller) throw new Error('Image is too large');
    return new File([smaller], crop.fileName.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
  }

  return new File([blob], crop.fileName.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

function buildCropState(file: File, objectUrl: string, image: HTMLImageElement): CropState {
  const displayScale = Math.max(FRAME_W / image.naturalWidth, FRAME_H / image.naturalHeight);

  return {
    src: objectUrl,
    fileName: file.name,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    offsetX: 0,
    offsetY: 0,
    displayScale,
  };
}

function dragBounds(crop: CropState) {
  const drawW = crop.naturalWidth * crop.displayScale;
  const drawH = crop.naturalHeight * crop.displayScale;
  const maxX = Math.max(0, (drawW - FRAME_W) / 2);
  const maxY = Math.max(0, (drawH - FRAME_H) / 2);
  return { maxX, maxY };
}

export function CoverUploader({
  bannerUrl,
  uploading = false,
  uploadProgress = 0,
  onUpload,
  disabled = false,
  children,
}: CoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [crop, setCrop] = useState<CropState | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const closeCrop = useCallback(() => {
    if (crop?.src.startsWith('blob:')) URL.revokeObjectURL(crop.src);
    setCrop(null);
    setLocalError(null);
  }, [crop]);

  useEffect(() => () => {
    if (crop?.src.startsWith('blob:')) URL.revokeObjectURL(crop.src);
  }, [crop]);

  const openFile = (file: File) => {
    setLocalError(null);
    if (!ALLOWED_TYPES.has(file.type)) {
      setLocalError('Use JPEG, PNG, WebP, or GIF.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setCrop(buildCropState(file, objectUrl, image));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setLocalError('Could not load image.');
    };
    image.src = objectUrl;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!crop) return;
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      ox: crop.offsetX,
      oy: crop.offsetY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!crop || !dragStart.current) return;
    const { maxX, maxY } = dragBounds(crop);
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setCrop({
      ...crop,
      offsetX: clamp(dragStart.current.ox + dx, -maxX, maxX),
      offsetY: clamp(dragStart.current.oy + dy, -maxY, maxY),
    });
  };

  const onPointerUp = () => {
    dragStart.current = null;
  };

  const saveCrop = async () => {
    if (!crop) return;
    setSaving(true);
    setLocalError(null);
    try {
      const file = await exportCroppedImage(crop);
      if (file.size > MAX_BYTES) {
        setLocalError('Image is too large. Choose a smaller photo.');
        return;
      }
      closeCrop();
      await onUpload(file);
    } catch {
      setLocalError('Upload failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const resolvedBanner = resolveMediaUrl(bannerUrl);

  return (
    <>
      <ProfileCoverHero
        bannerUrl={resolvedBanner}
        coverActions={!disabled ? (
          <button
            type="button"
            className={styles.changeBtn}
            onClick={() => inputRef.current?.click()}
            disabled={uploading || saving}
          >
            <IconCamera size={15} />
            Change Cover
          </button>
        ) : undefined}
        coverFooter={uploading ? (
          <div className={styles.progress} aria-hidden>
            <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} />
          </div>
        ) : undefined}
      >
        {children}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) openFile(file);
            e.target.value = '';
          }}
        />
      </ProfileCoverHero>

      <AnimatePresence>
        {crop && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal
            aria-label="Adjust cover position"
          >
            <motion.div
              className={styles.dialog}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
            >
              <h3 className={styles.dialogTitle}>Position cover</h3>
              <p className={styles.dialogHint}>Drag to adjust how your cover appears.</p>

              <div
                className={styles.cropFrame}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <img
                  src={crop.src}
                  alt=""
                  className={styles.cropImage}
                  draggable={false}
                  style={{
                    width: crop.naturalWidth * crop.displayScale,
                    height: crop.naturalHeight * crop.displayScale,
                    transform: `translate(calc(-50% + ${crop.offsetX}px), calc(-50% + ${crop.offsetY}px))`,
                  }}
                />
              </div>

              {localError && <p className={styles.error}>{localError}</p>}

              <div className={styles.dialogActions}>
                <button type="button" className={styles.btnGhost} onClick={closeCrop} disabled={saving}>
                  Cancel
                </button>
                <button type="button" className={styles.btnPrimary} onClick={() => void saveCrop()} disabled={saving}>
                  {saving ? 'Saving…' : 'Save cover'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
