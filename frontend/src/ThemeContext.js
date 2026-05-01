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
    
    // Inject/update CSS variables for theme propagation
    const root = document.documentElement;
    
    // Background variables
    root.style.setProperty('--bg-page',    d ? '#0F172A' : '#F4F6FB');
    root.style.setProperty('--bg-card',    d ? '#1E293B' : '#FFFFFF');
    root.style.setProperty('--bg-card2',   d ? '#263348' : '#F8FAFC');
    root.style.setProperty('--bg-input',   d ? '#0F172A' : '#FFFFFF');
    root.style.setProperty('--bg-overlay', d ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.9)');
    
    // Border variables
    root.style.setProperty('--border',     d ? 'rgba(255,255,255,0.08)' : '#E8EDF5');
    root.style.setProperty('--border2',    d ? 'rgba(255,255,255,0.12)' : '#E2E8F0');
    root.style.setProperty('--border3',    d ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)');
    
    // Text color variables
    root.style.setProperty('--text-1',     d ? '#F1F5F9' : '#0F172A');
    root.style.setProperty('--text-2',     d ? '#94A3B8' : '#475569');
    root.style.setProperty('--text-3',     d ? '#64748B' : '#94A3B8');
    root.style.setProperty('--text-muted', d ? '#475569' : '#9CA3AF');
    root.style.setProperty('--text-disabled', d ? '#334155' : '#D1D5DB');
    
    // Skeleton/placeholder variables
    root.style.setProperty('--skeleton-1', d ? '#1E293B' : '#E2E8F0');
    root.style.setProperty('--skeleton-2', d ? '#263348' : '#F1F5F9');
    
    // Brand/accent variables
    root.style.setProperty('--primary',    '#4F46E5');
    root.style.setProperty('--primary-light', '#818CF8');
    root.style.setProperty('--primary-dark', '#3730A3');
    root.style.setProperty('--secondary',  '#7C3AED');
    root.style.setProperty('--secondary-light', '#A78BFA');
    
    // Status colors
    root.style.setProperty('--success',    '#10B981');
    root.style.setProperty('--warning',    '#F59E0B');
    root.style.setProperty('--error',      '#EF4444');
    root.style.setProperty('--info',       '#0EA5E9');
    
    // Shadow variables
    root.style.setProperty('--shadow-sm',  d ? '0 1px 2px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.05)');
    root.style.setProperty('--shadow-md',  d ? '0 4px 6px rgba(0,0,0,0.25)' : '0 4px 6px rgba(0,0,0,0.1)');
    root.style.setProperty('--shadow-lg',  d ? '0 10px 15px rgba(0,0,0,0.3)' : '0 10px 15px rgba(0,0,0,0.1)');
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
