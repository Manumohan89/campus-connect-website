import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Chip,
  Divider, Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotifIcon from '@mui/icons-material/Notifications';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CodeIcon from '@mui/icons-material/Code';
import ForumIcon from '@mui/icons-material/Forum';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShieldIcon from '@mui/icons-material/Shield';

const DRAWER_WIDTH = 240;

const NAV = [
  { label: 'Dashboard',   path: '/admin-portal-9823',             icon: <DashboardIcon />,   color: '#4F46E5' },
  { label: 'Users',       path: '/admin-portal-9823/users',       icon: <PeopleIcon />,      color: '#7C3AED' },
  { label: 'Resources',   path: '/admin-portal-9823/resources',   icon: <MenuBookIcon />,    color: '#0EA5E9' },
  { label: 'Training',    path: '/admin-portal-9823/training',    icon: <PlayCircleIcon />,  color: '#10B981' },
  { label: 'Placements',  path: '/admin-portal-9823/placements',  icon: <WorkIcon />,        color: '#F59E0B' },
  { label: 'Community',   path: '/admin-portal-9823/community',   icon: <GroupIcon />,       color: '#EF4444' },
  { label: 'Alumni',       path: '/admin-portal-9823/alumni',        icon: <SchoolIcon />,         color: '#EC4899' },
  { label: 'Messages',     path: '/admin-portal-9823/messages',      icon: <EmailIcon />,          color: '#06B6D4' },
  { label: 'Analytics',    path: '/admin-portal-9823/analytics',     icon: <BarChartIcon />,       color: '#8B5CF6' },
  { label: 'Notifications',path: '/admin-portal-9823/notifications', icon: <NotifIcon />,          color: '#F97316' },
  { label: 'Certificates', path: '/admin-portal-9823/certificates',  icon: <EmojiEventsIcon />,    color: '#F59E0B' },
  { label: 'Coding Problems', path: '/admin-portal-9823/coding',          icon: <CodeIcon />,           color: '#0f0f0f' },
  { label: 'Job Listings',  path: '/admin-portal-9823/jobs',          icon: <WorkIcon />,           color: '#059669' },
  { label: 'Forum',         path: '/admin-portal-9823/forum',           icon: <ForumIcon />,           color: '#7C3AED' },
  { label: 'Leaderboard',   path: '/admin-portal-9823/leaderboard',     icon: <LeaderboardIcon />,     color: '#F59E0B' },
  { label: 'Payments',      path: '/admin-portal-9823/payments',         icon: <PaymentIcon />,         color: '#10B981' },
  { label: 'Settings',     path: '/admin-portal-9823/settings',      icon: <SettingsIcon />,       color: '#6B7280' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin-portal-9823') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0F172A' }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '0.9rem', lineHeight: 1.2, fontFamily: "'Space Grotesk', sans-serif" }}>
            Admin Panel
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Campus Connect
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#1E293B', mx: 2, mb: 1 }} />

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1.5 }}>
        {NAV.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem
              button key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: '10px', mb: 0.5, py: 1,
                bgcolor: active ? `${item.color}18` : 'transparent',
                border: `1px solid ${active ? item.color + '44' : 'transparent'}`,
                '&:hover': { bgcolor: `${item.color}12` },
                transition: 'all 0.15s',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? item.color : '#475569' }}>
                {React.cloneElement(item.icon, { fontSize: 'small' })}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? item.color : '#94A3B8',
                }}
              />
              {active && (
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.color, ml: 0.5 }} />
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#1E293B', mx: 2, mb: 1 }} />

      {/* Bottom actions */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Tooltip title="Back to main app">
          <ListItem button onClick={() => navigate('/dashboard')} sx={{ borderRadius: '10px', mb: 0.5, '&:hover': { bgcolor: '#1E293B' } }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#475569' }}><OpenInNewIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Student App" primaryTypographyProps={{ fontSize: '0.8rem', color: '#64748B' }} />
          </ListItem>
        </Tooltip>
        <ListItem button onClick={handleLogout} sx={{ borderRadius: '10px', '&:hover': { bgcolor: '#FEF2F2' } }}>
          <ListItemIcon sx={{ minWidth: 36, color: '#EF4444' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 600 }} />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxShadow: '4px 0 20px rgba(0,0,0,0.1)' },
        }}
      >
        <DrawerContent />
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer
        variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
      >
        <DrawerContent />
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <AppBar position="sticky" elevation={0}
          sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', zIndex: 1 }}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '60px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
                <MenuIcon />
              </IconButton>
              <Chip
                icon={<ShieldIcon sx={{ fontSize: '14px !important', color: '#4F46E5 !important' }} />}
                label="Admin Portal"
                size="small"
                sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.75rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                {NAV.find(n => isActive(n.path))?.label || 'Admin'}
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#4F46E5', fontSize: '0.8rem' }}>A</Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
