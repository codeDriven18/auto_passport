import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { JobListItem, SummaryStats } from "../types";
import { Loading } from "../components/Loading";

export function ProfilePage() {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [bookmarks, setBookmarks] = useState<JobListItem[]>([]);
  const [applied, setApplied] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [summary, jobs] = await Promise.all([
      api.getSummary(),
      api.getJobs("?page=1&pageSize=100")
    ]);
    setStats(summary);
    setBookmarks(jobs.items.filter((job) => job.preference.isBookmarked));
    setApplied(jobs.items.filter((job) => job.preference.isApplied));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="page">
      <section className="profile-hero">
        <div>
          <div className="eyebrow">Profile</div>
          <h1>Local account</h1>
          <p>Your saved jobs, applied list, and platform stats live here.</p>
        </div>
        <button className="button big" onClick={load}>
          Refresh
        </button>
      </section>

      <div className="profile-grid">
        <div className="panel">
          <div className="section-title">Overview</div>
          <div className="stack">
            <div className="profile-metric">
              <span>Bookmarked</span>
              <strong>{stats.bookmarkedCount}</strong>
            </div>
            <div className="profile-metric">
              <span>Applied</span>
              <strong>{stats.appliedCount}</strong>
            </div>
            <div className="profile-metric">
              <span>Total jobs</span>
              <strong>{stats.countsByBranch.reduce((sum, item) => sum + item.count, 0)}</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="section-title">Top locations</div>
          <div className="stack">
            {stats.topCities.slice(0, 5).map((item) => (
              <div key={item.key} className="profile-row">
                <span>{item.key}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-title">Top tags</div>
          <div className="job-meta">
            {stats.topTags.slice(0, 8).map((item) => (
              <span key={item.key} className="badge">
                {item.key}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="section-title">Bookmarked jobs</div>
        {bookmarks.length === 0 ? (
          <div className="inline-note">No bookmarks yet.</div>
        ) : (
          <div className="stack">
            {bookmarks.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-title">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </div>
                <div className="job-meta">
                  <span>{job.companyOrPerson}</span>
                  <span>{job.city || ""}</span>
                  {job.isRemote && <span className="badge">Remote</span>}
                  <span className="badge">{job.branch}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="section-title">Applied jobs</div>
        {applied.length === 0 ? (
          <div className="inline-note">No applied jobs yet.</div>
        ) : (
          <div className="stack">
            {applied.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-title">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </div>
                <div className="job-meta">
                  <span>{job.companyOrPerson}</span>
                  <span>{job.city || ""}</span>
                  {job.isRemote && <span className="badge">Remote</span>}
                  <span className="badge">{job.branch}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
