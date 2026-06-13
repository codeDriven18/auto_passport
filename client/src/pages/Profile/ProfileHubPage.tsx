import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconCheck, IconChevronRight, IconCircle, IconFile, IconSettings } from '@/components/icons/Icons';
import { applicationsApi } from '@/api/applicationsApi';
import { savedJobsApi } from '@/api/savedJobsApi';
import { ProfileShareMenu } from '@/components/profile/ProfileShareMenu';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { useProfile } from '@/hooks/useProfile';
import { isProfileSubstantiallyComplete, shouldShowMandatoryCompletionPrompts } from '@/lib/profileCompletion';
import { markProfileSubstantiallyComplete } from '@/lib/profileCompletionStorage';
import { getVerificationSignals, isVerifiedCandidate } from '@/lib/verification';
import { getProfileDisplayName } from '@/models/userProfile';
import type { JobApplication } from '@/models/application';
import styles from './ProfilePage.module.css';

export function ProfileHubPage() {
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
  const topSkills = profile.skills.slice(0, 8);
  const topExperience = profile.experiences.slice(0, 3);
  const topEducation = profile.educations.slice(0, 2);

  return (
    <section className={styles.page}>
      <div className={styles.identityBanner} aria-hidden />
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

      <section className={styles.identitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>About me</h2>
          <Link to="/profile/details" className={styles.sectionEdit}>Edit</Link>
        </div>
        <p className={profile.bio?.trim() ? `${styles.aboutText} copyable-content` : styles.placeholderText}>
          {profile.bio?.trim() || 'Tell employers who you are and what you are looking for.'}
        </p>
      </section>

      <section className={styles.identitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          <Link to="/profile/experience" className={styles.sectionEdit}>Edit</Link>
        </div>
        {topExperience.length > 0 ? (
          <ul className={styles.timeline}>
            {topExperience.map((exp) => (
              <li key={exp.id ?? `${exp.company}-${exp.title}`} className={styles.timelineItem}>
                <span className={styles.timelineDot} aria-hidden />
                <div>
                  <strong>{exp.title}</strong>
                  <p className={styles.timelineMeta}>{exp.company}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.placeholderText}>Add roles that show what you have accomplished.</p>
        )}
      </section>

      <section className={styles.identitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <Link to="/profile/skills" className={styles.sectionEdit}>Edit</Link>
        </div>
        {topSkills.length > 0 ? (
          <div className={styles.skillChips}>
            {topSkills.map((skill) => (
              <span key={skill.id ?? skill.name} className={styles.skillChip}>{skill.name}</span>
            ))}
          </div>
        ) : (
          <p className={styles.placeholderText}>Highlight the skills employers search for.</p>
        )}
      </section>

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
          <h2 className={styles.sectionTitle}>Education</h2>
          <Link to="/profile/education" className={styles.sectionEdit}>Edit</Link>
        </div>
        {topEducation.length > 0 ? (
          <ul className={styles.timeline}>
            {topEducation.map((edu) => (
              <li key={edu.id ?? `${edu.institution}-${edu.degree}`} className={styles.timelineItem}>
                <span className={styles.timelineDot} aria-hidden />
                <div>
                  <strong>{edu.degree}</strong>
                  <p className={styles.timelineMeta}>{edu.institution}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.placeholderText}>Add your education background.</p>
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
