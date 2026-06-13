import { useEffect, useState } from 'react';
import type { ResolvedJobImage } from '@/lib/resolveJobImage';
import styles from './JobHeroImage.module.css';

interface JobHeroImageProps {
  image: ResolvedJobImage;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function JobHeroImage({ image, alt, className = '', priority = false }: JobHeroImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(image.url);

  useEffect(() => {
    setLoaded(false);
    setSrc(image.url);
  }, [image.url]);

  const categoryFallback = `/job-images/${image.theme === 'gig' ? 'default' : image.theme}.svg`;

  return (
    <div className={`${styles.wrap} ${className}`} style={{ background: image.gradient }}>
      {!loaded && <div className={styles.skeleton} aria-hidden />}
      <img
        src={src}
        alt={alt}
        className={`${styles.img} ${loaded ? styles.visible : ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (src !== categoryFallback) {
            setSrc(categoryFallback);
            setLoaded(false);
          }
        }}
      />
      <div className={styles.fade} aria-hidden />
    </div>
  );
}
