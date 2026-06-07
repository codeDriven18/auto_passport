import { apiClient } from './client';
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from '@/models/auth';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient<AuthResponse>('/auth/register', { method: 'POST', body: data, skipAuth: true }),

  login: (data: LoginRequest) =>
    apiClient<AuthResponse>('/auth/login', { method: 'POST', body: data, skipAuth: true }),

  refresh: (refreshToken: string) =>
    apiClient<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    }),

  logout: (refreshToken: string) =>
    apiClient<void>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    }),

  forgotPassword: (email: string) =>
    apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      skipAuth: true,
    }),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient<void>('/auth/change-password', { method: 'POST', body: data }),

  me: () => apiClient<AuthUser>('/auth/me'),
};
