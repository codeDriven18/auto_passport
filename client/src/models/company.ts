export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  location: string;
  companySize: string;
  logoUrl?: string;
  website?: string;
  status: import('./operations').CompanyStatus;
  isActive: boolean;
  openJobsCount: number;
  createdAt: string;
  updatedAt?: string;
}
