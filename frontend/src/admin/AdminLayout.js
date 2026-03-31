import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Chip,
  Divider, Tooltip, Badge, Collapse
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
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DRAWER_WIDTH = 252;

const NAV_GROUPS = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard',    path: '/admin-portal-9823',             icon: <DashboardIcon />,   color: '#6366F1', badge: null },
      { label: 'Analytics',    path: '/admin-portal-9823/analytics',   icon: <BarChartIcon />,    color: '#8B5CF6', badge: null },
    ]
  },
  {
    group: 'People',
    items: [
      { label: 'Users',        path: '/admin-portal-9823/users',       icon: <PeopleIcon />,      color: '#3B82F6', badge: null },
      { label: 'Alumni',       path: '/admin-portal-9823/alumni',      icon: <SchoolIcon />,      color: '#EC4899', badge: null },
      { label: 'Community',    path: '/admin-portal-9823/community',   icon: <GroupIcon />,       color: '#F43F5E', badge: null },
    ]
  },
  {
    group: 'Content',
    items: [
      { label: 'Resources',    path: '/admin-portal-9823/resources',   icon: <MenuBookIcon />,    color: '#0EA5E9', badge: null },
      { label: 'Training',     path: '/admin-portal-9823/training',    icon: <PlayCircleIcon />,  color: '#10B981', badge: null },
      { label: 'Certificates', path: '/admin-portal-9823/certificates',icon: <EmojiEventsIcon />, color: '#F59E0B', badge: null },
      { label: 'Coding',       path: '/admin-portal-9823/coding',      icon: <CodeIcon />,        color: '#1E293B', badge: null },
      { label: 'Forum',        path: '/admin-portal-9823/forum',       icon: <ForumIcon />,       color: '#7C3AED', badge: null },
    ]
  },
  {
    group: 'Operations',
    items: [
      { label: 'Placements',   path: '/admin-portal-9823/placements',  icon: <WorkIcon />,        color: '#F59E0B', badge: null },
      { label: 'Job Listings', path: '/admin-portal-9823/jobs',        icon: <WorkIcon />,        color: '#059669', badge: null },
      { label: 'Leaderboard',  path: '/admin-portal-9823/leaderboard', icon: <LeaderboardIcon />, color: '#F59E0B', badge: null },
      { label: 'Payments',     path: '/admin-portal-9823/payments',    icon: <PaymentIcon />,     color: '#10B981', badge: null },
    ]
  },
  {
    group: 'Communication',
    items: [
      { label: 'Messages',     path: '/admin-portal-9823/messages',    icon: <EmailIcon />,       color: '#06B6D4', badge: 3 },
      { label: 'Notifications',path: '/admin-portal-9823/notifications',icon: <NotifIcon />,      color: '#F97316', badge: 5 },
    ]
  },
  {
    group: 'System',
    items: [
      { label: 'Settings',     path: '/admin-portal-9823/settings',    icon: <SettingsIcon />,    color: '#6B7280', badge: null },
    ]
  },
];

const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const isActive = (path) => path === '/admin-portal-9823' ? location.pathname === path : location.pathname.startsWith(path);
  const currentPage = ALL_NAV.find(n => isActive(n.path));

  const filtered = searchQ.trim()
    ? ALL_NAV.filter(n => n.label.toLowerCase().includes(searchQ.toLowerCase()))
    : [];

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0B1120', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle background gradient */}
      <Box sx={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: 60, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
          }}>
            <ShieldIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '0.9rem', lineHeight: 1.1, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
              Admin Portal
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#4F46E5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Campus Connect
            </Typography>
          </Box>
        </Box>

        {/* Live time */}
        <Box sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace' }}>
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </Typography>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          <Typography sx={{ fontSize: '0.65rem', color: '#475569' }}>System Live</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2.5 }} />

      {/* Nav groups */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5, overflowY: 'auto', overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 3 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#1E293B', borderRadius: 99 },
        position: 'relative', zIndex: 1,
      }}>
        {NAV_GROUPS.map((grp) => (
          <Box key={grp.group} sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.18em', px: 1.5, py: 0.75 }}>
              {grp.group}
            </Typography>
            {grp.items.map((item) => {
              const active = isActive(item.path);
              return (
                <ListItem
                  button key={item.path}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  sx={{
                    borderRadius: '9px', mb: 0.25, py: 0.85, px: 1.5,
                    bgcolor: active ? `${item.color}20` : 'transparent',
                    border: `1px solid ${active ? item.color + '35' : 'transparent'}`,
                    '&:hover': { bgcolor: active ? `${item.color}20` : 'rgba(255,255,255,0.04)' },
                    transition: 'all 0.12s',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '7px',
                      bgcolor: active ? `${item.color}25` : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.12s',
                    }}>
                      {React.cloneElement(item.icon, { sx: { fontSize: 15, color: active ? item.color : '#475569' } })}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: active ? 700 : 500, color: active ? item.color : '#64748B', letterSpacing: '-0.01em' }}
                  />
                  {item.badge && (
                    <Box sx={{ background: item.color, borderRadius: 99, px: 0.8, py: 0.1, minWidth: 18, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: 'white', lineHeight: 1.6 }}>{item.badge}</Typography>
                    </Box>
                  )}
                  {active && !item.badge && (
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: item.color, flexShrink: 0, boxShadow: `0 0 8px ${item.color}` }} />
                  )}
                </ListItem>
              );
            })}
          </Box>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2.5 }} />

      {/* Bottom */}
      <Box sx={{ px: 1.5, py: 2, position: 'relative', zIndex: 1 }}>
        <ListItem button onClick={() => navigate('/dashboard')} sx={{ borderRadius: '9px', mb: 0.5, py: 0.85, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <OpenInNewIcon sx={{ fontSize: 14, color: '#475569' }} />
            </Box>
          </ListItemIcon>
          <ListItemText primary="Student App" primaryTypographyProps={{ fontSize: '0.8rem', color: '#64748B' }} />
        </ListItem>
        <ListItem button onClick={handleLogout} sx={{ borderRadius: '9px', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoutIcon sx={{ fontSize: 14, color: '#EF4444' }} />
            </Box>
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 600 }} />
        </ListItem>

        {/* Admin badge */}
        <Box sx={{ mt: 1.5, background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: '10px', px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: '#4F46E5', fontSize: '0.7rem', fontWeight: 800 }}>A</Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Administrator</Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#6366F1' }}>Full access</Typography>
          </Box>
          <Box sx={{ ml: 'auto', width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F1F5F9' }}>
      {/* Desktop sidebar */}
      <Drawer variant="permanent"
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.2)' } }}>
        <DrawerContent />
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>
        <DrawerContent />
      </Drawer>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <AppBar position="sticky" elevation={0}
          sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', zIndex: 100 }}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '60px !important', px: { xs: 2, md: 3 } }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton onClick={() => setMobileOpen(true)} size="small" sx={{ display: { md: 'none' }, color: '#374151' }}>
                <MenuIcon fontSize="small" />
              </IconButton>

              {/* Breadcrumb */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small"
                  icon={<ShieldIcon sx={{ fontSize: '13px !important', color: '#4F46E5 !important' }} />}
                  label="Admin"
                  sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                />
                {currentPage && (
                  <>
                    <ChevronRightIcon sx={{ fontSize: 14, color: '#CBD5E1' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: currentPage.color }} />
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>{currentPage.label}</Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Search */}
              {searchOpen ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', px: 1.5, py: 0.5 }}>
                  <SearchIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                  <input
                    autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search pages..."
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.82rem', color: '#374151', width: 140 }}
                  />
                  {filtered.length > 0 && (
                    <Box sx={{ position: 'absolute', top: 56, right: 60, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 9999, minWidth: 180, overflow: 'hidden' }}>
                      {filtered.map(n => (
                        <Box key={n.path} onClick={() => { navigate(n.path); setSearchOpen(false); setSearchQ(''); }}
                          sx={{ px: 2, py: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5, '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: n.color, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>{n.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <IconButton size="small" onClick={() => { setSearchOpen(false); setSearchQ(''); }} sx={{ p: 0 }}>
                    <CloseIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                  </IconButton>
                </Box>
              ) : (
                <Tooltip title="Search pages (/)">
                  <IconButton size="small" onClick={() => setSearchOpen(true)} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', p: 0.75 }}>
                    <SearchIcon sx={{ fontSize: 16, color: '#64748B' }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Notification bell */}
              <Tooltip title="Notifications">
                <IconButton size="small" onClick={() => navigate('/admin-portal-9823/notifications')}
                  sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', p: 0.75 }}>
                  <Badge badgeContent={5} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', minWidth: 14, height: 14, padding: 0 } }}>
                    <NotifIcon sx={{ fontSize: 16, color: '#64748B' }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Avatar */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', px: 1.25, py: 0.5 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#4F46E5', fontSize: '0.65rem', fontWeight: 800 }}>A</Avatar>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: { xs: 'none', sm: 'block' } }}>Admin</Typography>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 5px #10B981' }} />
              </Box>
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
