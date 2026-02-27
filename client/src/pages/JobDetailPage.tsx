import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { JobDetail } from "../types";
import { Loading } from "../components/Loading";
import { useToast } from "../components/ToastProvider";

export function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getJob(id)
      .then((data) => {
        setJob(data);
        setNotes(data.preference.notes ?? "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const toggle = async (type: "bookmark" | "applied") => {
    if (!job) return;
    try {
      if (type === "bookmark") {
        await api.toggleBookmark(job.id);
      } else {
        await api.toggleApplied(job.id);
      }
      const refreshed = await api.getJob(job.id);
      setJob(refreshed);
      push("Updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      push(message);
    }
  };

  const saveNote = async () => {
    if (!job) return;
    await api.updateNote(job.id, notes);
    const refreshed = await api.getJob(job.id);
    setJob(refreshed);
    push("Note saved");
  };

  const deleteJob = async () => {
    if (!job) return;
    if (!window.confirm("Delete this job?")) return;
    await api.deleteJob(job.id);
    push("Job deleted");
    navigate(job.branch === "Gigs" ? "/gigs" : "/it");
  };

  if (loading) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="page">
        <div className="error-box">{error ?? "Job not found"}</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel stack">
        <div className="job-title">{job.title}</div>
        <div className="job-meta">
          <span>{job.companyOrPerson}</span>
          <span>{job.city || ""}</span>
          {job.isRemote && <span className="badge">Remote</span>}
          {job.employmentType && <span className="badge">{job.employmentType}</span>}
          {job.durationDays && <span className="badge">{job.durationDays} days</span>}
          <span className="badge">{job.status}</span>
        </div>
        <p>{job.description}</p>
        <div className="job-meta">
          {job.payMin || job.payMax ? (
            <span className="badge">
              {job.payMin ?? "?"} - {job.payMax ?? "?"} {job.currency}
            </span>
          ) : null}
          <span className="badge">Posted {new Date(job.postedAt).toLocaleDateString()}</span>
          {job.source?.name && <span className="badge">Source: {job.source.name}</span>}
          {job.contact && <span className="badge">Contact: {job.contact}</span>}
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
        <div className="actions">
          {job.applyUrl && (
            <a className="button" href={job.applyUrl} target="_blank" rel="noreferrer">
              Apply
            </a>
          )}
          <button
            className={`button ${job.preference.isBookmarked ? "accent" : "secondary"}`}
            onClick={() => toggle("bookmark")}
          >
            {job.preference.isBookmarked ? "Bookmarked" : "Bookmark"}
          </button>
          <button
            className={`button ${job.preference.isApplied ? "accent" : "secondary"}`}
            onClick={() => toggle("applied")}
          >
            {job.preference.isApplied ? "Applied" : "Mark applied"}
          </button>
          <Link className="button ghost" to={`/jobs/${job.id}/edit`}>
            Edit
          </Link>
          <button className="button danger" onClick={deleteJob}>
            Delete
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="section-title">Notes</div>
        <textarea
          className="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add application notes or reminders"
        />
        <div style={{ marginTop: 12 }}>
          <button className="button" onClick={saveNote}>
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}
