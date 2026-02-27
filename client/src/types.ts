export type JobBranch = "Gigs" | "ItJobs";
export type EmploymentType =
  | "Gig"
  | "PartTime"
  | "FullTime"
  | "Contract"
  | "Internship";
export type JobStatus = "Active" | "Archived";

export interface Tag {
  id: number;
  name: string;
}

export interface Source {
  id: number;
  name: string;
  url?: string | null;
}

export interface Preference {
  isBookmarked: boolean;
  isApplied: boolean;
  notes?: string | null;
}

export interface JobListItem {
  id: string;
  branch: JobBranch;
  title: string;
  companyOrPerson: string;
  city?: string | null;
  country?: string | null;
  isRemote: boolean;
  payMin?: number | null;
  payMax?: number | null;
  currency?: string | null;
  postedAt: string;
  status: JobStatus;
  tags: Tag[];
  source?: { id: number; name: string } | null;
  preference: Preference;
}

export interface JobDetail extends JobListItem {
  description: string;
  employmentType?: EmploymentType | null;
  durationDays?: number | null;
  applyUrl?: string | null;
  contact?: string | null;
  source?: Source | null;
}

export interface JobsResponse {
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
  items: JobListItem[];
}

export interface SummaryStats {
  countsByBranch: { key: string; count: number }[];
  countsByStatus: { key: string; count: number }[];
  topCities: { key: string; count: number }[];
  topTags: { key: string; count: number }[];
  topSources: { key: string; count: number }[];
  bookmarkedCount: number;
  appliedCount: number;
}

export interface TimeSeriesStats {
  days: number;
  jobsPerDay: { key: string; count: number }[];
}

export interface ImportResult {
  inserted: number;
  updated: number;
  failed: number;
  errors: { rowNumber: number; messages: string[] }[];
}
