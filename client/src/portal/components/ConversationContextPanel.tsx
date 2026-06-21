import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalApi } from '@/api/portalApi';
import type { PortalApplicantDetail } from '@/models/portalApplicant';
import { CandidateProfileHero } from '@/portal/components/CandidateProfileHero';
import { candidateProfilePath } from '@/lib/employer/hiringNavigation';
import ws from '@/portal/workspace.module.css';

interface ConversationContextPanelProps {
  applicationId: string;
  onUpdated?: () => void;
}

export function ConversationContextPanel({ applicationId, onUpdated }: ConversationContextPanelProps) {
  const [applicant, setApplicant] = useState<PortalApplicantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await portalApi.getApplicant(applicationId);
      setApplicant(detail);
    } catch {
      setApplicant(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRating = async (rating: number | null) => {
    setRatingBusy(true);
    try {
      await portalApi.setRecruiterRating(applicationId, rating);
      await load();
      onUpdated?.();
    } finally {
      setRatingBusy(false);
    }
  };

  const handleResume = async () => {
    if (!applicant?.hasResume) return;
    setDownloading(true);
    try {
      const blob = await portalApi.downloadApplicantResume(applicationId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = applicant.resumeFileName ?? 'resume.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <aside className={ws.msgContext} aria-label="Candidate context">
        <div className={ws.msgContextSkeleton} aria-busy="true">
          <span className={ws.msgContextSkeletonAvatar} />
          <span className={ws.msgContextSkeletonLine} />
          <span className={ws.msgContextSkeletonLineShort} />
        </div>
      </aside>
    );
  }

  if (!applicant) {
    return (
      <aside className={ws.msgContext} aria-label="Candidate context">
        <p className={ws.msgContextEmpty}>Could not load candidate details.</p>
        <Link to={candidateProfilePath(applicationId, { from: 'inbox' })} className={ws.btnGhost}>Open profile</Link>
      </aside>
    );
  }

  const tags = applicant.recruiterTags ?? [];

  return (
    <aside className={ws.msgContext} aria-label="Candidate context">
      <CandidateProfileHero
        applicant={applicant}
        compact
        ratingBusy={ratingBusy}
        onRatingChange={(rating) => void handleRating(rating)}
      />

      {tags.length > 0 && (
        <div className={ws.msgContextBlock}>
          <p className={ws.msgContextLabel}>Tags</p>
          <div className={ws.msgContextTags}>
            {tags.map((tag) => (
              <span key={tag.id} className={ws.recruiterTagPill}>{tag.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className={ws.msgContextActions}>
        {applicant.hasResume && (
          <button
            type="button"
            className={ws.btnGhost}
            disabled={downloading}
            onClick={() => void handleResume()}
          >
            {downloading ? 'Downloading…' : 'Download resume'}
          </button>
        )}
        <Link to={candidateProfilePath(applicationId, { from: 'inbox' })} className={ws.btnPrimary}>
          Full profile
        </Link>
      </div>
    </aside>
  );
}
