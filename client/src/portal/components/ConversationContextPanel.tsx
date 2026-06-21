import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalApi } from '@/api/portalApi';
import type { PortalApplicantDetail } from '@/models/portalApplicant';
import { ApplicationStatusLabels, InterviewPhase } from '@/models/enums';
import { RecruiterActivityTypeLabels } from '@/models/recruiter';
import { CandidateProfileHero } from '@/portal/components/CandidateProfileHero';
import { RecruiterChatActions } from '@/portal/components/RecruiterChatActions';
import { candidateProfilePath } from '@/lib/employer/hiringNavigation';
import ws from '@/portal/workspace.module.css';

const INTERVIEW_PHASE_LABELS: Record<InterviewPhase, string> = {
  [InterviewPhase.None]: 'Not scheduled',
  [InterviewPhase.Requested]: 'Requested',
  [InterviewPhase.Scheduled]: 'Scheduled',
  [InterviewPhase.Completed]: 'Completed',
};

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
        <div className={ws.msgContextScroll}>
          <div className={ws.msgContextSkeleton} aria-busy="true">
            <span className={ws.msgContextSkeletonAvatar} />
            <span className={ws.msgContextSkeletonLine} />
            <span className={ws.msgContextSkeletonLineShort} />
          </div>
        </div>
      </aside>
    );
  }

  if (!applicant) {
    return (
      <aside className={ws.msgContext} aria-label="Candidate context">
        <div className={ws.msgContextScroll}>
          <p className={ws.msgContextEmpty}>Could not load candidate details.</p>
          <Link to={candidateProfilePath(applicationId, { from: 'inbox' })} className={ws.btnGhost}>Open profile</Link>
        </div>
      </aside>
    );
  }

  const tags = applicant.recruiterTags ?? [];
  const notes = applicant.recruiterNotes ?? [];
  const timeline = (applicant.activityTimeline ?? []).slice(0, 4);
  const showInterview = applicant.interviewPhase !== InterviewPhase.None
    || Boolean(applicant.interviewScheduledAtUtc);

  return (
    <aside className={ws.msgContext} aria-label="Candidate context">
      <div className={ws.msgContextScroll}>
        <CandidateProfileHero
          applicant={applicant}
          compact
          ratingBusy={ratingBusy}
          onRatingChange={(rating) => void handleRating(rating)}
        />

        <div className={ws.msgContextBlock}>
          <p className={ws.msgContextLabel}>Current stage</p>
          <span className={ws.msgContextStage}>{ApplicationStatusLabels[applicant.status]}</span>
          <p className={ws.msgContextMuted}>{applicant.jobTitle}</p>
        </div>

        {showInterview && (
          <div className={ws.msgContextBlock}>
            <p className={ws.msgContextLabel}>Interview</p>
            <p className={ws.msgContextSub}>{INTERVIEW_PHASE_LABELS[applicant.interviewPhase]}</p>
            {applicant.interviewScheduledAtUtc && (
              <p className={ws.msgContextMuted}>
                {new Date(applicant.interviewScheduledAtUtc).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            )}
            {applicant.interviewLocation && (
              <p className={ws.msgContextMuted}>{applicant.interviewLocation}</p>
            )}
          </div>
        )}

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

        {notes.length > 0 && (
          <div className={ws.msgContextBlock}>
            <p className={ws.msgContextLabel}>Notes</p>
            <ul className={ws.msgContextNotes}>
              {notes.slice(0, 3).map((note) => (
                <li key={note.id} className={ws.msgContextNoteItem}>
                  <p className={ws.msgContextNoteText}>{note.text}</p>
                  <time className={ws.msgContextMuted} dateTime={note.createdAt}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        )}

        {timeline.length > 0 && (
          <div className={ws.msgContextBlock}>
            <p className={ws.msgContextLabel}>Timeline</p>
            <div className={ws.msgContextTimeline}>
              {timeline.map((entry, index) => (
                <div key={`${entry.type}-${entry.occurredAt}-${index}`} className={ws.msgContextTimelineItem}>
                  <strong>{RecruiterActivityTypeLabels[entry.type] ?? 'Activity'}</strong>
                  {entry.details && <p className={ws.msgContextMuted}>{entry.details}</p>}
                  <time className={ws.msgContextMuted} dateTime={entry.occurredAt}>
                    {new Date(entry.occurredAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <RecruiterChatActions
        applicationId={applicationId}
        status={applicant.status}
        variant="panel"
        onChanged={() => {
          void load();
          onUpdated?.();
        }}
      />

      <div className={ws.msgContextActions}>
        <Link to={candidateProfilePath(applicationId, { from: 'inbox' })} className={ws.btnPrimary}>
          Open full profile
        </Link>
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
      </div>
    </aside>
  );
}
