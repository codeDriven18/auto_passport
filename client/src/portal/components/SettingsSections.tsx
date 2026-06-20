import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { authApi } from '@/api/authApi';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { UserRole } from '@/models/auth';
import { PasswordField } from '@/components/forms/PasswordField';
import ws from '@/portal/workspace.module.css';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.body && typeof error.body === 'object' && 'error' in error.body) {
    return String((error.body as { error: string }).error);
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function SettingsAccountSection() {
  const { user, logout } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  const displayName = (() => {
    if (user?.role === UserRole.Company) {
      return user.companyName?.trim() || null;
    }
    const first = profile?.firstName?.trim() ?? '';
    const last = profile?.lastName?.trim() ?? '';
    return `${first} ${last}`.trim() || null;
  })();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={ws.settingsSectionBody}>
      <div className={ws.settingsRow}>
        <div>
          <p className={ws.settingsRowLabel}>Signed in as</p>
          {profileLoading ? (
            <p className={ws.candidateSub}>Loading…</p>
          ) : (
            <>
              {displayName && <p className={ws.settingsRowValue}>{displayName}</p>}
              <p className={ws.candidateSub}>{user?.email}</p>
            </>
          )}
        </div>
        <button type="button" className={ws.btnGhost} onClick={() => void handleLogout()}>Sign out</button>
      </div>
    </div>
  );
}

export function SettingsSecuritySection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setMessage('Password updated. Please sign in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={ws.settingsSectionBody}>
      <div className={ws.securityCard}>
        <div className={ws.securityCardHead}>
          <h4 className={ws.securityCardTitle}>Password</h4>
          <p className={ws.candidateSub}>Use at least 8 characters. You will be signed out after updating.</p>
        </div>
        <form className={ws.formPanel} onSubmit={(e) => void handleChangePassword(e)}>
          <div className={ws.field}>
            <label htmlFor="current-password">Current password</label>
            <PasswordField
              id="current-password"
              inputClassName={ws.input}
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className={ws.fieldRow}>
            <div className={ws.field}>
              <label htmlFor="new-password">New password</label>
              <PasswordField
                id="new-password"
                inputClassName={ws.input}
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className={ws.field}>
              <label htmlFor="confirm-password">Confirm</label>
              <PasswordField
                id="confirm-password"
                inputClassName={ws.input}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <p className={ws.formError} role="alert">{error}</p>}
          {message && <p className={ws.notice}>{message}</p>}
          <button type="submit" className={ws.btnPrimary} disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
