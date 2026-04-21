import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation, BottomNavigationAction, Paper, Badge
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import api from '../utils/api';

const NAV_ITEMS = [
  { label: 'Home',      value: '/dashboard',         icon: <DashboardIcon /> },
  { label: 'Career',    value: '/internship-programs', icon: <WorkIcon /> },
  { label: 'Projects',  value: '/projects',           icon: <CodeIcon /> },
  { label: 'Learn',     value: '/training',           icon: <MenuBookIcon /> },
  { label: 'Profile',   value: '/profile',            icon: <PersonIcon /> },
];

// Paths where bottom nav should be hidden (public pages, fullscreen tools)
const HIDDEN_PATHS = [
  '/', '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password',
  '/sgpa-calculator', '/about-us', '/contact', '/faq', '/terms', '/privacy-policy',
  '/vtu-result', '/leaderboard', '/vtu-news', '/scholarships',
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  // Load unread count
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/users/notifications/unread-count').then(r => {
      setUnread(r.data?.count || 0);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Don't show on public pages or if not logged in
  const token = localStorage.getItem('token');
  if (!token) return null;
  if (HIDDEN_PATHS.some(p => location.pathname === p)) return null;
  if (location.pathname.startsWith('/admin-portal')) return null;
  if (location.pathname.startsWith('/certificate/')) return null;

  // Find current active value
  const activeValue = NAV_ITEMS.find(item =>
    location.pathname === item.value ||
    (item.value !== '/dashboard' && location.pathname.startsWith(item.value))
  )?.value || false;

  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'block', sm: 'none' },  // only on mobile
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderTop: '1px solid #E2E8F0',
        boxShadow: '0 -4px 24px rgba(15,23,42,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        value={activeValue}
        onChange={(_, newValue) => navigate(newValue)}
        sx={{
          height: 60,
          bgcolor: 'white',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            padding: '6px 0 2px',
            color: '#94A3B8',
            fontSize: '0.65rem',
            '&.Mui-selected': {
              color: '#4F46E5',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.62rem !important',
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            marginTop: '2px',
            '&.Mui-selected': {
              fontSize: '0.62rem !important',
            },
          },
        }}
      >
        {NAV_ITEMS.map(item => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={
              item.label === 'Profile' && unread > 0 ? (
                <Badge badgeContent={unread} color="error" max={9}
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', minWidth: 14, height: 14, padding: '0 3px' } }}>
                  {item.icon}
                </Badge>
              ) : item.icon
            }
            sx={{
              '& .MuiSvgIcon-root': {
                fontSize: '1.4rem',
                transition: 'transform 0.2s',
              },
              '&.Mui-selected .MuiSvgIcon-root': {
                transform: 'scale(1.1)',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
