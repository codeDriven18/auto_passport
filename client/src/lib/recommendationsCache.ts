import type { Job } from '@/models/job';

const CACHE_KEY = 'swipejobs:recommendations:v1';
const CACHE_TTL_MS = 1000 * 60 * 30;

interface RecommendationsCache {
  jobs: Job[];
  savedAt: number;
}

export function readRecommendationsCache(): Job[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecommendationsCache;
    if (!Array.isArray(parsed.jobs)) return [];
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return parsed.jobs;
    return parsed.jobs;
  } catch {
    return [];
  }
}

export function writeRecommendationsCache(jobs: Job[]): void {
  try {
    const payload: RecommendationsCache = { jobs, savedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
}
