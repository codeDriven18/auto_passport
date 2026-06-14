import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconCheck, IconChevronRight, IconCircle, IconFile, IconLogOut, IconSettings } from '@/components/icons/Icons';
import { applicationsApi } from '@/api/applicationsApi';
import { savedJobsApi } from '@/api/savedJobsApi';
import { ProfileShareMenu } from '@/components/profile/ProfileShareMenu';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { isProfileSubstantiallyComplete, shouldShowMandatoryCompletionPrompts } from '@/lib/profileCompletion';
import { markProfileSubstantiallyComplete } from '@/lib/profileCompletionStorage';
import { getVerificationSignals, isVerifiedCandidate } from '@/lib/verification';
import { getProfileDisplayName } from '@/models/userProfile';
import type { JobApplication } from '@/models/application';
import styles from './ProfilePage.module.css';

export function ProfileHubPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (profile && isProfileSubstantiallyComplete(profile)) {
      markProfileSubstantiallyComplete();
    }
  }, [profile]);

  useEffect(() => {
    applicationsApi.getMine()
      .then((apps) => {
        setApplicationsCount(apps.length);
        setRecentApplications(
          [...apps]
            .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
            .slice(0, 3),
        );
      })
      .catch(() => {
        setApplicationsCount(0);
        setRecentApplications([]);
      });
    savedJobsApi.getMine().then((s) => setSavedCount(s.length)).catch(() => setSavedCount(0));
  }, []);

  const verified = useMemo(() => (profile ? isVerifiedCandidate(profile) : false), [profile]);
  const signals = useMemo(() => (profile ? getVerificationSignals(profile) : []), [profile]);
  const showCompletionBar = profile ? shouldShowMandatoryCompletionPrompts(profile) : false;

  if (loading || !profile) {
    return (
      <section className={styles.page}>
        <ProfileSkeleton />
      </section>
    );
  }

  const displayName = getProfileDisplayName(profile) || 'Your profile';
  const infoSummary = [
    profile.bio?.trim() && 'About',
    profile.experiences.length > 0 && `${profile.experiences.length} role${profile.experiences.length !== 1 ? 's' : ''}`,
    profile.skills.length > 0 && `${profile.skills.length} skill${profile.skills.length !== 1 ? 's' : ''}`,
    profile.educations.length > 0 && `${profile.educations.length} school${profile.educations.length !== 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <section className={styles.page}>
      <div
        className={styles.identityBanner}
        style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        aria-hidden
      />
      <header className={styles.identityCard}>
        <div className={styles.identityAvatarWrap}>
          <UserAvatar profile={profile} size="xl" className={styles.identityAvatar} />
        </div>
        <div className={styles.identityBody}>
          <div className={styles.identityTitleRow}>
            <h1 className={styles.name}>{displayName}</h1>
            {verified && <span className={styles.verifiedBadge}>Verified Candidate</span>}
            <button type="button" className={styles.shareBtn} onClick={() => setShareOpen(true)}>
              Share
            </button>
          </div>
          <p className={styles.headline}>{profile.headline?.trim() || 'Add a professional headline'}</p>
          <p className={styles.meta}>
            {profile.location?.trim() ? profile.location : 'Add your location'}
          </p>
          <Link to="/profile/details" className={styles.identityDetailsLink}>Edit name & contact</Link>
        </div>
      </header>

      {showCompletionBar && (
        <Link to="/profile/complete" className={styles.completionHubCard}>
          Complete your profile to unlock Quick Apply everywhere <IconChevronRight size={18} />
        </Link>
      )}

      <div className={styles.quickLinksRow}>
        <Link to="/applications" className={styles.quickLinkCard}>
          <span className={styles.quickLinkValue}>{applicationsCount}</span>
          <span className={styles.quickLinkLabel}>Applications</span>
        </Link>
        <Link to="/saved" className={styles.quickLinkCard}>
          <span className={styles.quickLinkValue}>{savedCount}</span>
          <span className={styles.quickLinkLabel}>Saved jobs</span>
        </Link>
        <Link to="/profile/resume" className={styles.quickLinkCard}>
          <span className={styles.quickLinkValue}>
            {profile.resumeFileName ? <IconCheck size={20} /> : '—'}
          </span>
          <span className={styles.quickLinkLabel}>Resume</span>
        </Link>
      </div>

      <Link to="/profile/info" className={styles.infoEntryCard}>
        <div className={styles.infoEntryText}>
          <strong className={styles.infoEntryTitle}>Profile info</strong>
          <span className={styles.infoEntrySub}>
            {infoSummary || 'Photo, background, about, experience, skills, education'}
          </span>
        </div>
        <IconChevronRight size={20} className={styles.infoEntryIcon} aria-hidden />
      </Link>

      <section className={styles.identitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Resume</h2>
          <Link to="/profile/resume" className={styles.sectionEdit}>Edit</Link>
        </div>
        {profile.resumeFileName ? (
          <div className={styles.resumePreview}>
            <IconFile size={22} className={styles.resumePreviewIcon} aria-hidden />
            <div>
              <strong className={styles.resumeName}>{profile.resumeFileName}</strong>
              <p className={styles.resumeHint}>Ready for Quick Apply</p>
            </div>
          </div>
        ) : (
          <p className={styles.placeholderText}>Upload a resume to apply faster everywhere.</p>
        )}
      </section>

      <section className={styles.identitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Portfolio & links</h2>
          <Link to="/profile/details" className={styles.sectionEdit}>Edit</Link>
        </div>
        <div className={styles.linkRow}>
          {profile.linkedInUrl && (
            <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className={styles.linkPill}>LinkedIn</a>
          )}
          {profile.gitHubUrl && (
            <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer" className={styles.linkPill}>GitHub</a>
          )}
          {profile.websiteUrl && (
            <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.linkPill}>Portfolio</a>
          )}
          {!profile.linkedInUrl && !profile.gitHubUrl && !profile.websiteUrl && (
            <p className={styles.placeholderText}>Add LinkedIn, GitHub, or your portfolio.</p>
          )}
        </div>
      </section>

      <section className={styles.identitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent activity</h2>
          <Link to="/applications" className={styles.sectionEdit}>View all</Link>
        </div>
        {recentApplications.length > 0 ? (
          <ul className={styles.activityList}>
            {recentApplications.map((app) => (
              <li key={app.id}>
                <Link to={`/jobs/${app.jobId}`} className={styles.activityItem}>
                  <div className={styles.activityMain}>
                    <strong>{app.job?.title ?? 'Application'}</strong>
                    <span className={styles.activityMeta}>{app.job?.company}</span>
                  </div>
                  <div className={styles.activityAside}>
                    <StatusBadge status={app.status} />
                    <span className={styles.activityDate}>
                      {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.placeholderText}>Your applications will appear here after you apply.</p>
        )}
      </section>

      <section className={styles.identitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Verification</h2>
        </div>
        <ul className={styles.verificationList}>
          {signals.map((signal) => (
            <li key={signal.id} className={signal.met ? styles.verificationMet : styles.verificationPending}>
              <span className={styles.verificationIcon} aria-hidden>
                {signal.met ? <IconCheck size={16} /> : <IconCircle size={16} />}
              </span>
              {signal.label}
            </li>
          ))}
        </ul>
      </section>

      <footer className={styles.profileSettingsFooter}>
        <Link to="/profile/app" className={styles.settingsEntry}>
          <IconSettings size={18} />
          Settings
        </Link>
        <button type="button" className={styles.settingsEntry} onClick={() => void handleLogout()}>
          <IconLogOut size={18} />
          Log out
        </button>
      </footer>

      <ProfileShareMenu
        profileId={profile.id}
        displayName={displayName}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </section>
  );
}
