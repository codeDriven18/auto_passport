import { apiClient } from './client';
import type {
  ProfileCompleteness,
  UpdateUserProfileRequest,
  UserProfile,
} from '@/models/userProfile';
import type { PublicProfile } from '@/models/publicProfile';

export const profilesApi = {
  getMe: () => apiClient<UserProfile>('/profiles/me'),

  getPublic: (id: string) => apiClient<PublicProfile>(`/profiles/public/${id}`, { skipAuth: true }),

  updateMe: (data: UpdateUserProfileRequest) =>
    apiClient<UserProfile>('/profiles/me', { method: 'PUT', body: data }),

  checkMyCompleteness: () =>
    apiClient<ProfileCompleteness>('/profiles/me/completeness'),
};

export { uploadProfileAvatar, removeProfileAvatar } from './profileUploadApi';
