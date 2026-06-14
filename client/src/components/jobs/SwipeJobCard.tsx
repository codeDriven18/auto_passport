import type { Job } from '@/models/job';
import { OpportunityCard } from '@/components/jobs/OpportunityCard';

interface SwipeJobCardProps {
  job: Job;
  interactive?: boolean;
}

/** Swipe deck card — delegates to the unified OpportunityCard. */
export function SwipeJobCard({ job, interactive = true }: SwipeJobCardProps) {
  return (
    <OpportunityCard job={job} variant="swipe" interactive={interactive} />
  );
}
