export const PROFILE_SUBSTANTIALLY_COMPLETE_KEY = 'swipejobs-profile-substantially-complete';

export function markProfileSubstantiallyComplete(): void {
  try {
    localStorage.setItem(PROFILE_SUBSTANTIALLY_COMPLETE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function hasPersistedSubstantialCompletion(): boolean {
  try {
    return localStorage.getItem(PROFILE_SUBSTANTIALLY_COMPLETE_KEY) === '1';
  } catch {
    return false;
  }
}
