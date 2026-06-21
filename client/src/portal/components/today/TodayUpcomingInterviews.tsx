import { Link } from 'react-router-dom';
import type { InterviewDayGroup } from '@/lib/employer/todayWorkspace';
import { formatInterviewTime } from '@/lib/employer/todayWorkspace';
import { candidateProfilePath } from '@/lib/employer/hiringNavigation';
import { TodaySection } from '@/portal/components/today/TodaySection';
import ws from '@/portal/workspace.module.css';

interface TodayUpcomingInterviewsProps {
  groups: InterviewDayGroup[];
}

export function TodayUpcomingInterviews({ groups }: TodayUpcomingInterviewsProps) {
  const hasInterviews = groups.some((g) => g.items.length > 0);

  return (
    <TodaySection
      title="Upcoming interviews"
      action={{ label: 'Pipeline', to: '/portal/pipeline' }}
    >
      {!hasInterviews ? (
        <p className={ws.todayInlineEmpty}>Nothing scheduled today.</p>
      ) : (
        <div className={ws.todayInterviewGroups}>
          {groups.map((group) => (
            <div key={group.label} className={ws.todayInterviewGroup}>
              <p className={ws.todayInterviewDay}>{group.label}</p>
              <ul className={ws.todayInterviewList}>
                {group.items.map((app) => (
                  <li key={app.id}>
                    <Link
                      to={candidateProfilePath(app.id, { from: 'today', jobId: app.jobId })}
                      className={ws.todayInterviewRow}
                    >
                      <span className={ws.todayInterviewTime}>
                        {formatInterviewTime(app.interviewScheduledAtUtc!)}
                      </span>
                      <span className={ws.todayInterviewName}>{app.applicantName}</span>
                      <span className={ws.todayInterviewRole}>{app.jobTitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </TodaySection>
  );
}
