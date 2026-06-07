import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import type { AuditLogEntry } from '@/models/admin';
import {
  AuditAction,
  AuditActionLabels,
  AuditEntityType,
  AuditEntityTypeLabels,
} from '@/models/operations';
import styles from './AdminPage.module.css';

const PAGE_SIZE = 25;

export function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | ''>('');
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getAuditLogs({
      search: search.trim() || undefined,
      action: actionFilter === '' ? undefined : actionFilter,
      entityType: entityFilter === '' ? undefined : entityFilter,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((result) => {
        setLogs(result.items);
        setTotalCount(result.totalCount);
      })
      .catch(() => {
        setLogs([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [search, actionFilter, entityFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Audit Logs</h1>
          <p className={styles.pageSubtitle}>Track platform activity, moderation, and admin actions.</p>
        </div>
      </header>

      <div className={styles.filterBar}>
        <input
          className={styles.input}
          placeholder="Search actor, action, details..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className={styles.select}
          value={actionFilter}
          onChange={(e) => {
            setPage(1);
            setActionFilter(e.target.value === '' ? '' : Number(e.target.value) as AuditAction);
          }}
        >
          <option value="">All actions</option>
          {Object.entries(AuditActionLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className={styles.select}
          value={entityFilter}
          onChange={(e) => {
            setPage(1);
            setEntityFilter(e.target.value === '' ? '' : Number(e.target.value) as AuditEntityType);
          }}
        >
          <option value="">All entities</option>
          {Object.entries(AuditEntityTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="button" className={styles.btn} onClick={load}>Search</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          {loading ? (
            <p className={styles.status}>Loading audit logs...</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.actor}</td>
                    <td>{AuditActionLabels[log.action]}</td>
                    <td>{AuditEntityTypeLabels[log.entityType]}</td>
                    <td>
                      <button type="button" className={styles.btnGhost} onClick={() => setSelected(log)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className={styles.pagination}>
          <span>{totalCount} entries</span>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" className={styles.btn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className={styles.modalBackdrop} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Audit Entry</h2>
            <div className={styles.field}>
              <span className={styles.label}>Timestamp</span>
              <span>{new Date(selected.timestamp).toLocaleString()}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Actor</span>
              <span>{selected.actor}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Action</span>
              <span>{AuditActionLabels[selected.action]}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Entity</span>
              <span>{AuditEntityTypeLabels[selected.entityType]}{selected.entityId ? ` · ${selected.entityId}` : ''}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Details</span>
              <pre className={styles.detailPre}>{selected.details ?? '—'}</pre>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
