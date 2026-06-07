import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { authApi } from '@/api/authApi';
import styles from './AuthPage.module.css';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.body && typeof error.body === 'object' && 'error' in error.body) {
    return String((error.body as { error: string }).error);
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await authApi.forgotPassword(email);
      setMessage(result.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.logo} />
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>
          Enter your email and we&apos;ll send reset instructions if an account exists.
        </p>
      </div>

      <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className={styles.footer}>
        <Link to="/login" className={styles.link}>Back to sign in</Link>
      </p>
    </section>
  );
}
