import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconMapPin, IconShare, IconVerified } from '@/components/icons/Icons';
import { CoverUploader } from '@/components/profile/CoverUploader';
import { UserAvatar } from '@/components/profile/UserAvatar';
import type { UserProfile } from '@/models/userProfile';
import { formatJobSeekingStatus } from '@/lib/jobSeekingStatus';
import styles from './ProfileHeader.module.css';

interface ProfileHeaderProps {
  profile: UserProfile;
  displayName: string;
  verified: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  onEdit: () => void;
  onShare?: () => void;
  onBannerUpload: (file: File) => Promise<void>;
}

export function ProfileHeader({
  profile,
  displayName,
  verified,
  uploading = false,
  uploadProgress = 0,
  onEdit,
  onShare,
  onBannerUpload,
}: ProfileHeaderProps) {
  const role = profile.headline?.trim() || 'Add your role or headline';
  const location = profile.location?.trim() || 'Add location';
  const seekingStatus = formatJobSeekingStatus(profile.jobSeekingStatus);

  return (
    <header className={styles.header}>
      <CoverUploader
        bannerUrl={profile.bannerUrl}
        uploading={uploading}
        uploadProgress={uploadProgress}
        onUpload={onBannerUpload}
      />

      <div className={styles.identity}>
        <div className={styles.avatarWrap}>
          <motion.div
            className={styles.avatarButton}
            whileTap={{ scale: 0.97 }}
          >
            <Link to="/profile/info" aria-label="Edit profile photo">
              <UserAvatar profile={profile} size="hub" className={styles.avatarRing} />
            </Link>
          </motion.div>
        </div>

        <div className={styles.body}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{displayName}</h1>
            {verified && (
              <span className={styles.verified}>
                <IconVerified size={12} />
                Verified
              </span>
            )}
          </div>

          <p className={styles.role}>{role}</p>

          <p className={styles.seekingStatus}>{seekingStatus}</p>

          <p className={styles.location}>
            <IconMapPin size={14} />
            <span>{location}</span>
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.editBtn} onClick={onEdit}>
              Edit Profile
            </button>
            {onShare && (
              <button type="button" className={styles.shareBtn} onClick={onShare} aria-label="Share profile">
                <IconShare size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
