import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from './theme';

const ThemeCtx = createContext({ mode: 'light', toggleMode: () => {} });

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  useEffect(() => {
    const d = mode === 'dark';
    document.documentElement.setAttribute('data-theme', mode);
    document.body.setAttribute('data-theme', mode);
    document.body.style.backgroundColor = d ? '#0F172A' : '#F8FAFC';
    document.body.style.color = d ? '#F1F5F9' : '#111827';
    // Inject/update CSS variables so inline-styled components can read them
    const root = document.documentElement;
    root.style.setProperty('--bg-page',    d ? '#0F172A' : '#F4F6FB');
    root.style.setProperty('--bg-card',    d ? '#1E293B' : '#FFFFFF');
    root.style.setProperty('--bg-card2',   d ? '#263348' : '#F8FAFC');
    root.style.setProperty('--bg-input',   d ? '#0F172A' : '#FFFFFF');
    root.style.setProperty('--border',     d ? 'rgba(255,255,255,0.08)' : '#E8EDF5');
    root.style.setProperty('--border2',    d ? 'rgba(255,255,255,0.12)' : '#E2E8F0');
    root.style.setProperty('--text-1',     d ? '#F1F5F9' : '#0F172A');
    root.style.setProperty('--text-2',     d ? '#94A3B8' : '#475569');
    root.style.setProperty('--text-3',     d ? '#64748B' : '#94A3B8');
    root.style.setProperty('--skeleton-1', d ? '#1E293B' : '#E2E8F0');
    root.style.setProperty('--skeleton-2', d ? '#263348' : '#F1F5F9');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeCtx);
