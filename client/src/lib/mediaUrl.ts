import { API_CONFIG } from '@/api/config';

function apiOrigin(): string {
  return API_CONFIG.baseUrl.replace(/\/api\/?$/, '');
}

function frontendOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return apiOrigin();
}

/** Private blob keys stored in DB (e.g. `{conversationId}/{guid}.jpg`) — not directly fetchable. */
export function isMediaStorageKey(url?: string | null): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return false;
  if (
    trimmed.startsWith('data:')
    || trimmed.startsWith('blob:')
    || trimmed.startsWith('http://')
    || trimmed.startsWith('https://')
    || trimmed.startsWith('/')
  ) {
    return false;
  }
  return trimmed.includes('/');
}

/**
 * Resolve media URLs from data URLs, absolute URLs, API paths, frontend static assets, or upload paths.
 * Returns undefined for private storage keys (use authenticated download endpoints instead).
 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;

  if (
    trimmed.startsWith('data:')
    || trimmed.startsWith('blob:')
    || trimmed.startsWith('http://')
    || trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  if (isMediaStorageKey(trimmed)) {
    return undefined;
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (path.startsWith('/api/')) {
    return `${apiOrigin()}${path}`;
  }

  return `${frontendOrigin()}${path}`;
}

export function isImageMimeType(contentType?: string | null, fileName?: string | null): boolean {
  if (contentType?.startsWith('image/')) return true;
  const name = fileName?.toLowerCase() ?? '';
  return /\.(jpe?g|png|gif|webp|bmp|svg|avif|heic)$/i.test(name);
}
