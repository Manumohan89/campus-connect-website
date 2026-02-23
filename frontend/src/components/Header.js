import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ShareIcon from '@mui/icons-material/Share';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './Header.css';
import logo from './campusconnect.jpg';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
    { label: 'Upload Marks', path: '/upload-marks', icon: <UploadFileIcon /> },
    { label: 'Share Documents', path: '/share-documents', icon: <ShareIcon /> },
    { label: 'Shared Documents', path: '/shared-documents', icon: <ShareIcon /> },
    { label: 'Reminders', path: '/reminders', icon: <DashboardIcon /> },
    { label: 'Job Opportunities', path: '/job-opportunities', icon: <DashboardIcon /> }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        className="header-appbar"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', padding: '0 16px', minHeight: '64px' }}>
          {/* Left side - Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: 1
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Avatar
              alt="Campus Connect"
              src={logo}
              sx={{
                width: 45,
                height: 45,
                border: '2px solid white'
              }}
            />
            <span className="logo-text">Campus Connect</span>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path ? '#FFD700' : 'white',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? '600' : '500',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    color: '#FFD700'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right side - Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton
              color="inherit"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <NotificationsIcon />
            </IconButton>

            {/* Desktop Logout Button */}
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: 'white',
                textTransform: 'none',
                fontSize: '0.95rem',
                padding: '8px 12px',
                borderRadius: '6px',
                display: { xs: 'none', md: 'flex' },
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255,255,255,0.5)'
                }
              }}
            >
              Logout
            </Button>

            {/* Mobile Menu Button */}
            <IconButton
              edge="end"
              color="inherit"
              onClick={toggleMobileMenu}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleMobileMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: '280px',
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '2px solid #667eea' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#667eea' }}>Navigation</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Quick Menu</p>
        </Box>
        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? '#667eea' : 'transparent',
                color: location.pathname === item.path ? 'white' : '#333',
                mb: 0.5,
                mx: 1,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#667eea',
                  color: 'white'
                }
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', color: 'inherit' }}>
                {item.icon}
              </Box>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              backgroundColor: 'transparent',
              color: '#d32f2f',
              borderTop: '1px solid #ddd',
              mt: 2,
              pt: 2,
              mx: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#ffebee',
                color: '#d32f2f'
              }
            }}
          >
            <LogoutIcon sx={{ mr: 2 }} />
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

export default Header;
