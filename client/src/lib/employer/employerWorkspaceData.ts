import { ApplicationStatus, InterviewPhase, PipelineStage } from '@/models/enums';
import type { PortalApplication } from '@/models/portal';
import type { ConversationSummary } from '@/models/messaging';
import { PIPELINE_COLUMNS, resolvePipelineStage } from './pipelineArchitecture';
import { PIPELINE_STAGE_LABELS } from './pipelineMove';

export interface PipelineStageCount {
  stage: PipelineStage;
  label: string;
  count: number;
}

export interface JobCampaignMetrics {
  applicants: number;
  reviewing: number;
  interviewing: number;
  offers: number;
  hires: number;
}

export function countPipelineStages(applications: PortalApplication[]): PipelineStageCount[] {
  const active = applications.filter((app) => !app.isWithdrawn);
  return PIPELINE_COLUMNS.map((column) => ({
    stage: column.id,
    label: column.label,
    count: active.filter((app) => resolvePipelineStage(app.status) === column.id).length,
  }));
}

export function getJobCampaignMetrics(jobId: string, applications: PortalApplication[]): JobCampaignMetrics {
  const apps = applications.filter((app) => app.jobId === jobId && !app.isWithdrawn);
  return {
    applicants: apps.length,
    reviewing: apps.filter((app) => {
      const stage = resolvePipelineStage(app.status);
      return stage === PipelineStage.Applied || stage === PipelineStage.Reviewing || stage === PipelineStage.Shortlisted;
    }).length,
    interviewing: apps.filter((app) => resolvePipelineStage(app.status) === PipelineStage.Interview).length,
    offers: apps.filter((app) => resolvePipelineStage(app.status) === PipelineStage.Offer).length,
    hires: apps.filter((app) => resolvePipelineStage(app.status) === PipelineStage.Hired).length,
  };
}

export function getRecentApplicants(applications: PortalApplication[], limit = 8): PortalApplication[] {
  return [...applications]
    .filter((app) => !app.isWithdrawn)
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, limit);
}

export function getApplicantsNeedingReview(applications: PortalApplication[], limit = 6): PortalApplication[] {
  return applications
    .filter((app) => !app.isWithdrawn && (
      app.status === ApplicationStatus.Applied
      || app.status === ApplicationStatus.UnderReview
      || app.status === ApplicationStatus.Pending
    ))
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, limit);
}

export function getInterviewQueue(applications: PortalApplication[], limit = 6): PortalApplication[] {
  return applications
    .filter((app) => !app.isWithdrawn && (
      app.interviewScheduledAtUtc
      || app.interviewPhase !== InterviewPhase.None
      || app.status === ApplicationStatus.InterviewInvited
      || app.status === ApplicationStatus.Interviewing
    ))
    .sort((a, b) => {
      const aTime = a.interviewScheduledAtUtc ? new Date(a.interviewScheduledAtUtc).getTime() : null;
      const bTime = b.interviewScheduledAtUtc ? new Date(b.interviewScheduledAtUtc).getTime() : null;
      if (aTime !== null && bTime !== null) return aTime - bTime;
      if (aTime !== null) return -1;
      if (bTime !== null) return 1;
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    })
    .slice(0, limit);
}

/** Candidates with interviews scheduled in the last 48 hours or upcoming. */
export function getRecentlyScheduledInterviews(applications: PortalApplication[], limit = 5): PortalApplication[] {
  const now = Date.now();
  const windowMs = 48 * 60 * 60 * 1000;
  return applications
    .filter((app) => !app.isWithdrawn && app.interviewScheduledAtUtc)
    .filter((app) => {
      const t = new Date(app.interviewScheduledAtUtc!).getTime();
      return t >= now - windowMs;
    })
    .sort((a, b) => new Date(a.interviewScheduledAtUtc!).getTime() - new Date(b.interviewScheduledAtUtc!).getTime())
    .slice(0, limit);
}

/** Active pipeline candidates beyond applied/review — proxy for recent hiring momentum. */
export function getPipelineMomentum(applications: PortalApplication[], limit = 5): PortalApplication[] {
  return applications
    .filter((app) => !app.isWithdrawn)
    .filter((app) => {
      const stage = resolvePipelineStage(app.status);
      return stage !== PipelineStage.Applied && stage !== PipelineStage.Reviewing;
    })
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, limit);
}

export function pipelineStageLabel(app: PortalApplication): string {
  return PIPELINE_STAGE_LABELS[resolvePipelineStage(app.status)];
}

export function getRecentConversations(conversations: ConversationSummary[], limit = 6): ConversationSummary[] {
  return [...conversations]
    .sort((a, b) => {
      const aTime = a.latestMessageAt ? new Date(a.latestMessageAt).getTime() : 0;
      const bTime = b.latestMessageAt ? new Date(b.latestMessageAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}
