import { Link } from 'react-router-dom';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { pipelineStageLabel } from '@/lib/employer/employerWorkspaceData';
import type { PortalApplication } from '@/models/portal';
import type { ConversationSummary } from '@/models/messaging';
import type { PortalJob } from '@/models/portal';
import ws from '@/portal/workspace.module.css';

export function ApplicantWorkRow({ application }: { application: PortalApplication }) {
  const parts = application.applicantName.trim().split(/\s+/);
  const applied = new Date(application.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <Link to={`/portal/applications/${application.id}`} className={ws.workRow}>
      <UserAvatar
        profile={{
          firstName: parts[0] ?? '',
          lastName: parts.slice(1).join(' '),
          email: application.applicantEmail,
          profileImageUrl: application.applicantProfileImageUrl,
        }}
        size="sm"
      />
      <div className={ws.workRowBody}>
        <span className={ws.workRowTitle}>{application.applicantName || 'Candidate'}</span>
        <span className={ws.workRowMeta}>{application.jobTitle} · Applied {applied}</span>
      </div>
      <span className={ws.badgeMuted}>{pipelineStageLabel(application)}</span>
    </Link>
  );
}

export function ConversationWorkRow({ conversation }: { conversation: ConversationSummary }) {
  return (
    <Link to={`/portal/messages/${conversation.id}`} className={ws.workRow}>
      <div className={ws.workRowBody}>
        <span className={ws.workRowTitle}>{conversation.candidateName}</span>
        <span className={ws.workRowMeta}>{conversation.jobTitle}</span>
      </div>
      {conversation.unreadCount > 0 && <span className={ws.badge}>{conversation.unreadCount}</span>}
    </Link>
  );
}

export function RoleWorkRow({ job, applicantCount }: { job: PortalJob; applicantCount: number }) {
  return (
    <Link to={`/portal/pipeline?jobId=${job.id}`} className={ws.workRow}>
      <div className={ws.workRowBody}>
        <span className={ws.workRowTitle}>{job.title}</span>
        <span className={ws.workRowMeta}>
          {job.city ?? job.location ?? 'No location'} · {applicantCount} applicants
        </span>
      </div>
      <span className={ws.badgeOk}>Active</span>
    </Link>
  );
}
