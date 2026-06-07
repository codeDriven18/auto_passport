export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
} as const;

export const APP_ENV = import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE;
