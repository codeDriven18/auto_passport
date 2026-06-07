import { apiClient } from './client';
import type { Tag } from '@/models/tag';

export const tagsApi = {
  getAll: () => apiClient<Tag[]>('/tags'),
};
