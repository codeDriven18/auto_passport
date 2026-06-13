import type { UserProfile } from '@/models/userProfile';

export interface VerificationSignal {
  id: string;
  label: string;
  met: boolean;
}

export function getVerificationSignals(profile: UserProfile): VerificationSignal[] {
  return [
    { id: 'email', label: 'Verified Email', met: Boolean(profile.email?.trim()) },
    { id: 'phone', label: 'Verified Phone', met: Boolean(profile.phone?.trim()) },
    { id: 'resume', label: 'Resume Uploaded', met: Boolean(profile.resumeUrl || profile.resumeFileName) },
    { id: 'linkedin', label: 'LinkedIn Connected', met: Boolean(profile.linkedInUrl?.trim()) },
    { id: 'github', label: 'GitHub Connected', met: Boolean(profile.gitHubUrl?.trim()) },
    { id: 'portfolio', label: 'Portfolio Added', met: Boolean(profile.websiteUrl?.trim()) },
  ];
}

/** Verified when email + resume + at least one professional link/signal. */
export function isVerifiedCandidate(profile: UserProfile): boolean {
  const signals = getVerificationSignals(profile);
  const email = signals.find((s) => s.id === 'email')?.met;
  const resume = signals.find((s) => s.id === 'resume')?.met;
  const linked = signals.some((s) => ['linkedin', 'github', 'portfolio'].includes(s.id) && s.met);
  return Boolean(email && resume && linked);
}
