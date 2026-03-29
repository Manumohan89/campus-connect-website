import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Button, Box, IconButton, Drawer,
  List, ListItem, ListItemText, ListItemIcon, Container, Typography, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import EmailIcon from '@mui/icons-material/Email';
import HelpIcon from '@mui/icons-material/Help';
import Calculate from '@mui/icons-material/Calculate';
import SchoolIcon from '@mui/icons-material/School';

const NAV = [
  { label: 'Home',     path: '/',          icon: <HomeIcon fontSize="small" /> },
  { label: 'About',    path: '/about-us',  icon: <InfoIcon fontSize="small" /> },
  { label: 'Contact',  path: '/contact',   icon: <EmailIcon fontSize="small" /> },
  { label: 'FAQ',      path: '/faq',       icon: <HelpIcon fontSize="small" /> },
  { label: 'SGPA Calc', path: '/sgpa-calculator', icon: <Calculate fontSize="small" /> },
  { label: 'VTU Results', path: '/vtu-result', icon: <SchoolIcon fontSize="small" /> },
];

export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (p) => location.pathname === p;

  return (
    <>
      <AppBar position="sticky" elevation={0}
        sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: 0, minHeight: '64px' }}>

            {/* Logo */}
            <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '9px', bgcolor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'white', letterSpacing: '-0.3px' }}>
                Campus Connect
              </Typography>
            </Box>

            {/* Desktop nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.25, alignItems: 'center' }}>
              {NAV.map(n => (
                <Button key={n.path} onClick={() => navigate(n.path)}
                  sx={{
                    color: isActive(n.path) ? '#FDE68A' : 'rgba(255,255,255,0.82)',
                    textTransform: 'none', fontSize: '0.875rem',
                    fontWeight: isActive(n.path) ? 700 : 500,
                    px: 1.5, py: 0.75, borderRadius: '8px',
                    bgcolor: isActive(n.path) ? 'rgba(255,255,255,0.12)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                  }}>
                  {n.label}
                </Button>
              ))}
            </Box>

            {/* Auth buttons + mobile toggle */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button onClick={() => navigate('/login')}
                  sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'none', px: 2, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.22)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} variant="contained"
                  sx={{ bgcolor: '#FDE68A', color: '#1E1B4B', textTransform: 'none', fontWeight: 700, px: 2, borderRadius: '8px', '&:hover': { bgcolor: '#FCD34D' }, boxShadow: 'none' }}>
                  Sign Up
                </Button>
              </Box>
              <IconButton onClick={() => setOpen(true)} sx={{ color: 'white', display: { xs: 'flex', md: 'none' } }}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 280 } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B, #4F46E5)', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700} color="white" fontFamily="'Space Grotesk', sans-serif">Menu</Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <List>
          {NAV.map(n => (
            <ListItem button key={n.path} onClick={() => { navigate(n.path); setOpen(false); }}
              sx={{ bgcolor: isActive(n.path) ? '#EEF2FF' : 'transparent', mx: 1, borderRadius: '8px', mb: 0.5 }}>
              <ListItemIcon sx={{ color: isActive(n.path) ? '#4F46E5' : '#64748B', minWidth: 36 }}>{n.icon}</ListItemIcon>
              <ListItemText primary={n.label} primaryTypographyProps={{ fontWeight: isActive(n.path) ? 700 : 400, fontSize: '0.9rem' }} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => { navigate('/login'); setOpen(false); }}
            sx={{ textTransform: 'none', borderRadius: '10px', borderColor: '#E5E7EB', fontWeight: 600 }}>
            Login
          </Button>
          <Button fullWidth variant="contained" onClick={() => { navigate('/register'); setOpen(false); }}
            sx={{ textTransform: 'none', borderRadius: '10px', bgcolor: '#4F46E5', fontWeight: 700, boxShadow: 'none' }}>
            Sign Up Free
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
