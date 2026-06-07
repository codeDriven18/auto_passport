import type { Education, Experience, Skill } from '@/models/userProfile';

export interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  resumeName: string;
  educations: Education[];
  skills: Skill[];
  experiences: Experience[];
}

export interface ProfileProgress {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
  missing: string[];
}

const STEPS = ['Personal info', 'Resume', 'Background'] as const;

function filledEducation(e: Education) {
  return Boolean(e.institution.trim() || e.degree.trim());
}

function filledSkill(s: Skill) {
  return Boolean(s.name.trim());
}

function filledExperience(e: Experience) {
  return Boolean(e.company.trim() || e.title.trim());
}

export function calculateProfileProgress(state: ProfileFormState): ProfileProgress {
  const checks: { label: string; done: boolean; weight: number }[] = [
    { label: 'First name', done: Boolean(state.firstName.trim()), weight: 8 },
    { label: 'Last name', done: Boolean(state.lastName.trim()), weight: 8 },
    { label: 'Email', done: Boolean(state.email.trim()), weight: 12 },
    { label: 'Phone', done: Boolean(state.phone.trim()), weight: 12 },
    { label: 'Location', done: Boolean(state.location.trim()), weight: 5 },
    { label: 'Bio', done: Boolean(state.bio.trim()), weight: 5 },
    { label: 'Resume', done: Boolean(state.resumeName.trim()), weight: 15 },
    {
      label: 'Education, skill, or experience',
      done: state.educations.some(filledEducation)
        || state.skills.some(filledSkill)
        || state.experiences.some(filledExperience),
      weight: 35,
    },
  ];

  const earned = checks.filter((c) => c.done).reduce((sum, c) => sum + c.weight, 0);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);

  let completedSteps = 0;
  const personalDone = checks.slice(0, 6).every((c) => c.done);
  const resumeDone = checks[6].done;
  const backgroundDone = checks[7].done;
  if (personalDone) completedSteps++;
  if (resumeDone) completedSteps++;
  if (backgroundDone) completedSteps++;

  return {
    percentage: earned,
    completedSteps,
    totalSteps: STEPS.length,
    missing,
  };
}

export { STEPS as PROFILE_STEPS };
