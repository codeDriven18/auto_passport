import { useTheme } from '@/theme/ThemeProvider';
import type { ThemePreference } from '@/theme/theme';
import ws from '@/portal/workspace.module.css';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto' },
];

export function SettingsThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className={ws.themeToggle} role="radiogroup" aria-label="Theme">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={preference === option.value}
          className={[ws.themeToggleBtn, preference === option.value ? ws.themeToggleBtnActive : ''].filter(Boolean).join(' ')}
          onClick={() => setPreference(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
