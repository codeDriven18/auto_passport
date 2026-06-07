import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import type { Company } from '@/models/company';
import { CompanyStatus } from '@/models/operations';
import { companyStatusClass, companyStatusLabel } from './adminUtils';
import styles from './AdminPage.module.css';

export function AdminCompanyApprovalsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.getCompanies()
      .then((items) => setCompanies(items.filter((c) => c.status === CompanyStatus.Pending)))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (company: Company, status: CompanyStatus) => {
    await adminApi.setCompanyStatus(company.id, status);
    load();
  };

  if (loading) return <p className={styles.status}>Loading approvals...</p>;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Company Approvals</h1>
          <p className={styles.pageSubtitle}>Review and approve new employer registrations.</p>
        </div>
      </header>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <span className={styles.tableToolbarTitle}>Pending ({companies.length})</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No pending company approvals.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>{company.industry}</td>
                    <td>{company.location}</td>
                    <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={companyStatusClass(company.status, styles)}>
                        {companyStatusLabel(company.status)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" className={styles.btnPrimary} onClick={() => void setStatus(company, CompanyStatus.Approved)}>
                          Approve
                        </button>
                        <button type="button" className={styles.btn} onClick={() => void setStatus(company, CompanyStatus.Rejected)}>
                          Reject
                        </button>
                        <button type="button" className={styles.btnGhost} onClick={() => void setStatus(company, CompanyStatus.Suspended)}>
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
