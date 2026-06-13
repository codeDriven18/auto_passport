import { ApiError } from '@/api/client';

export function getFriendlyErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiError) {
    if (error.body && typeof error.body === 'object') {
      const body = error.body as { error?: string; message?: string; title?: string };
      if (body.error?.trim()) return body.error.trim();
      if (body.message?.trim()) return body.message.trim();
      if (body.title?.trim()) return body.title.trim();
    }

    if (error.status === 401) return 'Please sign in to continue.';
    if (error.status === 403) return 'You do not have permission to do that.';
    if (error.status === 404) return 'We could not find what you were looking for.';
    if (error.status >= 500) return 'Our servers are having trouble. Please try again shortly.';
  }

  if (error instanceof Error && error.message && !error.message.startsWith('Failed to fetch')) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Network error. Check your connection and try again.';
  }

  return fallback;
}
