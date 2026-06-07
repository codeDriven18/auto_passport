import { API_CONFIG } from './config';

function resolveNotificationsHubUrl(): string {
  const explicit = import.meta.env.VITE_HUB_BASE_URL;
  if (explicit) return explicit;

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? API_CONFIG.baseUrl;
  if (apiBase.startsWith('http')) {
    return `${new URL(apiBase).origin}/hubs/notifications`;
  }

  return '/hubs/notifications';
}

export const HUB_CONFIG = {
  notificationsUrl: resolveNotificationsHubUrl(),
} as const;
