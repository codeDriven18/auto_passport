import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import type { AdminUser } from '@/models/admin';
import type { Company } from '@/models/company';
import { CompanyStatus } from '@/models/operations';
import { companyStatusClass, companyStatusLabel } from './adminUtils';
import styles from './AdminPage.module.css';

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getCompanies(), adminApi.getUsers()])
      .then(([c, u]) => {
        setCompanies(c);
        setUsers(u);
      })
      .catch(() => {
        setCompanies([]);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const userCountByCompany = useMemo(() => {
    const map = new Map<string, number>();
    for (const user of users) {
      if (!user.companyId) continue;
      map.set(user.companyId, (map.get(user.companyId) ?? 0) + 1);
    }
    return map;
  }, [users]);

  const setStatus = async (company: Company, status: CompanyStatus) => {
    await adminApi.setCompanyStatus(company.id, status);
    load();
  };

  if (loading) return <p className={styles.status}>Loading companies...</p>;

  return (
    <section className={styles.page}>
      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <span className={styles.tableToolbarTitle}>Companies</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Jobs</th>
                <th>Users</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td>{company.openJobsCount}</td>
                  <td>{userCountByCompany.get(company.id) ?? 0}</td>
                  <td>
                    <span className={companyStatusClass(company.status, styles)}>
                      {companyStatusLabel(company.status)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {company.status !== CompanyStatus.Approved && (
                        <button type="button" className={styles.btnPrimary} onClick={() => void setStatus(company, CompanyStatus.Approved)}>
                          Approve
                        </button>
                      )}
                      {company.status !== CompanyStatus.Rejected && (
                        <button type="button" className={styles.btn} onClick={() => void setStatus(company, CompanyStatus.Rejected)}>
                          Reject
                        </button>
                      )}
                      {company.status !== CompanyStatus.Suspended && (
                        <button type="button" className={styles.btnGhost} onClick={() => void setStatus(company, CompanyStatus.Suspended)}>
                          Suspend
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
