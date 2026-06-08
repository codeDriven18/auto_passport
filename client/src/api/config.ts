const PRODUCTION_API_URL = 'https://swipejobs.onrender.com/api';
const DEVELOPMENT_API_URL = 'http://localhost:5123/api';

function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function resolveApiUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();

  if (import.meta.env.PROD) {
    if (fromEnv && !/localhost|127\.0\.0\.1/i.test(fromEnv)) {
      return normalizeApiBaseUrl(fromEnv);
    }
    if (fromEnv) {
      console.warn(
        'Ignoring localhost VITE_API_URL in production; using Render API instead.',
        fromEnv,
      );
    }
    return PRODUCTION_API_URL;
  }

  return normalizeApiBaseUrl(fromEnv ?? DEVELOPMENT_API_URL);
}

const finalApiUrl = resolveApiUrl();

export const API_CONFIG = {
  baseUrl: finalApiUrl,
  timeout: 10_000,
} as const;

console.log('API URL =', finalApiUrl);

export const APP_ENV = import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE;
