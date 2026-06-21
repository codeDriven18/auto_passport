import { API_CONFIG } from '@/api/config';

function apiOrigin(): string {
  return API_CONFIG.baseUrl.replace(/\/api\/?$/, '');
}

/**
 * Resolve media URLs from data URLs, absolute URLs, API-relative paths, or upload paths.
 * Use for avatars, banners, logos, and attachment previews across the app.
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

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${apiOrigin()}${path}`;
}

export function isImageMimeType(contentType?: string | null, fileName?: string | null): boolean {
  if (contentType?.startsWith('image/')) return true;
  const name = fileName?.toLowerCase() ?? '';
  return /\.(jpe?g|png|gif|webp|bmp|svg|avif|heic)$/i.test(name);
}
