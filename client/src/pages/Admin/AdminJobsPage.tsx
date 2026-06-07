import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import type { Company } from '@/models/company';
import type { Job } from '@/models/job';
import { JobCategory, JobLevel } from '@/models/enums';
import { jobStatusClass } from './adminUtils';
import styles from './AdminPage.module.css';

interface JobFormState {
  title: string;
  description: string;
  companyId: string;
  category: JobCategory;
  level: JobLevel;
  isRemote: boolean;
  isActive: boolean;
}

const emptyForm = (companyId = ''): JobFormState => ({
  title: '',
  description: '',
  companyId,
  category: JobCategory.It,
  level: JobLevel.MidLevel,
  isRemote: false,
  isActive: true,
});

export function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<JobFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [actionJobId, setActionJobId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getJobs(), adminApi.getCompanies()])
      .then(([j, c]) => {
        setJobs(j);
        setCompanies(c);
      })
      .catch(() => {
        setJobs([]);
        setCompanies([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(companies[0]?.id ?? ''));
    setModalOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditing(job);
    setForm({
      title: job.title,
      description: job.description,
      companyId: job.companyId,
      category: job.category,
      level: job.level,
      isRemote: job.isRemote,
      isActive: job.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.companyId) return;
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateJob(editing.id, {
          title: form.title,
          description: form.description,
          companyId: form.companyId,
          category: form.category,
          level: form.level,
          isRemote: form.isRemote,
          isActive: form.isActive,
        });
      } else {
        await adminApi.createJob({
          title: form.title,
          description: form.description || form.title,
          companyId: form.companyId,
          category: form.category,
          level: form.level,
          isRemote: form.isRemote,
        });
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (jobId: string, action: () => Promise<void>) => {
    setActionJobId(jobId);
    try {
      await action();
      load();
    } finally {
      setActionJobId(null);
    }
  };

  if (loading) return <p className={styles.status}>Loading jobs...</p>;

  return (
    <section className={styles.page}>
      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <span className={styles.tableToolbarTitle}>Jobs</span>
          <button type="button" className={styles.btnPrimary} onClick={openCreate}>
            + Create Job
          </button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>
                    <span className={jobStatusClass(job, styles)}>
                      {job.isArchived ? 'Archived' : job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.btnGhost} onClick={() => openEdit(job)}>
                        Edit
                      </button>
                      {!job.isArchived && job.isActive && (
                        <button
                          type="button"
                          className={styles.btn}
                          disabled={actionJobId === job.id}
                          onClick={() => void runAction(job.id, () => adminApi.setJobActive(job.id, false))}
                        >
                          Deactivate
                        </button>
                      )}
                      {!job.isArchived && !job.isActive && (
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          disabled={actionJobId === job.id}
                          onClick={() => void runAction(job.id, () => adminApi.setJobActive(job.id, true))}
                        >
                          Activate
                        </button>
                      )}
                      {!job.isArchived ? (
                        <button
                          type="button"
                          className={styles.btn}
                          disabled={actionJobId === job.id}
                          onClick={() => void runAction(job.id, () => adminApi.archiveJob(job.id))}
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          disabled={actionJobId === job.id}
                          onClick={() => void runAction(job.id, () => adminApi.unarchiveJob(job.id))}
                        >
                          Unarchive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editing ? 'Edit Job' : 'Create Job'}</h2>
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input className={styles.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea className={styles.textarea} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Company</label>
              <select className={styles.select} value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {editing && (
              <div className={styles.field}>
                <label className={styles.label}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  {' '}Active listing
                </label>
              </div>
            )}
            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => void handleSave()}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
