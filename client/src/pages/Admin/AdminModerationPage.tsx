import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/api/client';
import { moderationApi } from '@/api/moderationApi';
import { formatSalary } from '@/lib/jobFormat';
import type { JobCandidate } from '@/models/moderation';
import { CandidateJobStatus } from '@/models/moderation';
import styles from './AdminModerationPage.module.css';
import adminStyles from './AdminPage.module.css';

function scoreClass(value: number, invert = false): string {
  const good = invert ? value <= 25 : value >= 70;
  const mid = invert ? value <= 50 : value >= 40;
  if (good) return styles.scoreGood;
  if (mid) return styles.scoreMid;
  return styles.scoreLow;
}

function ModeratorCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: JobCandidate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
      onClick={onSelect}
    >
      <div className={styles.cardScores}>
        <span className={scoreClass(candidate.extractionConfidence)}>{candidate.extractionConfidence}% conf</span>
        <span className={scoreClass(candidate.completenessScore)}>{candidate.completenessScore}% complete</span>
        <span className={scoreClass(candidate.trustScore)}>{candidate.trustScore}% trust</span>
        <span className={scoreClass(candidate.spamScore, true)}>{candidate.spamScore}% spam</span>
      </div>
      <h3 className={styles.cardTitle}>{candidate.title ?? 'Untitled role'}</h3>
      <p className={styles.cardSalary}>
        {formatSalary(candidate.salaryMin, candidate.salaryMax, candidate.category, candidate.applyUrl)}
      </p>
      <p className={styles.cardCompany}>{candidate.companyName ?? 'Unknown company'}</p>
      <p className={styles.cardMeta}>
        {candidate.isRemote ? 'Remote' : candidate.location ?? candidate.city ?? 'Location TBD'}
        {candidate.sourceCount > 1 && ` · ${candidate.sourceCount} sources`}
      </p>
      <p className={styles.cardSource}>{candidate.sourceName}</p>
    </button>
  );
}

export function AdminModerationPage() {
  const [queue, setQueue] = useState<JobCandidate[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof moderationApi.getAnalytics>> | null>(null);
  const [showIngest, setShowIngest] = useState(false);
  const [ingestText, setIngestText] = useState('');
  const [telegramSourceId, setTelegramSourceId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selected = queue.find((c) => c.id === selectedId) ?? null;

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      moderationApi.getQueue(CandidateJobStatus.PendingReview),
      moderationApi.getAnalytics(),
    ])
      .then(([q, a]) => {
        setQueue(q.items);
        setPendingCount(q.pendingCount);
        setAnalytics(a);
        if (q.items.length > 0 && !selectedId) setSelectedId(q.items[0].id);
      })
      .catch(() => {
        setQueue([]);
        setAnalytics(null);
      })
      .finally(() => setLoading(false));
  }, [selectedId]);

  useEffect(() => {
    apiClient<Array<{ id: string; name: string; type: number }>>('/sources')
      .then((sources) => {
        const telegram = sources.find((s) => s.name.toLowerCase().includes('telegram')) ?? sources[0];
        setTelegramSourceId(telegram?.id ?? null);
      })
      .catch(() => setTelegramSourceId(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      await fn();
      setMessage(successMsg);
      setSelectedId(null);
      load();
    } catch {
      setMessage('Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!ingestText.trim() || !telegramSourceId) return;
    setActionLoading(true);
    try {
      await moderationApi.ingestTelegram({
        sourceId: telegramSourceId,
        telegramMessageId: `manual-${Date.now()}`,
        rawMessageText: ingestText,
        channelName: 'Manual test',
      });
      setIngestText('');
      setShowIngest(false);
      setMessage('Message ingested into moderation queue.');
      load();
    } catch {
      setMessage('Ingest failed — ensure a Telegram source exists in the database.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className={adminStyles.status}>Loading moderation queue...</p>;

  return (
    <section className={adminStyles.page}>
      <header className={adminStyles.pageHeader}>
        <div>
          <h1 className={adminStyles.pageTitle}>Job Moderation</h1>
          <p className={adminStyles.pageSubtitle}>
            Review ingested candidates before they reach users. {pendingCount} pending.
          </p>
        </div>
        <div className={adminStyles.actions}>
          <button type="button" className={adminStyles.btn} onClick={() => setShowIngest((v) => !v)}>
            Test ingest
          </button>
          <button
            type="button"
            className={adminStyles.btnPrimary}
            disabled={actionLoading}
            onClick={() => void runAction(() => moderationApi.bulkApproveHighConfidence(), 'High-confidence jobs approved.')}
          >
            Approve high confidence
          </button>
        </div>
      </header>

      {message && <p className={styles.banner}>{message}</p>}

      {showIngest && (
        <div className={styles.ingestPanel}>
          <textarea
            className={styles.ingestTextarea}
            rows={6}
            value={ingestText}
            onChange={(e) => setIngestText(e.target.value)}
            placeholder="Paste a Telegram job post to test the ingestion pipeline..."
          />
          <button type="button" className={adminStyles.btnPrimary} disabled={actionLoading} onClick={() => void handleIngest()}>
            Ingest message
          </button>
        </div>
      )}

      {analytics && (
        <div className={styles.analyticsRow}>
          <div className={styles.stat}><strong>{analytics.messagesScanned}</strong><span>Scanned</span></div>
          <div className={styles.stat}><strong>{analytics.jobsDetected}</strong><span>Detected</span></div>
          <div className={styles.stat}><strong>{analytics.published}</strong><span>Published</span></div>
          <div className={styles.stat}><strong>{analytics.rejected}</strong><span>Rejected</span></div>
          <div className={styles.stat}><strong>{Math.round(analytics.averageConfidence)}%</strong><span>Avg confidence</span></div>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.queue}>
          {queue.length === 0 ? (
            <p className={styles.empty}>No candidates awaiting review.</p>
          ) : (
            queue.map((candidate) => (
              <ModeratorCard
                key={candidate.id}
                candidate={candidate}
                selected={candidate.id === selectedId}
                onSelect={() => setSelectedId(candidate.id)}
              />
            ))
          )}
        </div>

        {selected && (
          <aside className={styles.detail}>
            <h2 className={styles.detailTitle}>Review</h2>

            {selected.primaryMessage && (
              <div className={styles.rawPost}>
                <p className={styles.rawLabel}>Original Telegram post</p>
                <pre className={styles.rawText}>{selected.primaryMessage.rawMessageText}</pre>
                {selected.primaryMessage.telegramMessageUrl && (
                  <a href={selected.primaryMessage.telegramMessageUrl} target="_blank" rel="noopener noreferrer" className={styles.rawLink}>
                    View source message
                  </a>
                )}
              </div>
            )}

            {selected.sources.length > 1 && (
              <div className={styles.duplicateBanner}>
                {selected.sourceCount} sources linked to this candidate
              </div>
            )}

            <div className={styles.preview}>
              <h3>{selected.title ?? 'Untitled'}</h3>
              <p className={styles.previewSalary}>
                {formatSalary(selected.salaryMin, selected.salaryMax, selected.category, selected.applyUrl)}
              </p>
              <p>{selected.companyName}</p>
              <p className={styles.previewMeta}>
                {selected.isRemote ? 'Remote' : selected.location ?? selected.city}
                {selected.employmentType && ` · ${selected.employmentType}`}
              </p>
              {selected.description && <p className={styles.previewDesc}>{selected.description}</p>}
              {selected.skills.length > 0 && (
                <div className={styles.skillRow}>
                  {selected.skills.map((s) => <span key={s} className={styles.skill}>{s}</span>)}
                </div>
              )}
            </div>

            <div className={adminStyles.actions}>
              <button
                type="button"
                className={adminStyles.btnPrimary}
                disabled={actionLoading}
                onClick={() => void runAction(() => moderationApi.approve(selected.id), 'Job approved and published.')}
              >
                Approve & publish
              </button>
              <button
                type="button"
                className={adminStyles.btn}
                disabled={actionLoading}
                onClick={() => void runAction(
                  () => moderationApi.reject(selected.id, 'Does not meet quality standards'),
                  'Candidate rejected.',
                )}
              >
                Reject
              </button>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
