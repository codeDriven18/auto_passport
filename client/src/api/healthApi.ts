import { apiClient } from './client';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  phase: string;
}

export const healthApi = {
  check: () => apiClient<HealthResponse>('/health'),
};
