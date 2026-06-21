import { API_CONFIG } from '@/api/config';

/** Resolve image URLs from uploads, data URLs, absolute paths, or external hosts. */
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

  if (trimmed.startsWith('/')) {
    const origin = API_CONFIG.baseUrl.replace(/\/api\/?$/, '');
    return `${origin}${trimmed}`;
  }

  return trimmed;
}

export function isImageMimeType(contentType?: string | null, fileName?: string | null): boolean {
  if (contentType?.startsWith('image/')) return true;
  const name = fileName?.toLowerCase() ?? '';
  return /\.(jpe?g|png|gif|webp|bmp|svg|avif|heic)$/i.test(name);
}
