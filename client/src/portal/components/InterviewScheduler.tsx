import { useState } from 'react';
import { portalApi } from '@/api/portalApi';
import { ApiError } from '@/api/client';
import ws from '@/portal/workspace.module.css';

interface InterviewSchedulerProps {
  applicationId: string;
  initialDate?: string;
  initialLocation?: string;
  initialNotes?: string;
  onScheduled: () => void;
  onCancel?: () => void;
}

function toLocalInputValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function resolveError(err: unknown): string {
  if (err instanceof ApiError) {
    let serverMessage: string | undefined;
    if (typeof err.body === 'string') {
      try {
        serverMessage = (JSON.parse(err.body) as { error?: string }).error;
      } catch {
        serverMessage = err.body || undefined;
      }
    }
    return serverMessage ?? err.message;
  }
  return err instanceof Error ? err.message : 'Could not schedule interview.';
}

export function InterviewScheduler({
  applicationId,
  initialDate,
  initialLocation,
  initialNotes,
  onScheduled,
  onCancel,
}: InterviewSchedulerProps) {
  const [when, setWhen] = useState(toLocalInputValue(initialDate));
  const [location, setLocation] = useState(initialLocation ?? '');
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!when) {
      setError('Pick a date and time.');
      return;
    }
    const parsed = new Date(when);
    if (Number.isNaN(parsed.getTime())) {
      setError('That date and time is invalid.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await portalApi.scheduleInterview(applicationId, {
        scheduledAtUtc: parsed.toISOString(),
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onScheduled();
    } catch (err) {
      setError(resolveError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={ws.scheduler}>
      <div className={ws.schedulerFields}>
        <label className={ws.schedulerField}>
          <span>Date &amp; time</span>
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className={ws.schedulerInput}
          />
        </label>
        <label className={ws.schedulerField}>
          <span>Location / meeting link</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Google Meet link or office address"
            className={ws.schedulerInput}
          />
        </label>
      </div>
      <label className={ws.schedulerField}>
        <span>Notes (recruiter only)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Agenda, interviewers, things to cover…"
          className={ws.schedulerInput}
        />
      </label>
      {error && <p className={ws.recruiterActionsError} role="alert">{error}</p>}
      <div className={ws.schedulerActions}>
        <button type="button" className={ws.btnPrimary} disabled={busy} onClick={() => void submit()}>
          {initialDate ? 'Update interview' : 'Schedule interview'}
        </button>
        {onCancel && (
          <button type="button" className={ws.btnGhost} disabled={busy} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
