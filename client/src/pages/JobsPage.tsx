import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api";
import type { JobListItem } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import { Loading } from "../components/Loading";
import { useToast } from "../components/ToastProvider";

const defaultPageSize = 8;

const featuredOffers = {
  Gigs: [
    {
      id: "g1",
      title: "Night market crew (2 days)",
      subtitle: "Rapid setup + breakdown",
      pay: "120-150 USD",
      image: "/ai-gig-1.svg",
      tags: ["Fast pay", "City center", "Team"]
    },
    {
      id: "g2",
      title: "Airport runner (1 day)",
      subtitle: "Parcel handoff support",
      pay: "80-110 USD",
      image: "/ai-gig-2.svg",
      tags: ["Day shift", "Logistics"]
    }
  ],
  ItJobs: [
    {
      id: "i1",
      title: "Junior Cloud Ops",
      subtitle: "Monitoring + incident response",
      pay: "1800-2400 EUR",
      image: "/ai-it-1.svg",
      tags: ["AWS", "On-call", "Junior"]
    },
    {
      id: "i2",
      title: "React UI Engineer",
      subtitle: "Design systems + UX polish",
      pay: "2000-2600 EUR",
      image: "/ai-it-2.svg",
      tags: ["React", "TypeScript"]
    }
  ]
} as const;

export function JobsPage({ branch }: { branch: "Gigs" | "ItJobs" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { push } = useToast();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<{ id: number; name: string }[]>([]);

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput);

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("branch", branch);
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    if (!params.get("page")) params.set("page", "1");
    if (!params.get("pageSize")) params.set("pageSize", defaultPageSize.toString());
    return `?${params.toString()}`;
  }, [searchParams, debouncedSearch, branch]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .getJobs(queryString)
      .then((data) => {
        setJobs(data.items);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [queryString]);

  useEffect(() => {
    api.getSources().then(setSources).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") ?? "")) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const currentPage = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? defaultPageSize.toString());

  const goToPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", next.toString());
    setSearchParams(params);
  };

  const onToggle = async (jobId: string, type: "bookmark" | "applied") => {
    try {
      if (type === "bookmark") {
        await api.toggleBookmark(jobId);
      } else {
        await api.toggleApplied(jobId);
      }
      push(type === "bookmark" ? "Bookmark updated" : "Applied updated");
      const updated = await api.getJobs(queryString);
      setJobs(updated.items);
      setTotalPages(updated.totalPages);
      setTotalCount(updated.totalCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      push(message);
    }
  };

  const exportFile = async (format: "csv" | "json") => {
    const res = await api.exportJobs(queryString, format);
    if (!res.ok) {
      push("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jobs-export.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Local-first job board</div>
          <h1>{branch === "Gigs" ? "Fast gigs, paid by the day." : "Focused IT roles, junior and mid."}</h1>
          <p>
            Post instantly, filter sharply, and track your favorites. Everything runs locally with SQLite
            persistence.
          </p>
          <div className="actions">
            <Link className="button accent big pulse" to={`/jobs/new?branch=${branch}`}>
              Post a job
            </Link>
            <Link className="button secondary big" to="/import">
              Import data
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-metric">
            <span className="inline-note">Available now</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="hero-metric">
            <span className="inline-note">Branch</span>
            <strong>{branch === "Gigs" ? "Gigs" : "IT Jobs"}</strong>
          </div>
          <div className="hero-metric">
            <span className="inline-note">API status</span>
            <strong>Localhost ready</strong>
          </div>
        </div>
      </section>

      <section className="panel featured">
        <div className="section-title">Featured offers</div>
        <div className="featured-grid">
          {featuredOffers[branch].map((offer) => (
            <div key={offer.id} className="featured-card">
              <div className="featured-image">
                <img src={offer.image} alt="AI concept" />
              </div>
              <div className="featured-info">
                <div className="job-title">{offer.title}</div>
                <div className="inline-note">{offer.subtitle}</div>
                <div className="featured-pay">{offer.pay}</div>
                <div className="job-meta">
                  {offer.tags.map((tag) => (
                    <span key={tag} className="badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="tabs" role="tablist">
        <Link className={`tab ${branch === "Gigs" ? "active" : ""}`} to="/gigs">
          Gigs
        </Link>
        <Link className={`tab ${branch === "ItJobs" ? "active" : ""}`} to="/it">
          IT Jobs
        </Link>
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="panel">
            <div className="grid-2">
              <div>
                <label className="inline-note">Search</label>
                <input
                  className="input"
                  placeholder="Title, company, description"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <div>
                <label className="inline-note">Sort</label>
                <select
                  className="select"
                  value={searchParams.get("sort") ?? "newest"}
                  onChange={(e) => updateParam("sort", e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="pay_high">Pay high → low</option>
                  <option value="pay_low">Pay low → high</option>
                </select>
              </div>
            </div>

            <div className="actions" style={{ marginTop: 12 }}>
              <Link className="button accent" to={`/jobs/new?branch=${branch}`}>
                Create Job
              </Link>
              <button className="button secondary" onClick={() => exportFile("csv")}>
                Export CSV
              </button>
              <button className="button secondary" onClick={() => exportFile("json")}>
                Export JSON
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="section-title">Jobs ({totalCount})</div>
            {loading ? (
              <div className="stack">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="job-card">
                    <div className="skeleton" style={{ width: "40%" }} />
                    <div className="skeleton" style={{ width: "70%" }} />
                    <div className="skeleton" style={{ width: "30%" }} />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="error-box">{error}</div>
            ) : (
              <div className="stack">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-title">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </div>
                    <div className="job-meta">
                      <span>{job.companyOrPerson}</span>
                      <span>{job.city || ""}</span>
                      {job.isRemote && <span className="badge">Remote</span>}
                      {job.payMin || job.payMax ? (
                        <span className="badge">
                          {job.payMin ?? "?"} - {job.payMax ?? "?"} {job.currency}
                        </span>
                      ) : null}
                      <span className="badge">{new Date(job.postedAt).toLocaleDateString()}</span>
                      {job.source?.name && <span className="badge">{job.source.name}</span>}
                    </div>
                    <div className="actions">
                      <button
                        className={`button ${job.preference.isBookmarked ? "accent" : "secondary"}`}
                        onClick={() => onToggle(job.id, "bookmark")}
                      >
                        {job.preference.isBookmarked ? "Bookmarked" : "Bookmark"}
                      </button>
                      <button
                        className={`button ${job.preference.isApplied ? "accent" : "secondary"}`}
                        onClick={() => onToggle(job.id, "applied")}
                      >
                        {job.preference.isApplied ? "Applied" : "Mark applied"}
                      </button>
                      <Link className="button ghost" to={`/jobs/${job.id}`}>
                        View
                      </Link>
                    </div>
                    {job.tags.length > 0 && (
                      <div className="job-meta">
                        {job.tags.map((tag) => (
                          <span key={tag.id} className="badge">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel pagination">
            <div className="inline-note">
              Page {currentPage} of {totalPages} • {pageSize} per page
            </div>
            <div className="actions">
              <button
                className="button secondary"
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                Prev
              </button>
              <button
                className="button secondary"
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="panel" aria-label="Filters">
          <div className="section-title">Filters</div>
          <div className="form-grid">
            <div>
              <label className="inline-note">City</label>
              <input
                className="input"
                value={searchParams.get("city") ?? ""}
                onChange={(e) => updateParam("city", e.target.value)}
              />
            </div>
            <div>
              <label className="inline-note">Country</label>
              <input
                className="input"
                value={searchParams.get("country") ?? ""}
                onChange={(e) => updateParam("country", e.target.value)}
              />
            </div>
            <div>
              <label className="inline-note">Remote</label>
              <select
                className="select"
                value={searchParams.get("remote") ?? ""}
                onChange={(e) => updateParam("remote", e.target.value)}
              >
                <option value="">Any</option>
                <option value="true">Remote</option>
                <option value="false">On-site</option>
              </select>
            </div>
            <div>
              <label className="inline-note">Employment Type</label>
              <select
                className="select"
                value={searchParams.get("employmentType") ?? ""}
                onChange={(e) => updateParam("employmentType", e.target.value)}
              >
                <option value="">Any</option>
                <option value="Gig">Gig</option>
                <option value="PartTime">Part time</option>
                <option value="FullTime">Full time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="inline-note">Status</label>
              <select
                className="select"
                value={searchParams.get("status") ?? ""}
                onChange={(e) => updateParam("status", e.target.value)}
              >
                <option value="">Any</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="inline-note">Pay min</label>
              <input
                className="input"
                type="number"
                value={searchParams.get("payMin") ?? ""}
                onChange={(e) => updateParam("payMin", e.target.value)}
              />
            </div>
            <div>
              <label className="inline-note">Pay max</label>
              <input
                className="input"
                type="number"
                value={searchParams.get("payMax") ?? ""}
                onChange={(e) => updateParam("payMax", e.target.value)}
              />
            </div>
            <div>
              <label className="inline-note">Posted from</label>
              <input
                className="input"
                type="date"
                value={searchParams.get("postedFrom") ?? ""}
                onChange={(e) => updateParam("postedFrom", e.target.value)}
              />
            </div>
            <div>
              <label className="inline-note">Posted to</label>
              <input
                className="input"
                type="date"
                value={searchParams.get("postedTo") ?? ""}
                onChange={(e) => updateParam("postedTo", e.target.value)}
              />
            </div>
            <div>
              <label className="inline-note">Tags (comma-separated)</label>
              <input
                className="input"
                value={searchParams.get("tags") ?? ""}
                onChange={(e) => updateParam("tags", e.target.value)}
              />
              <div style={{ marginTop: 6 }}>
                <label className="inline-note">Tag match</label>
                <select
                  className="select"
                  value={searchParams.get("tagsMode") ?? "any"}
                  onChange={(e) => updateParam("tagsMode", e.target.value)}
                >
                  <option value="any">Match any</option>
                  <option value="all">Match all</option>
                </select>
              </div>
            </div>
            <div>
              <label className="inline-note">Source</label>
              <select
                className="select"
                value={searchParams.get("sourceId") ?? ""}
                onChange={(e) => updateParam("sourceId", e.target.value)}
              >
                <option value="">Any</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="inline-note">Page size</label>
              <select
                className="select"
                value={pageSize}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  params.set("pageSize", e.target.value);
                  params.set("page", "1");
                  setSearchParams(params);
                }}
              >
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="20">20</option>
              </select>
            </div>
            <button
              className="button ghost"
              onClick={() => setSearchParams(new URLSearchParams({ branch }))}
            >
              Reset filters
            </button>
          </div>
          <div className="inline-note" style={{ marginTop: 12 }}>
            URL synced: {location.search || "(none)"}
          </div>
        </div>
      </div>
    </div>
  );
}
