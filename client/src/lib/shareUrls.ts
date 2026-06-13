export function getJobShareUrl(jobId: string): string {
  if (typeof window === 'undefined') return `/share/jobs/${jobId}`;
  return `${window.location.origin}/share/jobs/${jobId}`;
}

export function getProfileShareUrl(profileId: string): string {
  if (typeof window === 'undefined') return `/share/profile/${profileId}`;
  return `${window.location.origin}/share/profile/${profileId}`;
}

export function getJobCanonicalUrl(jobId: string): string {
  if (typeof window === 'undefined') return `/jobs/${jobId}`;
  return `${window.location.origin}/jobs/${jobId}`;
}

export function getProfileCanonicalUrl(profileId: string): string {
  if (typeof window === 'undefined') return `/p/${profileId}`;
  return `${window.location.origin}/p/${profileId}`;
}

export function resolveShareImageUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('http')) return trimmed;
  if (typeof window !== 'undefined' && trimmed.startsWith('/')) {
    return `${window.location.origin}${trimmed}`;
  }
  return trimmed;
}
