export const theme = {
  colors: {
    accent: '#FFD600',
    light: {
      bg: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textMuted: '#666666',
      border: '#E0E0E0',
    },
    dark: {
      bg: '#000000',
      surface: '#1A1A1A',
      text: '#FFFFFF',
      textMuted: '#AAAAAA',
      border: '#333333',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1rem',
    full: '9999px',
  },
  transition: '0.2s ease',
} as const;

export type ThemeMode = 'light' | 'dark';
