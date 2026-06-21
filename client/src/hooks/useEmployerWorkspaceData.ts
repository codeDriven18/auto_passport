import { useCallback, useEffect, useState } from 'react';
import { portalApi } from '@/api/portalApi';
import { portalMessagingApi } from '@/api/messagingApi';
import type { ConversationSummary } from '@/models/messaging';
import type { PortalApplication, PortalJob } from '@/models/portal';
import type { PortalWorkspaceActivity } from '@/models/workspaceActivity';

export function useEmployerWorkspaceData() {
  const [applications, setApplications] = useState<PortalApplication[]>([]);
  const [jobs, setJobs] = useState<PortalJob[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activity, setActivity] = useState<PortalWorkspaceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setFailed(false);
    return Promise.all([
      portalApi.getApplications(),
      portalApi.getJobs(),
      portalMessagingApi.listConversations(),
      portalApi.getWorkspaceActivity(30).catch(() => [] as PortalWorkspaceActivity[]),
    ])
      .then(([appList, jobList, conversationList, activityList]) => {
        setApplications(appList);
        setJobs(jobList);
        setConversations(conversationList);
        setActivity(activityList);
      })
      .catch(() => {
        setApplications([]);
        setJobs([]);
        setConversations([]);
        setActivity([]);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    applications,
    jobs,
    conversations,
    activity,
    activeJobs: jobs.filter((job) => job.isActive),
    loading,
    failed,
    refresh,
  };
}
