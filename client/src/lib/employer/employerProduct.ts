/**
 * Employer portal product architecture — recruiting OS mental model.
 *
 * Core workflows (build order):
 * 1. Dashboard (attention)
 * 2. Pipeline (kanban)
 * 3. Candidate profile
 * 4. Messages (hiring-integrated)
 *
 * Supporting: Jobs, Company, Analytics, Settings
 *
 * Product questions every screen should answer:
 * - What jobs am I hiring for?
 * - Which candidates need attention?
 * - Where is each candidate in the pipeline?
 * - Who messaged me?
 * - What interviews are scheduled?
 * - What hiring actions should I take next?
 */

export const EMPLOYER_CORE_ROUTES = [
  '/portal',
  '/portal/pipeline',
  '/portal/applications',
  '/portal/messages',
] as const;

export const EMPLOYER_SUPPORT_ROUTES = [
  '/portal/jobs',
  '/portal/analytics',
  '/portal/company',
  '/portal/settings',
] as const;
