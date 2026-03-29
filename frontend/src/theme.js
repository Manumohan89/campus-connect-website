import { createTheme } from '@mui/material/styles';

export function buildTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#4F46E5' },
      secondary: { main: '#7C3AED' },
      background: {
        default: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        paper:   mode === 'dark' ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary:   mode === 'dark' ? '#F1F5F9' : '#111827',
        secondary: mode === 'dark' ? '#94A3B8' : '#6B7280',
      },
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(mode === 'dark' && { border: '1px solid rgba(255,255,255,0.06)' }),
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
    },
  });
}
