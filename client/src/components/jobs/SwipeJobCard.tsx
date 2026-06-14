import type { Job } from '@/models/job';
import { SwipeCard } from '@/components/jobs/SwipeCard';

interface SwipeJobCardProps {
  job: Job;
  interactive?: boolean;
  attachedDock?: boolean;
}

/** Swipe deck card — dedicated dating-app style layout. */
export function SwipeJobCard({ job, interactive = true, attachedDock = true }: SwipeJobCardProps) {
  void interactive;
  return <SwipeCard job={job} attachedDock={attachedDock} />;
}
