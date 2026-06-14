import { apiClient } from './client';
import type { Job } from '@/models/job';
import type {
  EditJobCandidateRequest,
  IngestionAnalytics,
  JobCandidate,
  ModerationQueue,
} from '@/models/moderation';
import { CandidateJobStatus } from '@/models/moderation';

export interface ModerationApproveResult {
  job: Job;
  candidateId: string;
  success: boolean;
  message: string;
}

export interface BulkApproveHighConfidenceResult {
  approved: number;
  failed: number;
  results: Array<{
    success: boolean;
    code?: string | null;
    message?: string | null;
    details?: string | null;
    candidateId?: string | null;
    jobId?: string | null;
    candidateStatus?: string | null;
  }>;
}

function queueStatusParam(status?: CandidateJobStatus): string | undefined {
  if (status === undefined) return undefined;
  return CandidateJobStatus[status];
}

export const moderationApi = {
  getQueue: (status: CandidateJobStatus = CandidateJobStatus.PendingReview, page = 1, pageSize = 50) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      status: queueStatusParam(status) ?? 'PendingReview',
    });
    return apiClient<ModerationQueue>(`/admin/moderation/queue?${params}`);
  },

  getCandidate: (id: string) =>
    apiClient<JobCandidate>(`/admin/moderation/candidates/${id}`),

  approve: (id: string) =>
    apiClient<ModerationApproveResult>(`/admin/moderation/candidates/${id}/approve`, { method: 'POST' }),

  reject: (id: string, reason: string) =>
    apiClient<void>(`/admin/moderation/candidates/${id}/reject`, {
      method: 'POST',
      body: { reason },
    }),

  edit: (id: string, data: EditJobCandidateRequest) =>
    apiClient<JobCandidate>(`/admin/moderation/candidates/${id}`, {
      method: 'PUT',
      body: data,
    }),

  bulkApproveHighConfidence: () =>
    apiClient<BulkApproveHighConfidenceResult>('/admin/moderation/bulk/approve-high-confidence', { method: 'POST' }),

  bulkReject: (candidateIds: string[], reason = 'Bulk rejected') =>
    apiClient<{ rejected: number }>(`/admin/moderation/bulk/reject?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      body: { candidateIds },
    }),

  getAnalytics: () =>
    apiClient<IngestionAnalytics>('/admin/moderation/analytics'),

  getPipelineDiagnostics: () =>
    apiClient<import('@/models/moderation').IngestionPipelineDiagnostics>(
      '/admin/moderation/pipeline-diagnostics',
    ),

  ingestTelegram: (data: {
    sourceId: string;
    telegramMessageId: string;
    telegramMessageUrl?: string;
    channelName?: string;
    channelUrl?: string;
    postedAt?: string;
    rawMessageText: string;
    rawMediaUrls?: string[];
  }) =>
    apiClient<{ candidate: import('@/models/moderation').JobCandidate; isDuplicate: boolean }>(
      '/admin/moderation/ingest/telegram',
      { method: 'POST', body: data, timeoutMs: 60_000 },
    ),
};
