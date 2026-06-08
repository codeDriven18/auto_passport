const AZURE_API_ORIGIN =
  'https://swipejobs-afexcuape8ecexdk.eastasia-01.azurewebsites.net';
const PRODUCTION_API_URL = `${AZURE_API_ORIGIN}/api`;
const DEVELOPMENT_API_URL = 'http://localhost:5123/api';

function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function isInvalidProductionApiUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1|onrender\.com|netlify\.app/i.test(url);
}

function resolveApiUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();

  if (import.meta.env.PROD) {
    if (fromEnv && !isInvalidProductionApiUrl(fromEnv)) {
      return normalizeApiBaseUrl(fromEnv);
    }
    if (fromEnv) {
      console.warn(
        'Ignoring invalid VITE_API_URL in production; using Azure API instead.',
        fromEnv,
      );
    }
    return PRODUCTION_API_URL;
  }

  return normalizeApiBaseUrl(fromEnv ?? DEVELOPMENT_API_URL);
}

const apiUrl = resolveApiUrl();

export const API_CONFIG = {
  baseUrl: apiUrl,
  timeout: 10_000,
} as const;

if (import.meta.env.PROD) {
  console.log('Production API URL:', apiUrl);
}

export const APP_ENV = import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE;
