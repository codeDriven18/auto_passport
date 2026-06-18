import type { PortalStats } from '@/models/portal';
import { CompanyStatus } from '@/models/operations';

/** Attention-first dashboard items — drive actions, not passive stats. */
export type EmployerAttentionKind =
  | 'candidates_waiting_review'
  | 'unread_messages'
  | 'upcoming_interviews'
  | 'jobs_needing_action'
  | 'pipeline_stale';

export interface EmployerAttentionItem {
  id: string;
  kind: EmployerAttentionKind;
  title: string;
  description: string;
  to: string;
  priority: 'high' | 'medium' | 'low';
  count?: number;
}

export interface EmployerAttentionInput {
  stats: PortalStats;
  unreadMessages: number;
  /** Reserved for calendar phase — upcoming interview count */
  upcomingInterviews?: number;
  /** Reserved — candidates in Applied/Reviewing awaiting employer action */
  candidatesWaitingReview?: number;
}

export function buildEmployerAttentionItems(input: EmployerAttentionInput): EmployerAttentionItem[] {
  const {
    stats,
    unreadMessages,
    upcomingInterviews = 0,
    candidatesWaitingReview = stats.newApplicationsThisWeek,
  } = input;

  const items: EmployerAttentionItem[] = [];

  if (candidatesWaitingReview > 0) {
    items.push({
      id: 'review',
      kind: 'candidates_waiting_review',
      title: 'Candidates waiting review',
      description: `${candidatesWaitingReview} need your decision in the pipeline`,
      to: '/portal/pipeline',
      priority: 'high',
      count: candidatesWaitingReview,
    });
  }

  if (unreadMessages > 0) {
    items.push({
      id: 'messages',
      kind: 'unread_messages',
      title: 'Unread candidate messages',
      description: 'Reply to keep candidates engaged',
      to: '/portal/messages',
      priority: 'high',
      count: unreadMessages,
    });
  }

  if (upcomingInterviews > 0) {
    items.push({
      id: 'interviews',
      kind: 'upcoming_interviews',
      title: 'Upcoming interviews',
      description: 'Interviews scheduled on your calendar',
      to: '/portal/pipeline?column=interview',
      priority: 'high',
      count: upcomingInterviews,
    });
  }

  if (stats.activeJobs === 0 && stats.companyStatus === CompanyStatus.Approved) {
    items.push({
      id: 'jobs',
      kind: 'jobs_needing_action',
      title: 'No active job posts',
      description: 'Publish a role to start receiving candidates',
      to: '/portal/jobs',
      priority: 'medium',
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'pipeline',
      kind: 'pipeline_stale',
      title: 'Pipeline is up to date',
      description: 'Open the board to plan your next hiring moves',
      to: '/portal/pipeline',
      priority: 'low',
    });
  }

  return items.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.priority] - rank[b.priority];
  });
}
