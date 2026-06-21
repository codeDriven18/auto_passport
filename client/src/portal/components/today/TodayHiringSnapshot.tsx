import type { HiringSnapshot } from '@/lib/employer/todayWorkspace';
import { TodaySection } from '@/portal/components/today/TodaySection';
import ws from '@/portal/workspace.module.css';

interface TodayHiringSnapshotProps {
  snapshot: HiringSnapshot;
}

export function TodayHiringSnapshot({ snapshot }: TodayHiringSnapshotProps) {
  const rows = [
    { label: 'Active roles', value: snapshot.activeRoles },
    { label: 'Candidates in pipeline', value: snapshot.candidatesInPipeline },
    { label: 'Interviews this week', value: snapshot.interviewsThisWeek },
    { label: 'Offers sent', value: snapshot.offersSent },
  ];

  return (
    <TodaySection title="Hiring snapshot">
      <dl className={ws.todaySnapshot}>
        {rows.map((row) => (
          <div key={row.label} className={ws.todaySnapshotRow}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </TodaySection>
  );
}
