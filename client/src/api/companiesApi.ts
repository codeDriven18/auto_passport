import { apiClient } from './client';
import type { Company } from '@/models/company';

export const companiesApi = {
  getAll: () => apiClient<Company[]>('/companies'),
  getBySlug: (slug: string) => apiClient<Company>(`/companies/${encodeURIComponent(slug)}`),
};
