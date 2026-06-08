import { API_CONFIG } from './config';

function resolveNotificationsHubUrl(): string {
  return new URL('/hubs/notifications', API_CONFIG.baseUrl).toString();
}

export const HUB_CONFIG = {
  notificationsUrl: resolveNotificationsHubUrl(),
} as const;
