import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useAuth } from '@/context/AuthContext';
import type { UserSession } from '@/models/auth';
import adminStyles from './AdminPage.module.css';
import styles from './AdminSecurityPage.module.css';

function formatWhen(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

export function AdminSecurityPage() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      setSessions(await authApi.getSessions());
    } catch {
      setSessions([]);
      setMessage('Could not load active sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleRevoke = async (session: UserSession) => {
    if (!window.confirm(`Revoke session on "${session.deviceInfo}"?`)) return;
    try {
      await authApi.revokeSession(session.id);
      if (session.isCurrent) {
        await logout();
        return;
      }
      setMessage('Session revoked.');
      void loadSessions();
    } catch {
      setMessage('Could not revoke session.');
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Sign out of all devices? You will need to sign in again here.')) return;
    try {
      await authApi.logoutAll();
      await logout();
    } catch {
      setMessage('Could not revoke all sessions.');
    }
  };

  return (
    <section className={adminStyles.page}>
      <header className={adminStyles.pageHeader}>
        <div>
          <p className={adminStyles.pageEyebrow}>Settings</p>
          <h1 className={adminStyles.pageTitle}>Security</h1>
          <p className={adminStyles.pageSubtitle}>
            Active sessions, refresh tokens, and sign-out controls.
          </p>
        </div>
        <div className={adminStyles.actions}>
          <Link to="/admin/settings" className={adminStyles.btn}>Back to settings</Link>
          <button type="button" className={adminStyles.btnDanger} onClick={() => void handleRevokeAll()}>
            Revoke all sessions
          </button>
        </div>
      </header>

      {message && <p className={adminStyles.banner}>{message}</p>}

      {loading ? (
        <p className={adminStyles.status}>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className={adminStyles.status}>No active sessions found.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={adminStyles.table}>
            <thead>
              <tr>
                <th>Device</th>
                <th>IP</th>
                <th>Created</th>
                <th>Last activity</th>
                <th>Expires</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    {session.deviceInfo}
                    {session.isCurrent && <span className={styles.currentBadge}>Current</span>}
                    {session.isRememberMe && <span className={styles.rememberBadge}>Remember me</span>}
                  </td>
                  <td>{session.ipAddress ?? '—'}</td>
                  <td>{formatWhen(session.createdAt)}</td>
                  <td>{formatWhen(session.lastActivityAt)}</td>
                  <td>{formatWhen(session.expiresAt)}</td>
                  <td>
                    <button
                      type="button"
                      className={adminStyles.btn}
                      onClick={() => void handleRevoke(session)}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
