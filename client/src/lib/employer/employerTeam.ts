/** Reserved team roles for multi-user employer access (RBAC ships later). */
export type CompanyTeamRole = 'Owner' | 'Admin' | 'Recruiter' | 'Viewer';

export const COMPANY_TEAM_ROLE_LABELS: Record<CompanyTeamRole, string> = {
  Owner: 'Owner',
  Admin: 'Admin',
  Recruiter: 'Recruiter',
  Viewer: 'Viewer',
};

export const COMPANY_TEAM_ROLE_OPTIONS: CompanyTeamRole[] = [
  'Owner',
  'Admin',
  'Recruiter',
  'Viewer',
];

/** Permission hints for future authorization layer. */
export const COMPANY_TEAM_PERMISSIONS: Record<CompanyTeamRole, {
  manageJobs: boolean;
  managePipeline: boolean;
  messageCandidates: boolean;
  viewAnalytics: boolean;
  manageTeam: boolean;
  manageBilling: boolean;
}> = {
  Owner: {
    manageJobs: true,
    managePipeline: true,
    messageCandidates: true,
    viewAnalytics: true,
    manageTeam: true,
    manageBilling: true,
  },
  Admin: {
    manageJobs: true,
    managePipeline: true,
    messageCandidates: true,
    viewAnalytics: true,
    manageTeam: true,
    manageBilling: false,
  },
  Recruiter: {
    manageJobs: false,
    managePipeline: true,
    messageCandidates: true,
    viewAnalytics: true,
    manageTeam: false,
    manageBilling: false,
  },
  Viewer: {
    manageJobs: false,
    managePipeline: false,
    messageCandidates: false,
    viewAnalytics: true,
    manageTeam: false,
    manageBilling: false,
  },
};
