import { useEffect, useState, type ReactNode } from 'react';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import styles from './ProfileCoverHero.module.css';

interface ProfileCoverHeroProps {
  bannerUrl?: string | null;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'portal' | 'compact';
  coverActions?: ReactNode;
  coverFooter?: ReactNode;
}

export function ProfileCoverHero({
  bannerUrl,
  children,
  className = '',
  variant = 'default',
  coverActions,
  coverFooter,
}: ProfileCoverHeroProps) {
  const resolved = resolveMediaUrl(bannerUrl);
  const [bannerError, setBannerError] = useState(false);

  useEffect(() => {
    setBannerError(false);
  }, [resolved]);

  const rootClass = [
    styles.hero,
    variant === 'portal' ? styles.heroPortal : '',
    variant === 'compact' ? styles.heroCompact : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <header className={rootClass}>
      <div className={styles.cover} aria-hidden={!resolved}>
        {resolved && !bannerError && (
          <img
            src={resolved}
            alt=""
            className={styles.coverImg}
            onError={() => setBannerError(true)}
          />
        )}
        <div className={styles.coverShade} aria-hidden />
        <div className={styles.coverFade} aria-hidden />
        {coverActions && <div className={styles.coverActions}>{coverActions}</div>}
        {coverFooter && <div className={styles.coverFooter}>{coverFooter}</div>}
      </div>
      <div className={styles.content}>{children}</div>
    </header>
  );
}
