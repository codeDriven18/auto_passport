import { useEffect, useState, type FormEvent } from 'react';
import { portalApi } from '@/api/portalApi';
import { JobCategory, JobLevel } from '@/models/enums';
import type { PortalJob } from '@/models/portal';
import styles from './PortalPage.module.css';

const emptyForm = {
  title: '',
  description: '',
  location: '',
  city: '',
  category: JobCategory.It,
  level: JobLevel.Junior,
  isRemote: false,
  salaryMin: '',
  salaryMax: '',
  isActive: true,
};

export function PortalJobsPage() {
  const [jobs, setJobs] = useState<PortalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    portalApi.getJobs()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (job: PortalJob) => {
    setEditingId(job.id);
    setForm({
      title: job.title,
      description: job.description,
      location: job.location ?? '',
      city: job.city ?? '',
      category: job.category,
      level: job.level,
      isRemote: job.isRemote,
      salaryMin: job.salaryMin?.toString() ?? '',
      salaryMax: job.salaryMax?.toString() ?? '',
      isActive: job.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        city: form.city || undefined,
        category: form.category,
        level: form.level,
        isRemote: form.isRemote,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      };

      if (editingId) {
        await portalApi.updateJob(editingId, { ...payload, isActive: form.isActive });
      } else {
        await portalApi.createJob(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    await portalApi.archiveJob(id);
    load();
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Jobs</h1>
        <p className={styles.subtitle}>Create, edit, and archive your listings.</p>
      </header>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnAccent}
          onClick={() => {
            if (showForm && !editingId) {
              setShowForm(false);
            } else {
              openCreate();
            }
          }}
        >
          {showForm && !editingId ? 'Cancel' : 'Post new job'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          <h2 className={styles.title} style={{ fontSize: '1.0625rem' }}>
            {editingId ? 'Edit job' : 'New job'}
          </h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">Title</label>
            <input id="title" className={styles.input} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea id="description" className={styles.textarea} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="city">City</label>
              <input id="city" className={styles.input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="location">Location</label>
              <input id="location" className={styles.input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="category">Category</label>
              <select id="category" className={styles.select} value={form.category} onChange={(e) => setForm({ ...form, category: Number(e.target.value) })}>
                <option value={JobCategory.It}>IT</option>
                <option value={JobCategory.Gig}>Gig</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="level">Level</label>
              <select id="level" className={styles.select} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}>
                <option value={JobLevel.Internship}>Internship</option>
                <option value={JobLevel.Junior}>Junior</option>
                <option value={JobLevel.MidLevel}>Mid-Level</option>
                <option value={JobLevel.NotApplicable}>N/A</option>
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="salaryMin">Salary min</label>
              <input id="salaryMin" type="number" className={styles.input} value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="salaryMax">Salary max</label>
              <input id="salaryMax" type="number" className={styles.input} value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>
          </div>
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} />
            Remote role
          </label>
          {editingId && (
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active listing
            </label>
          )}
          <button type="submit" className={styles.btnAccent} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update job' : 'Create job'}
          </button>
        </form>
      )}

      {loading ? (
        <p className={styles.status}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className={styles.status}>No jobs yet. Post your first listing.</p>
      ) : (
        <div className={styles.list}>
          {jobs.map((job) => (
            <article key={job.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>{job.title}</h2>
                  <p className={styles.cardMeta}>
                    {job.city ?? job.location ?? 'No location'} · {job.isRemote ? 'Remote' : 'On-site'}
                  </p>
                </div>
                <span className={job.isActive ? styles.badge : styles.badgeMuted}>
                  {job.isActive ? 'Active' : 'Archived'}
                </span>
              </div>
              <p className={styles.cardMeta}>{job.description.slice(0, 140)}{job.description.length > 140 ? '…' : ''}</p>
              <div className={styles.actions}>
                <button type="button" className={styles.btn} onClick={() => openEdit(job)}>Edit</button>
                {job.isActive && (
                  <button type="button" className={styles.btnDanger} onClick={() => void handleArchive(job.id)}>
                    Archive
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
