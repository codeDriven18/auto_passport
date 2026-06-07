export enum UserRole {
  JobSeeker = 0,
  Company = 1,
  Admin = 2,
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.JobSeeker]: 'Job Seeker',
  [UserRole.Company]: 'Company',
  [UserRole.Admin]: 'Admin',
};

export interface AuthUser {
  id: string;
  email: string;
  profileId: string | null;
  role: UserRole;
  companyId: string | null;
  companyName: string | null;
  companyStatus: import('./operations').CompanyStatus | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: AuthUser;
}

export type AccountType = 'jobseeker' | 'company';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  accountType?: AccountType;
  companyName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
