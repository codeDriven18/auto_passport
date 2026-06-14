import { useState } from 'react';
import { CompanyInitial } from '@/components/jobs/CompanyInitial';
import styles from './CompanyLogo.module.css';

interface CompanyLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'swipe' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function CompanyLogo({ name, logoUrl, size = 'md', className = '' }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl?.trim()) && !failed;

  if (!showImage) {
    return <CompanyInitial name={name} size={size} className={className} />;
  }

  return (
    <span className={`${styles.frame} ${styles[size]} ${className}`}>
      <img
        src={logoUrl!}
        alt=""
        className={styles.image}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
