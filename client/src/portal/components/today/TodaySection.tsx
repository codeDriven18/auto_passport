import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ws from '@/portal/workspace.module.css';

interface TodaySectionProps {
  title: string;
  action?: { label: string; to: string };
  children: ReactNode;
}

export function TodaySection({ title, action, children }: TodaySectionProps) {
  return (
    <section className={ws.todayCard}>
      <header className={ws.todayCardHead}>
        <h2 className={ws.todayCardTitle}>{title}</h2>
        {action && <Link to={action.to} className={ws.todayCardLink}>{action.label}</Link>}
      </header>
      <div className={ws.todayCardBody}>{children}</div>
    </section>
  );
}
