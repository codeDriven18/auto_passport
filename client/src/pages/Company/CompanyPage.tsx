import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconBriefcase,
  IconBuilding,
  IconCheck,
  IconHeart,
  IconMapPin,
  IconSpark,
} from '@/components/icons/Icons';
import { AppIcon } from '@/components/brand/AppIcon';
import { companiesApi } from '@/api/companiesApi';
import { companyFollowsApi } from '@/api/companyFollowsApi';
import { jobsApi } from '@/api/jobsApi';
import { CompanyAvatar } from '@/components/profile/CompanyAvatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { LandingBackground } from '@/pages/Marketing/landing/LandingBackground';
import { CompanyStatus } from '@/models/operations';
import type { Company } from '@/models/company';
import type { Job } from '@/models/job';
import styles from './CompanyPage.module.css';

const HIRING_STEPS = ['Apply', 'Review', 'Interview', 'Offer', 'Welcome'] as const;

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

function splitContentLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-–—*]+\s*/, '').trim())
    .filter(Boolean);
}

function PillarCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <article className={styles.pillarCard}>
      <span className={styles.pillarIcon} aria-hidden>{icon}</span>
      <h3 className={styles.pillarTitle}>{title}</h3>
      <p className={styles.pillarBody}>{body}</p>
    </article>
  );
}

function RoleRow({ job, onOpen }: { job: Job; onOpen: () => void }) {
  const location = job.city ?? job.location ?? 'Remote';
  const commitment = job.isRemote ? 'Remote-friendly' : 'On-site';
  const summary = job.description?.trim().slice(0, 120) ?? 'Join our team and help shape what we build next.';

  return (
    <article className={styles.roleRow}>
      <span className={styles.roleRowIcon} aria-hidden>
        <IconBriefcase size={20} />
      </span>
      <div className={styles.roleRowMain}>
        <h3 className={styles.roleRowTitle}>{job.title}</h3>
        <div className={styles.roleRowBadges}>
          <span className={styles.roleBadge}>{location}</span>
          <span className={styles.roleBadge}>{commitment}</span>
        </div>
        <p className={styles.roleRowDesc}>{summary}{summary.length >= 120 ? '…' : ''}</p>
      </div>
      <button type="button" className={styles.roleRowCta} onClick={onOpen}>
        View role →
      </button>
    </article>
  );
}

export function CompanyPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { trackCompanyView } = useActivityTracking();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);

    Promise.all([
      companiesApi.getBySlug(slug),
      jobsApi.search({ companySlug: slug, pageSize: 40, sortBy: 'createdAt', sortOrder: 'desc' }),
    ])
      .then(([c, result]) => {
        setCompany(c);
        setJobs(result.items);
        if (isAuthenticated && c) {
          void trackCompanyView(c.id);
          companyFollowsApi.isFollowing(c.id)
            .then((r) => setFollowing(r.following))
            .catch(() => setFollowing(false));
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, isAuthenticated, trackCompanyView]);

  const cultureLines = useMemo(() => splitContentLines(company?.culture ?? ''), [company?.culture]);
  const benefitLines = useMemo(() => splitContentLines(company?.benefits ?? ''), [company?.benefits]);

  const pillars = useMemo(() => {
    const items: { icon: ReactNode; title: string; body: string }[] = [];
    if (cultureLines[0]) items.push({ icon: <IconSpark size={18} />, title: 'Innovative', body: cultureLines[0] });
    if (cultureLines[1]) items.push({ icon: <IconHeart size={18} />, title: 'People-first', body: cultureLines[1] });
    if (cultureLines[2]) items.push({ icon: <IconBuilding size={18} />, title: 'Impact driven', body: cultureLines[2] });
    if (items.length === 0 && company?.description) {
      items.push(
        { icon: <IconSpark size={18} />, title: 'Innovative', body: 'We push boundaries and ship meaningful work.' },
        { icon: <IconHeart size={18} />, title: 'People-first', body: 'Our team is built on trust, clarity, and respect.' },
        { icon: <IconBuilding size={18} />, title: 'Impact driven', body: 'Every role connects to outcomes that matter.' },
      );
    }
    return items;
  }, [cultureLines, company?.description]);

  const toggleFollow = async () => {
    if (!isAuthenticated || !company) {
      navigate('/login', { state: { from: `/companies/${slug}` } });
      return;
    }
    setFollowLoading(true);
    try {
      if (following) {
        await companyFollowsApi.unfollow(company.id);
        setFollowing(false);
      } else {
        await companyFollowsApi.follow(company.id);
        setFollowing(true);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const scrollToJobs = () => {
    document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className={styles.careersSite} aria-busy="true" aria-label="Loading company">
        <LandingBackground />
        <div className={styles.loadingShell}>
          <div className={styles.loadingHero} />
          <div className={styles.loadingBlock} />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className={styles.careersSite}>
        <LandingBackground />
        <div className={styles.pageInner}>
          <EmptyState
            icon={<IconBuilding size={28} />}
            title="Company not found"
            description="This careers page doesn't exist or was removed."
            actions={[{ label: 'Browse jobs', to: '/jobs', primary: true }]}
          />
        </div>
      </div>
    );
  }

  const bannerUrl = resolveMediaUrl(company.bannerUrl);
  const isVerified = company.status === CompanyStatus.Approved;
  const workplace = company.location?.trim() || 'Remote';

  return (
    <div className={styles.careersSite}>
      <LandingBackground />

      <header className={styles.siteHeader}>
        <div className={styles.siteHeaderInner}>
          <Link to="/" className={styles.siteBrand}>
            <AppIcon size="sm" showShadow={false} />
            <span>SwipeJobs</span>
          </Link>
          <div className={styles.siteHeaderActions}>
            <span className={styles.siteHeaderHint}>Looking for opportunities?</span>
            <Link to="/jobs" className={styles.siteHeaderCta}>Browse all jobs →</Link>
          </div>
        </div>
      </header>

      <div className={styles.pageInner}>
        <motion.section className={styles.marketingHero} {...sectionMotion}>
          <span className={styles.hiringBadge}>
            <span className={styles.hiringDot} aria-hidden />
            We&apos;re hiring!
          </span>
          <h1 className={styles.marketingTitle}>
            Build the future with <span className={styles.marketingAccent}>us</span>
          </h1>
          <p className={styles.marketingLead}>
            {company.description?.trim().slice(0, 180) || `${company.name} is growing — explore open roles and join a team that ships with purpose.`}
          </p>
        </motion.section>

        <motion.article className={styles.identityCard} {...sectionMotion}>
          <div className={styles.identityMain}>
            <CompanyAvatar company={company} size="lg" className={styles.identityLogo} />
            <div className={styles.identityCopy}>
              <div className={styles.identityNameRow}>
                <h2 className={styles.identityName}>{company.name}</h2>
                {isVerified && (
                  <span className={styles.verifiedMark} aria-label="Verified employer">
                    <IconCheck size={16} />
                  </span>
                )}
              </div>
              <p className={styles.identityLocation}>
                <IconMapPin size={15} /> {workplace}
              </p>
              <p className={styles.identityBio}>
                {company.description?.trim() || `${company.name} is hiring talented people who want to make an impact.`}
              </p>
              <div className={styles.identityStats}>
                <div className={styles.identityStat}>
                  <span className={styles.identityStatLabel}>Team size</span>
                  <span className={styles.identityStatValue}>{company.companySize || 'Growing'}</span>
                </div>
                <div className={styles.identityStat}>
                  <span className={styles.identityStatLabel}>Open roles</span>
                  <span className={styles.identityStatValue}>{company.openJobsCount}</span>
                </div>
                <div className={styles.identityStat}>
                  <span className={styles.identityStatLabel}>Workplace</span>
                  <span className={styles.identityStatValue}>{workplace}</span>
                </div>
              </div>
            </div>
          </div>
          <div
            className={styles.identityCover}
            style={bannerUrl ? { backgroundImage: `url("${bannerUrl}")` } : undefined}
            aria-hidden
          />
        </motion.article>

        <motion.section className={styles.aboutSection} {...sectionMotion}>
          <div className={styles.aboutCopy}>
            <p className={styles.sectionEyebrow}>About us</p>
            <h2 className={styles.sectionTitle}>We build with purpose</h2>
            <p className={styles.aboutBody}>{company.description || 'This company is preparing their story.'}</p>
          </div>
          {pillars.length > 0 && (
            <div className={styles.pillarGrid}>
              {pillars.map((pillar) => (
                <PillarCard key={pillar.title} {...pillar} />
              ))}
            </div>
          )}
        </motion.section>

        {cultureLines.length > 0 && (
          <motion.section className={styles.section} {...sectionMotion}>
            <p className={styles.sectionEyebrow}>Culture</p>
            <h2 className={styles.sectionTitle}>Life at {company.name}</h2>
            <ul className={styles.bulletList}>
              {cultureLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </motion.section>
        )}

        {benefitLines.length > 0 && (
          <motion.section className={styles.section} {...sectionMotion}>
            <p className={styles.sectionEyebrow}>Benefits</p>
            <h2 className={styles.sectionTitle}>Why you&apos;ll love working here</h2>
            <ul className={styles.bulletList}>
              {benefitLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </motion.section>
        )}

        <motion.section className={styles.section} {...sectionMotion}>
          <p className={styles.sectionEyebrow}>How we hire</p>
          <h2 className={styles.sectionTitle}>Your path to joining the team</h2>
          {company.hiringPhilosophy?.trim() && (
            <p className={styles.processLead}>{company.hiringPhilosophy}</p>
          )}
          <ol className={styles.processSteps}>
            {HIRING_STEPS.map((step, index) => (
              <li key={step} className={styles.processStep}>
                <span className={styles.processNum}>{index + 1}</span>
                <span className={styles.processLabel}>{step}</span>
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.section className={styles.section} id="open-roles" {...sectionMotion}>
          <div className={styles.rolesHead}>
            <div>
              <p className={styles.sectionEyebrow}>Careers</p>
              <h2 className={styles.sectionTitle}>Join our team</h2>
            </div>
            {jobs.length > 0 && (
              <button type="button" className={styles.viewAllRoles} onClick={scrollToJobs}>
                View all roles →
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              icon={<IconBuilding size={28} />}
              title="No open roles right now"
              description="Check back soon — new opportunities are added regularly."
              actions={[{ label: 'Browse all jobs', to: '/jobs', primary: true }]}
            />
          ) : (
            <div className={styles.roleList}>
              {jobs.map((job) => (
                <RoleRow key={job.id} job={job} onOpen={() => navigate(`/jobs/${job.id}`)} />
              ))}
            </div>
          )}
        </motion.section>

        <motion.section className={styles.footerCta} {...sectionMotion}>
          <div className={styles.footerCtaGlow} aria-hidden />
          <span className={styles.footerCtaIcon} aria-hidden>💌</span>
          <h2 className={styles.footerCtaTitle}>
            Don&apos;t see the right role? <span className={styles.marketingAccent}>We&apos;d love to hear from you.</span>
          </h2>
          <p className={styles.footerCtaBody}>
            Send your CV and tell us what you&apos;re looking for — we&apos;ll reach out when there&apos;s a fit.
          </p>
          <button type="button" className={styles.btnPrimary} disabled={followLoading} onClick={() => void toggleFollow()}>
            {following ? 'Following for updates' : 'Send your CV →'}
          </button>
        </motion.section>
      </div>

      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterInner}>
          <div className={styles.footerCol}>
            <Link to="/" className={styles.siteBrand}>
              <AppIcon size="sm" showShadow={false} />
              <span>SwipeJobs</span>
            </Link>
            <p className={styles.footerTagline}>Swipe your way to the perfect job.</p>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>For candidates</p>
            <Link to="/jobs">Browse jobs</Link>
            <Link to="/register">Create profile</Link>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>For employers</p>
            <Link to="/register">Post a job</Link>
            <Link to="/login">Employer login</Link>
          </div>
          <div className={styles.footerCol}>
            <p className={styles.footerColTitle}>Connect</p>
            {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer">Website</a>}
            {company.linkedInUrl && <a href={company.linkedInUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          </div>
        </div>
        <div className={styles.siteFooterBottom}>
          <span>© {new Date().getFullYear()} SwipeJobs</span>
          <div className={styles.footerLegal}>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
