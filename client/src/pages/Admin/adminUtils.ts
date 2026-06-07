import type { Job } from '@/models/job';
import { CompanyStatus, CompanyStatusLabels } from '@/models/operations';
import type { Company } from '@/models/company';

export function jobStatusLabel(job: Job): 'Active' | 'Archived' | 'Inactive' {
  if (job.isArchived) return 'Archived';
  if (job.isActive) return 'Active';
  return 'Inactive';
}

export function jobStatusClass(job: Job, styles: Record<string, string>): string {
  const label = jobStatusLabel(job);
  if (label === 'Active') return styles.statusActive;
  if (label === 'Archived') return styles.statusArchived;
  return styles.statusInactive;
}

export function companyStatusLabel(status: CompanyStatus): string {
  return CompanyStatusLabels[status] ?? 'Unknown';
}

export function companyStatusClass(status: CompanyStatus, styles: Record<string, string>): string {
  switch (status) {
    case CompanyStatus.Approved:
      return styles.statusActive;
    case CompanyStatus.Pending:
      return styles.statusPending;
    case CompanyStatus.Rejected:
      return styles.statusInactive;
    case CompanyStatus.Suspended:
      return styles.statusArchived;
    default:
      return styles.statusInactive;
  }
}

export function isCompanyApproved(company: Company): boolean {
  return company.status === CompanyStatus.Approved && company.isActive;
}

