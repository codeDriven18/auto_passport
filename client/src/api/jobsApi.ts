import { apiClient } from './client';
import { toQueryString } from './utils';
import type { Job, JobQuery, PagedResult } from '@/models/job';

export const jobsApi = {
  search: (query: JobQuery = {}) =>
    apiClient<PagedResult<Job>>(`/jobs${toQueryString({
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      category: query.category,
      city: query.city,
      isRemote: query.isRemote,
      salaryMin: query.salaryMin,
      tags: query.tags,
      companyId: query.companyId,
      companySlug: query.companySlug,
    })}`),

  getById: (id: string) => apiClient<Job>(`/jobs/${id}`),
};
