import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { downloadProfileResume } from '@/api/profileUploadApi';
import { applicationsApi } from '@/api/applicationsApi';
import { savedJobsApi } from '@/api/savedJobsApi';
import {
  IconBriefcase,
  IconChevronRight,
  IconFileText,
  IconGraduation,
  IconLink,
  IconLogOut,
  IconSettings,
  IconSpark,
  IconUser,
} from '@/components/icons/Icons';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileMenuItem, ProfileMenuList } from '@/components/profile/ProfileMenuItem';
import { ProfileShareMenu } from '@/components/profile/ProfileShareMenu';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ResumeCardCompact } from '@/components/profile/ResumeCardCompact';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useProfile } from '@/hooks/useProfile';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { isProfileSubstantiallyComplete, shouldShowMandatoryCompletionPrompts } from '@/lib/profileCompletion';
import { markProfileSubstantiallyComplete } from '@/lib/profileCompletionStorage';
import { isVerifiedCandidate } from '@/lib/verification';
import { getProfileDisplayName } from '@/models/userProfile';
import styles from './ProfileHubPage.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } },
};

function buildInfoSummary(bio?: string, experienceCount = 0, skillCount = 0): string {
  const parts: string[] = [];
  if (bio?.trim()) parts.push('About added');
  if (experienceCount > 0) parts.push(`${experienceCount} role${experienceCount === 1 ? '' : 's'}`);
  if (skillCount > 0) parts.push(`${skillCount} skill${skillCount === 1 ? '' : 's'}`);
  return parts.join(' · ') || 'Photo, about, experience, skills';
}

function buildPortfolioSummary(linkedIn?: string, gitHub?: string, website?: string): string {
  const count = [linkedIn, gitHub, website].filter(Boolean).length;
  if (count === 0) return 'Add LinkedIn, GitHub, or website';
  return `${count} link${count === 1 ? '' : 's'} added`;
}

export function ProfileHubPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    profile,
    loading,
    uploadBanner,
    uploadResume,
    removeResume,
  } = useProfile();

  const [applicationsCount, setApplicationsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [bannerProgress, setBannerProgress] = useState(0);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);

  useEffect(() => {
    if (profile && isProfileSubstantiallyComplete(profile)) {
      markProfileSubstantiallyComplete();
    }
  }, [profile]);

  useEffect(() => {
    applicationsApi.getMine()
      .then((apps) => setApplicationsCount(apps.length))
      .catch(() => setApplicationsCount(0));
    savedJobsApi.getMine()
      .then((saved) => setSavedCount(saved.length))
      .catch(() => setSavedCount(0));
  }, []);

  const verified = useMemo(() => (profile ? isVerifiedCandidate(profile) : false), [profile]);
  const showCompletionBar = profile ? shouldShowMandatoryCompletionPrompts(profile) : false;

  const handleBannerUpload = useCallback(async (file: File) => {
    setBannerUploading(true);
    setBannerProgress(0);
    try {
      await uploadBanner(file, setBannerProgress);
      showToast('Cover updated', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Cover upload failed'), 'error');
    } finally {
      setBannerUploading(false);
      setBannerProgress(0);
    }
  }, [showToast, uploadBanner]);

  const handleResumeReplace = useCallback(async (file: File) => {
    setResumeBusy(true);
    try {
      await uploadResume(file);
      showToast('Resume uploaded', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Resume upload failed'), 'error');
    } finally {
      setResumeBusy(false);
    }
  }, [showToast, uploadResume]);

  const handleResumeDelete = useCallback(async () => {
    setResumeBusy(true);
    try {
      await removeResume();
      showToast('Resume removed', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not remove resume'), 'error');
    } finally {
      setResumeBusy(false);
    }
  }, [removeResume, showToast]);

  const handleResumePreview = useCallback(async () => {
    setResumeBusy(true);
    try {
      const blob = await downloadProfileResume();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not preview resume'), 'error');
    } finally {
      setResumeBusy(false);
    }
  }, [showToast]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading || !profile) {
    return (
      <section className={styles.page}>
        <ProfileSkeleton />
      </section>
    );
  }

  const displayName = getProfileDisplayName(profile) || 'Your profile';
  const portfolioLinks = [
    profile.gitHubUrl && { label: 'GitHub', href: profile.gitHubUrl },
    profile.linkedInUrl && { label: 'LinkedIn', href: profile.linkedInUrl },
    profile.websiteUrl && { label: 'Website', href: profile.websiteUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <motion.section
      className={styles.page}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
    >
      <motion.div variants={fadeUp}>
        <h2 className={styles.pageTitle}>Profile</h2>
      </motion.div>

      <motion.div variants={fadeUp}>
        <ProfileHeader
          profile={profile}
          displayName={displayName}
          verified={verified}
          uploading={bannerUploading}
          uploadProgress={bannerProgress}
          onEdit={() => navigate('/profile/info')}
          onShare={() => setShareOpen(true)}
          onBannerUpload={handleBannerUpload}
        />
      </motion.div>

      {showCompletionBar && (
        <motion.div variants={fadeUp}>
          <Link to="/profile/complete" className={styles.completion}>
            Complete your profile to unlock Quick Apply
            <IconChevronRight size={16} />
          </Link>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <ProfileStats
          applicationsCount={applicationsCount}
          savedCount={savedCount}
          resumeReady={Boolean(profile.resumeFileName)}
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <ResumeCardCompact
          fileName={profile.resumeFileName}
          uploadedAt={profile.resumeUploadedAt}
          busy={resumeBusy}
          onReplace={handleResumeReplace}
          onPreview={() => void handleResumePreview()}
          onDelete={() => void handleResumeDelete()}
        />
      </motion.div>

      <motion.div className={styles.sectionGap} variants={fadeUp}>
        <ProfileMenuList>
          <ProfileMenuItem
            to="/profile/info"
            icon={<IconUser size={18} />}
            title="Profile Information"
            summary={buildInfoSummary(profile.bio, profile.experiences.length, profile.skills.length)}
          />
          <ProfileMenuItem
            to="/profile/resume"
            icon={<IconFileText size={18} />}
            title="Resume"
            summary={profile.resumeFileName ?? 'Not uploaded'}
          />
          <ProfileMenuItem
            to="/profile/details"
            icon={<IconLink size={18} />}
            title="Portfolio & Links"
            summary={buildPortfolioSummary(profile.linkedInUrl, profile.gitHubUrl, profile.websiteUrl)}
          />
          <ProfileMenuItem
            to="/profile/info"
            icon={<IconSpark size={18} />}
            title="Skills"
            summary={profile.skills.length > 0 ? `${profile.skills.length} listed` : 'Add your skills'}
          />
          <ProfileMenuItem
            to="/profile/info"
            icon={<IconBriefcase size={18} />}
            title="Experience"
            summary={profile.experiences.length > 0 ? `${profile.experiences.length} position${profile.experiences.length === 1 ? '' : 's'}` : 'Add work history'}
          />
          <ProfileMenuItem
            to="/profile/info"
            icon={<IconGraduation size={18} />}
            title="Education"
            summary={profile.educations.length > 0 ? `${profile.educations.length} school${profile.educations.length === 1 ? '' : 's'}` : 'Add education'}
          />
          <ProfileMenuItem
            to="/profile/app"
            icon={<IconSettings size={18} />}
            title="Settings"
            summary="Appearance, notifications, app"
          />
        </ProfileMenuList>

        {portfolioLinks.length > 0 && (
          <div className={styles.linkRows}>
            {portfolioLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkRow}
              >
                <span>{link.label}</span>
                <span>Open</span>
              </a>
            ))}
          </div>
        )}
      </motion.div>

      <motion.footer className={styles.footer} variants={fadeUp}>
        <button type="button" className={styles.logout} onClick={() => void handleLogout()}>
          <span className={styles.logoutIcon}>
            <IconLogOut size={18} />
          </span>
          Log out
        </button>
      </motion.footer>

      <ProfileShareMenu
        profileId={profile.id}
        displayName={displayName}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </motion.section>
  );
}
