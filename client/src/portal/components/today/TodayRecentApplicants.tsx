import { Link } from 'react-router-dom';
import { UserAvatar } from '@/components/profile/UserAvatar';
import {
  formatApplicantAppliedTime,
  pipelineStageLabel,
} from '@/lib/employer/todayWorkspace';
import { candidateProfilePath } from '@/lib/employer/hiringNavigation';
import type { PortalApplication } from '@/models/portal';
import { TodaySection } from '@/portal/components/today/TodaySection';
import ws from '@/portal/workspace.module.css';

interface TodayRecentApplicantsProps {
  applicants: PortalApplication[];
  conversationByApplication: Map<string, string>;
}

export function TodayRecentApplicants({ applicants, conversationByApplication }: TodayRecentApplicantsProps) {
  return (
    <TodaySection
      title="Recent applicants"
      action={{ label: 'View all', to: '/portal/pipeline?view=list' }}
    >
      {applicants.length === 0 ? (
        <p className={ws.todayInlineEmpty}>No applicants yet.</p>
      ) : (
        <ul className={ws.todayApplicantList}>
          {applicants.map((app) => {
            const parts = app.applicantName.trim().split(/\s+/);
            const conversationId = conversationByApplication.get(app.id);

            return (
              <li key={app.id} className={ws.todayApplicantCard}>
                <Link
                  to={candidateProfilePath(app.id, { from: 'today', jobId: app.jobId })}
                  className={ws.todayApplicantMain}
                >
                  <UserAvatar
                    profile={{
                      firstName: parts[0] ?? '',
                      lastName: parts.slice(1).join(' '),
                      email: app.applicantEmail,
                      profileImageUrl: app.applicantProfileImageUrl,
                    }}
                    size="sm"
                  />
                  <div className={ws.todayApplicantInfo}>
                    <strong>{app.applicantName}</strong>
                    <span>{app.jobTitle}</span>
                    <span className={ws.todayApplicantMeta}>
                      {formatApplicantAppliedTime(app.appliedAt)} · {pipelineStageLabel(app)}
                    </span>
                  </div>
                </Link>
                <div className={ws.todayApplicantActions}>
                  <Link
                    to={candidateProfilePath(app.id, { from: 'today', jobId: app.jobId })}
                    className={ws.todayApplicantAction}
                  >
                    Profile
                  </Link>
                  {conversationId ? (
                    <Link to={`/portal/messages/${conversationId}`} className={ws.todayApplicantAction}>
                      Message
                    </Link>
                  ) : (
                    <span className={ws.todayApplicantActionMuted}>Message</span>
                  )}
                  <Link
                    to={candidateProfilePath(app.id, { from: 'today', jobId: app.jobId })}
                    className={[ws.todayApplicantAction, ws.todayApplicantActionPrimary].join(' ')}
                  >
                    Review
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </TodaySection>
  );
}
