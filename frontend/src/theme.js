import { createTheme } from '@mui/material/styles';

export function buildTheme(mode) {
  const d = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary:   { main: '#4F46E5', light: '#818CF8', dark: '#3730A3' },
      secondary: { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
      success:   { main: '#10B981' },
      warning:   { main: '#F59E0B' },
      error:     { main: '#EF4444' },
      info:      { main: '#0EA5E9' },
      background: {
        default: d ? '#0F172A' : '#F8FAFC',
        paper:   d ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary:   d ? '#F1F5F9' : '#111827',
        secondary: d ? '#94A3B8' : '#6B7280',
        disabled:  d ? '#475569' : '#9CA3AF',
      },
      divider: d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      action: {
        hover:    d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        selected: d ? 'rgba(99,102,241,0.15)'  : 'rgba(99,102,241,0.08)',
      },
    },
    typography: {
      fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      h1: { fontFamily: "'Syne',sans-serif", fontWeight: 900 },
      h2: { fontFamily: "'Syne',sans-serif", fontWeight: 800 },
      h3: { fontFamily: "'Syne',sans-serif", fontWeight: 800 },
      h4: { fontFamily: "'Syne',sans-serif", fontWeight: 700 },
      h5: { fontFamily: "'Syne',sans-serif", fontWeight: 700 },
      h6: { fontFamily: "'Syne',sans-serif", fontWeight: 700 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: d ? '#0F172A' : '#F8FAFC',
            color: d ? '#F1F5F9' : '#111827',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: d ? '#1E293B' : '#FFFFFF',
            ...(d && { border: '1px solid rgba(255,255,255,0.07)' }),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: d ? '#1E293B' : '#FFFFFF',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(d && { backgroundColor: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.06)' }),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            ...(d && { backgroundColor: '#1E293B', borderRight: '1px solid rgba(255,255,255,0.06)' }),
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
          outlined: d ? {
            borderColor: 'rgba(255,255,255,0.15)',
            '&:hover': { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' },
          } : {},
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontFamily: "'Outfit',sans-serif", ...(d && { borderColor: 'rgba(255,255,255,0.1)' }) },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: d ? '#CBD5E1' : 'inherit' },
          head: { backgroundColor: d ? '#0F172A' : '#F8FAFC', color: d ? '#94A3B8' : '#475569', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: { '&:hover': { backgroundColor: d ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: d ? {
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.04)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
              '&.Mui-focused fieldset': { borderColor: '#818CF8' },
            },
            '& .MuiInputLabel-root': { color: '#94A3B8' },
            '& .MuiInputBase-input': { color: '#F1F5F9' },
          } : {},
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: d ? { color: '#F1F5F9' } : {},
          icon: d ? { color: '#94A3B8' } : {},
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: { borderColor: d ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' },
          root: d ? { color: '#F1F5F9', '& input': { color: '#F1F5F9' } } : {},
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: d ? { color: '#F1F5F9' } : {},
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { ...(d && { backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }) },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: d ? {
            color: '#F1F5F9',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
            '&.Mui-selected': { backgroundColor: 'rgba(99,102,241,0.15)' },
          } : {},
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { backgroundImage: 'none', ...(d && { backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }) },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { color: d ? '#F1F5F9' : '#111827' } },
      },
      MuiDialogContent: {
        styleOverrides: { root: { color: d ? '#CBD5E1' : 'inherit' } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, color: d ? '#94A3B8' : '#64748B', '&.Mui-selected': { color: d ? '#818CF8' : '#4F46E5' } } },
      },
      MuiTabs: {
        styleOverrides: { indicator: { backgroundColor: d ? '#818CF8' : '#4F46E5' } },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { ...(d && { backgroundColor: 'rgba(255,255,255,0.08)' }) } },
      },
      MuiSwitch: {
        styleOverrides: { track: { ...(d && { backgroundColor: '#475569' }) } },
      },
      MuiListItem: {
        styleOverrides: { root: d ? { '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' } } : {} },
      },
      MuiIconButton: {
        styleOverrides: { root: d ? { color: '#94A3B8', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#F1F5F9' } } : {} },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: d ? '#334155' : '#1E293B', color: '#F1F5F9', fontSize: '0.72rem' },
        },
      },
      MuiFormLabel: {
        styleOverrides: { root: d ? { color: '#94A3B8', '&.Mui-focused': { color: '#818CF8' } } : {} },
      },
      MuiCheckbox: {
        styleOverrides: { root: d ? { color: '#475569' } : {} },
      },
      MuiRadio: {
        styleOverrides: { root: d ? { color: '#475569' } : {} },
      },
    },
  });
}
