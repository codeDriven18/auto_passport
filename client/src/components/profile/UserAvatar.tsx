import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { getProfileDisplayName, getProfileInitials, type UserProfile } from '@/models/userProfile';
import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  profile?: Pick<UserProfile, 'firstName' | 'lastName' | 'email' | 'profileImageUrl'> | null;
  size?: 'sm' | 'md' | 'lg' | 'hub' | 'xl';
  className?: string;
}

const sizeClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  hub: styles.hub,
  xl: styles.xl,
} as const;

export function UserAvatar({ profile, size = 'md', className = '' }: UserAvatarProps) {
  const initials = getProfileInitials(profile);
  const alt = getProfileDisplayName(profile) || 'User avatar';
  const imageSrc = resolveMediaUrl(profile?.profileImageUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [profile?.profileImageUrl]);

  if (imageSrc && !imageError) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={`${styles.avatar} ${sizeClass[size]} ${className}`.trim()}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <span
      className={`${styles.avatar} ${styles.fallback} ${sizeClass[size]} ${className}`.trim()}
      aria-label={alt}
      role="img"
    >
      {initials}
    </span>
  );
}
