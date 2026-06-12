export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const theme = {
  colors: {
    accent: '#FFD600',
    light: {
      bg: '#FFFFFF',
      surface: '#FFFFFF',
      text: '#0A0A0A',
      textMuted: '#6B7280',
      border: '#E5E7EB',
    },
    dark: {
      bg: '#0A0A0A',
      surface: '#141414',
      text: '#F5F5F5',
      textMuted: '#A3A3A3',
      border: '#2A2A2A',
    },
  },
} as const;

/** @deprecated Use ThemePreference */
export type ThemeMode = ResolvedTheme;
