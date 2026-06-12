import { useTheme } from '@/theme/ThemeProvider';
import type { ThemePreference } from '@/theme/theme';
import styles from './ThemeAppearancePicker.module.css';

const OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'light', label: 'Light', hint: 'White surfaces, yellow accent' },
  { value: 'dark', label: 'Dark', hint: 'Black surfaces, high contrast' },
  { value: 'system', label: 'System', hint: 'Match device setting' },
];

export function ThemeAppearancePicker() {
  const { preference, resolvedTheme, setPreference } = useTheme();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.label}>Appearance</p>
        <p className={styles.hint}>
          Currently {resolvedTheme === 'dark' ? 'dark' : 'light'}
          {preference === 'system' ? ' (system)' : ''}
        </p>
      </div>
      <div className={styles.options} role="radiogroup" aria-label="Theme">
        {OPTIONS.map((option) => {
          const active = preference === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.option} ${active ? styles.optionActive : ''}`}
              onClick={() => setPreference(option.value)}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionHint}>{option.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
