export type RefreshResult = 'success' | 'rejected' | 'transient';

export const ACCESS_REFRESH_BUFFER_MS = 60_000;
export const PROACTIVE_REFRESH_CHECK_MS = 30_000;
