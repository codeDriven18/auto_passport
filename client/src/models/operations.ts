export enum CompanyStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Suspended = 3,
}

export const CompanyStatusLabels: Record<CompanyStatus, string> = {
  [CompanyStatus.Pending]: 'Pending',
  [CompanyStatus.Approved]: 'Approved',
  [CompanyStatus.Rejected]: 'Rejected',
  [CompanyStatus.Suspended]: 'Suspended',
};

export enum AuditAction {
  UserCreated = 0,
  Login = 1,
  Logout = 2,
  RoleChanged = 3,
  JobCreated = 4,
  JobUpdated = 5,
  JobArchived = 6,
  JobUnarchived = 7,
  JobActivated = 8,
  JobDeactivated = 9,
  CompanyCreated = 10,
  CompanyStatusChanged = 11,
  NotificationCreated = 12,
  AdminAction = 13,
}

export const AuditActionLabels: Record<AuditAction, string> = {
  [AuditAction.UserCreated]: 'User Created',
  [AuditAction.Login]: 'Login',
  [AuditAction.Logout]: 'Logout',
  [AuditAction.RoleChanged]: 'Role Changed',
  [AuditAction.JobCreated]: 'Job Created',
  [AuditAction.JobUpdated]: 'Job Updated',
  [AuditAction.JobArchived]: 'Job Archived',
  [AuditAction.JobUnarchived]: 'Job Unarchived',
  [AuditAction.JobActivated]: 'Job Activated',
  [AuditAction.JobDeactivated]: 'Job Deactivated',
  [AuditAction.CompanyCreated]: 'Company Created',
  [AuditAction.CompanyStatusChanged]: 'Company Status Changed',
  [AuditAction.NotificationCreated]: 'Notification Created',
  [AuditAction.AdminAction]: 'Admin Action',
};

export enum AuditEntityType {
  User = 0,
  Job = 1,
  Company = 2,
  Notification = 3,
  Application = 4,
  System = 5,
}

export const AuditEntityTypeLabels: Record<AuditEntityType, string> = {
  [AuditEntityType.User]: 'User',
  [AuditEntityType.Job]: 'Job',
  [AuditEntityType.Company]: 'Company',
  [AuditEntityType.Notification]: 'Notification',
  [AuditEntityType.Application]: 'Application',
  [AuditEntityType.System]: 'System',
};
