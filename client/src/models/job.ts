import type { JobCategory, JobLevel } from './enums';
import type { Tag } from './tag';

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  company: string;
  companySlug?: string;
  location?: string;
  city?: string;
  category: JobCategory;
  level: JobLevel;
  isRemote: boolean;
  isActive: boolean;
  isArchived?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  expiresAt?: string;
  externalUrl?: string;
  sourceId: string;
  sourceName?: string;
  tags: Tag[];
  trendingBadges?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface JobQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  category?: JobCategory;
  city?: string;
  isRemote?: boolean;
  salaryMin?: number;
  tags?: string;
  companyId?: string;
  companySlug?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  company: string;
  location?: string;
  city?: string;
  category: JobCategory;
  level: JobLevel;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  sourceId: string;
  tagIds?: string[];
}
