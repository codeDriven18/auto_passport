import { useEffect, useState, type FormEvent } from 'react';
import { adminApi } from '@/api/adminApi';
import type { AdminNotification } from '@/models/admin';
import styles from './AdminPage.module.css';

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await adminApi.createNotification({ userProfileId: profileId, title, message });
      setProfileId('');
      setTitle('');
      setMessage('');
      load();
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    await adminApi.deleteNotification(id);
    load();
  };

  return (
    <section className={styles.page}>
      <form className={styles.formCard} onSubmit={(e) => void handleCreate(e)}>
        <h2 className={styles.tableToolbarTitle}>Send notification</h2>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="profileId">User profile ID</label>
          <input id="profileId" className={styles.input} required value={profileId} onChange={(e) => setProfileId(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">Title</label>
          <input id="title" className={styles.input} required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="message">Message</label>
          <textarea id="message" className={styles.textarea} required value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <button type="submit" className={styles.btnPrimary} disabled={sending}>
          {sending ? 'Sending...' : 'Send notification'}
        </button>
      </form>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <span className={styles.tableToolbarTitle}>All notifications</span>
        </div>
        {loading ? (
          <p className={styles.status}>Loading notifications...</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Title</th>
                  <th>Read</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id}>
                    <td>{n.userEmail}</td>
                    <td>{n.title}</td>
                    <td>{n.isRead ? 'Yes' : 'No'}</td>
                    <td>{new Date(n.createdAt).toLocaleString()}</td>
                    <td>
                      <button type="button" className={styles.btnDanger} onClick={() => void handleDelete(n.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
