import { useEffect, useState } from "react";
import { api } from "../api";
import type { SummaryStats, TimeSeriesStats } from "../types";
import { Loading } from "../components/Loading";

export function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [series, setSeries] = useState<TimeSeriesStats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSummary(), api.getTimeSeries(days)])
      .then(([sum, ts]) => {
        setSummary(sum);
        setSeries(ts);
      })
      .finally(() => setLoading(false));
  }, [days]);

  if (loading || !summary || !series) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel stack">
        <div className="section-title">Analytics</div>
        <div className="grid-3">
          <div className="panel">
            <div className="inline-note">Bookmarked</div>
            <div className="section-title">{summary.bookmarkedCount}</div>
          </div>
          <div className="panel">
            <div className="inline-note">Applied</div>
            <div className="section-title">{summary.appliedCount}</div>
          </div>
          <div className="panel">
            <div className="inline-note">Total jobs</div>
            <div className="section-title">
              {summary.countsByBranch.reduce((sum, item) => sum + item.count, 0)}
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="panel">
            <div className="section-title">By branch</div>
            <table className="table">
              <tbody>
                {summary.countsByBranch.map((item) => (
                  <tr key={item.key}>
                    <td>{item.key}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel">
            <div className="section-title">By status</div>
            <table className="table">
              <tbody>
                {summary.countsByStatus.map((item) => (
                  <tr key={item.key}>
                    <td>{item.key}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid-2">
          <div className="panel">
            <div className="section-title">Top cities</div>
            <table className="table">
              <tbody>
                {summary.topCities.map((item) => (
                  <tr key={item.key}>
                    <td>{item.key}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel">
            <div className="section-title">Top tags</div>
            <table className="table">
              <tbody>
                {summary.topTags.map((item) => (
                  <tr key={item.key}>
                    <td>{item.key}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="section-title">Top sources</div>
          <table className="table">
            <tbody>
              {summary.topSources.map((item) => (
                <tr key={item.key}>
                  <td>{item.key}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="section-title">Jobs added per day</div>
          <div style={{ marginBottom: 12 }}>
            <label className="inline-note">Days</label>
            <select className="select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={30}>30</option>
              <option value={90}>90</option>
            </select>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {series.jobsPerDay.map((item) => (
                <tr key={item.key}>
                  <td>{item.key}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
