const ONBOARDING_KEY = 'swipejobs-onboarding-complete';

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function setOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
