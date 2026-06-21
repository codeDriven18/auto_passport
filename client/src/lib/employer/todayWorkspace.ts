import { ApplicationStatus } from '@/models/enums';
import type { PortalApplication, PortalStats } from '@/models/portal';
import type { ConversationSummary } from '@/models/messaging';
import { RecruiterActivityType } from '@/models/recruiter';
import type { PortalWorkspaceActivity } from '@/models/workspaceActivity';
import { pipelineStageLabel } from './employerWorkspaceData';

export interface InterviewDayGroup {
  label: string;
  items: PortalApplication[];
}

export interface HiringSnapshot {
  activeRoles: number;
  candidatesInPipeline: number;
  interviewsThisWeek: number;
  offersSent: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDayLabel(date: Date, today: Date): string {
  const dayStart = startOfDay(date);
  const todayStart = startOfDay(today);
  const tomorrowStart = addDays(todayStart, 1);

  if (dayStart.getTime() === todayStart.getTime()) return 'Today';
  if (dayStart.getTime() === tomorrowStart.getTime()) return 'Tomorrow';

  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getUpcomingInterviewsGrouped(applications: PortalApplication[]): InterviewDayGroup[] {
  const now = new Date();
  const todayStart = startOfDay(now);

  const upcoming = applications
    .filter((app) => !app.isWithdrawn && app.interviewScheduledAtUtc)
    .filter((app) => new Date(app.interviewScheduledAtUtc!).getTime() >= todayStart.getTime())
    .sort((a, b) => new Date(a.interviewScheduledAtUtc!).getTime() - new Date(b.interviewScheduledAtUtc!).getTime());

  const groups = new Map<string, InterviewDayGroup>();

  for (const app of upcoming) {
    const date = new Date(app.interviewScheduledAtUtc!);
    const key = startOfDay(date).toISOString();
    const label = formatDayLabel(date, now);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(app);
    } else {
      groups.set(key, { label, items: [app] });
    }
  }

  return [...groups.values()];
}

export function getHiringSnapshot(
  stats: PortalStats,
  applications: PortalApplication[],
): HiringSnapshot {
  const now = new Date();
  const weekEnd = addDays(startOfDay(now), 7);

  const active = applications.filter((app) => !app.isWithdrawn);
  const inPipeline = active.filter((app) =>
    app.status !== ApplicationStatus.Rejected
    && app.status !== ApplicationStatus.Hired
    && app.status !== ApplicationStatus.Withdrawn,
  ).length;

  const interviewsThisWeek = active.filter((app) => {
    if (!app.interviewScheduledAtUtc) return false;
    const t = new Date(app.interviewScheduledAtUtc).getTime();
    return t >= startOfDay(now).getTime() && t < weekEnd.getTime();
  }).length;

  const offersSent = active.filter((app) => app.status === ApplicationStatus.OfferSent).length;

  return {
    activeRoles: stats.activeJobs,
    candidatesInPipeline: inPipeline,
    interviewsThisWeek,
    offersSent,
  };
}

export function buildConversationByApplication(
  conversations: ConversationSummary[],
): Map<string, string> {
  return new Map(conversations.map((c) => [c.applicationId, c.id]));
}

export type ActivityIconKind = 'application' | 'interview' | 'message' | 'role' | 'stage' | 'reject' | 'offer' | 'note';

export function resolveActivityIcon(activity: PortalWorkspaceActivity): ActivityIconKind {
  const msg = activity.message.toLowerCase();
  if (msg.includes('role published')) return 'role';
  if (msg.includes('replied in chat')) return 'message';
  if (msg.includes('interview scheduled')) return 'interview';
  if (msg.includes('rejected')) return 'reject';
  if (msg.includes('offer sent')) return 'offer';
  if (msg.includes('note added')) return 'note';
  if (msg.includes('new application')) return 'application';

  switch (activity.type) {
    case RecruiterActivityType.Applied:
      return 'application';
    case RecruiterActivityType.InterviewScheduled:
    case RecruiterActivityType.InterviewCompleted:
      return 'interview';
    case RecruiterActivityType.Rejected:
      return 'reject';
    case RecruiterActivityType.OfferSent:
    case RecruiterActivityType.Hired:
      return 'offer';
    case RecruiterActivityType.NoteAdded:
      return 'note';
    default:
      return 'stage';
  }
}

export function resolveActivityHref(activity: PortalWorkspaceActivity): string | undefined {
  if (activity.conversationId && activity.message.toLowerCase().includes('replied in chat')) {
    return `/portal/messages/${activity.conversationId}`;
  }
  if (activity.applicationId) {
    return `/portal/applications/${activity.applicationId}?from=today`;
  }
  if (activity.jobId) {
    return `/portal/jobs`;
  }
  return undefined;
}

export function formatInterviewTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function formatApplicantAppliedTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export { pipelineStageLabel };
