import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api";
import type { JobDetail, JobStatus, EmploymentType, Tag, Source } from "../types";
import { Loading } from "../components/Loading";
import { useToast } from "../components/ToastProvider";

const emptyJob = {
  branch: "Gigs" as const,
  title: "",
  companyOrPerson: "",
  description: "",
  city: "",
  country: "",
  isRemote: false,
  employmentType: "Gig" as EmploymentType,
  durationDays: "",
  payMin: "",
  payMax: "",
  currency: "USD",
  postedAt: new Date().toISOString().slice(0, 10),
  applyUrl: "",
  contact: "",
  status: "Active" as JobStatus,
  sourceId: "",
  sourceName: ""
};

export function JobFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [form, setForm] = useState({
    ...emptyJob,
    branch: (searchParams.get("branch") as "Gigs" | "ItJobs") || emptyJob.branch
  });

  useEffect(() => {
    api.getSources().then(setSources).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!tagInput) return;
    const timeout = setTimeout(() => {
      api.getTags(tagInput).then(setTags).catch(() => undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [tagInput]);

  useEffect(() => {
    if (!id) return;
    api
      .getJob(id)
      .then((job: JobDetail) => {
        setForm({
          branch: job.branch,
          title: job.title,
          companyOrPerson: job.companyOrPerson,
          description: job.description,
          city: job.city ?? "",
          country: job.country ?? "",
          isRemote: job.isRemote,
          employmentType: job.employmentType ?? "FullTime",
          durationDays: job.durationDays?.toString() ?? "",
          payMin: job.payMin?.toString() ?? "",
          payMax: job.payMax?.toString() ?? "",
          currency: job.currency ?? "USD",
          postedAt: job.postedAt.slice(0, 10),
          applyUrl: job.applyUrl ?? "",
          contact: job.contact ?? "",
          status: job.status,
          sourceId: job.source?.id ? job.source.id.toString() : "",
          sourceName: ""
        });
        setSelectedTags(job.tags);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isGigs = form.branch === "Gigs";

  const availableTags = useMemo(
    () => tags.filter((tag) => !selectedTags.some((t) => t.id === tag.id)),
    [tags, selectedTags]
  );

  const addTag = (tag: Tag) => {
    setSelectedTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const addCustomTag = () => {
    if (!tagInput.trim()) return;
    const newTag: Tag = { id: Date.now(), name: tagInput.trim() };
    setSelectedTags((prev) => [...prev, newTag]);
    setTagInput("");
  };

  const removeTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  const updateField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    setError(null);

    if (!form.title.trim() || !form.companyOrPerson.trim() || !form.description.trim()) {
      setError("Title, company/person, and description are required.");
      return;
    }

    if (isGigs && !form.durationDays) {
      setError("DurationDays is required for gigs.");
      return;
    }

    if (!isGigs && !form.employmentType) {
      setError("EmploymentType is required for IT jobs.");
      return;
    }

    const payload = {
      branch: form.branch,
      title: form.title,
      companyOrPerson: form.companyOrPerson,
      description: form.description,
      city: form.city || null,
      country: form.country || null,
      isRemote: form.isRemote,
      employmentType: isGigs ? "Gig" : form.employmentType,
      durationDays: isGigs ? Number(form.durationDays) : null,
      payMin: form.payMin ? Number(form.payMin) : null,
      payMax: form.payMax ? Number(form.payMax) : null,
      currency: form.currency || null,
      postedAt: form.postedAt,
      applyUrl: form.applyUrl || null,
      contact: form.contact || null,
      status: form.status,
      sourceId: form.sourceId ? Number(form.sourceId) : null,
      sourceName: form.sourceName || null,
      tagIds: selectedTags.filter((tag) => tag.id < 1000000000).map((tag) => tag.id),
      tagNames: selectedTags.map((tag) => tag.name)
    };

    try {
      if (id) {
        await api.updateJob(id, payload);
        push("Job updated");
        navigate(`/jobs/${id}`);
      } else {
        const created = await api.createJob(payload);
        push("Job created");
        navigate(`/jobs/${created.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel stack">
        <div className="section-title">{id ? "Edit Job" : "Create Job"}</div>
        {error && <div className="error-box">{error}</div>}
        <div className="form-grid">
          <div className="grid-2">
            <div>
              <label className="inline-note">Branch</label>
              <select
                className="select"
                value={form.branch}
                onChange={(e) => updateField("branch", e.target.value)}
              >
                <option value="Gigs">Gigs</option>
                <option value="ItJobs">IT Jobs</option>
              </select>
            </div>
            <div>
              <label className="inline-note">Status</label>
              <select
                className="select"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="inline-note">Title</label>
              <input className="input" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div>
              <label className="inline-note">Company or Person</label>
              <input
                className="input"
                value={form.companyOrPerson}
                onChange={(e) => updateField("companyOrPerson", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="inline-note">Description</label>
            <textarea
              className="textarea"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div className="grid-3">
            <div>
              <label className="inline-note">City</label>
              <input className="input" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>
            <div>
              <label className="inline-note">Country</label>
              <input className="input" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
            </div>
            <div>
              <label className="inline-note">Remote</label>
              <select
                className="select"
                value={form.isRemote ? "true" : "false"}
                onChange={(e) => updateField("isRemote", e.target.value === "true")}
              >
                <option value="false">On-site</option>
                <option value="true">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div>
              <label className="inline-note">Employment Type</label>
              <select
                className="select"
                value={form.employmentType}
                onChange={(e) => updateField("employmentType", e.target.value)}
                disabled={isGigs}
              >
                <option value="Gig">Gig</option>
                <option value="PartTime">Part time</option>
                <option value="FullTime">Full time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="inline-note">Duration Days (Gigs)</label>
              <input
                className="input"
                type="number"
                value={form.durationDays}
                onChange={(e) => updateField("durationDays", e.target.value)}
                disabled={!isGigs}
              />
            </div>
            <div>
              <label className="inline-note">Posted At</label>
              <input
                className="input"
                type="date"
                value={form.postedAt}
                onChange={(e) => updateField("postedAt", e.target.value)}
              />
            </div>
          </div>

          <div className="grid-3">
            <div>
              <label className="inline-note">Pay Min</label>
              <input className="input" type="number" value={form.payMin} onChange={(e) => updateField("payMin", e.target.value)} />
            </div>
            <div>
              <label className="inline-note">Pay Max</label>
              <input className="input" type="number" value={form.payMax} onChange={(e) => updateField("payMax", e.target.value)} />
            </div>
            <div>
              <label className="inline-note">Currency</label>
              <input className="input" value={form.currency} onChange={(e) => updateField("currency", e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="inline-note">Apply URL</label>
              <input className="input" value={form.applyUrl} onChange={(e) => updateField("applyUrl", e.target.value)} />
            </div>
            <div>
              <label className="inline-note">Contact</label>
              <input className="input" value={form.contact} onChange={(e) => updateField("contact", e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="inline-note">Source</label>
              <select
                className="select"
                value={form.sourceId}
                onChange={(e) => updateField("sourceId", e.target.value)}
              >
                <option value="">None</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
              <div className="inline-note" style={{ marginTop: 6 }}>
                Or add new source:
              </div>
              <input
                className="input"
                value={form.sourceName}
                onChange={(e) => updateField("sourceName", e.target.value)}
                placeholder="New source name"
              />
            </div>
            <div>
              <label className="inline-note">Tags</label>
              <input
                className="input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="Type to search or add"
              />
              <div className="job-meta" style={{ marginTop: 8 }}>
                {availableTags.slice(0, 6).map((tag) => (
                  <button key={tag.id} className="badge" onClick={() => addTag(tag)}>
                    + {tag.name}
                  </button>
                ))}
              </div>
              <div className="job-meta" style={{ marginTop: 8 }}>
                {selectedTags.map((tag) => (
                  <span key={tag.id} className="badge">
                    {tag.name}
                    <button
                      style={{ marginLeft: 6, border: "none", background: "transparent", cursor: "pointer" }}
                      aria-label={`Remove ${tag.name}`}
                      onClick={() => removeTag(tag.id)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="button accent" onClick={onSubmit}>
            {id ? "Save changes" : "Create job"}
          </button>
          <Link className="button secondary" to={id ? `/jobs/${id}` : "/gigs"}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
