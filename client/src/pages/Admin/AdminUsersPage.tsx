import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import { UserRole, UserRoleLabels } from '@/models/auth';
import type { AdminUser } from '@/models/admin';
import styles from './AdminPage.module.css';

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (user: AdminUser, role: UserRole) => {
    await adminApi.updateUserRole(user.id, role);
    load();
  };

  if (loading) return <p className={styles.status}>Loading users...</p>;

  return (
    <section className={styles.page}>
      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <span className={styles.tableToolbarTitle}>Users</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Applications</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td><span className={styles.roleBadge}>{UserRoleLabels[user.role]}</span></td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.applicationCount ?? 0}</td>
                  <td>
                    <div className={styles.actions}>
                      {user.role !== UserRole.Admin && (
                        <button type="button" className={styles.btnGhost} onClick={() => void changeRole(user, UserRole.Admin)}>
                          Make admin
                        </button>
                      )}
                      {user.role !== UserRole.Company && (
                        <button type="button" className={styles.btnGhost} onClick={() => void changeRole(user, UserRole.Company)}>
                          Set company
                        </button>
                      )}
                      {user.role !== UserRole.JobSeeker && (
                        <button type="button" className={styles.btnGhost} onClick={() => void changeRole(user, UserRole.JobSeeker)}>
                          Set seeker
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
    </section>
  );
}
