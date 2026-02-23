import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import EmailIcon from '@mui/icons-material/Email';
import BuildIcon from '@mui/icons-material/Build';
import './PublicHeader.css';
import logo from './campusconnect.jpg';

function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'About Us', path: '/about-us', icon: <InfoIcon /> },
    { label: 'Contact', path: '/contact', icon: <EmailIcon /> },
    { label: 'Features', path: '/features', icon: <BuildIcon /> }
  ];

  return (
    <>
      <AppBar
        position="sticky"
        className="public-header-appbar"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          zIndex: 1100
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 16px',
              minHeight: '64px'
            }}
          >
            {/* Logo and Brand */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                gap: 1
              }}
              onClick={() => navigate('/')}
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
              <span className="public-logo-text">Campus Connect</span>
            </Box>

            {/* Desktop Navigation Links */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 1,
                alignItems: 'center'
              }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: location.pathname === link.path ? '#FFD700' : 'white',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: location.pathname === link.path ? '600' : '500',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      color: '#FFD700'
                    }
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            {/* Auth Buttons and Mobile Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Desktop Auth Buttons */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255,255,255,0.5)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#667eea',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    paddingX: '16px',
                    paddingY: '8px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    '&:hover': {
                      backgroundColor: '#FFC107'
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>

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
        </Container>
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
          <h2 style={{ margin: '0 0 8px 0', color: '#667eea' }}>Menu</h2>
        </Box>
        <List>
          {navLinks.map((link) => (
            <ListItem
              button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              sx={{
                backgroundColor: location.pathname === link.path ? '#667eea' : 'transparent',
                color: location.pathname === link.path ? 'white' : '#333',
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
                {link.icon}
              </Box>
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2, borderTop: '2px solid #ddd', display: 'flex', gap: 1, flexDirection: 'column' }}>
          <Button
            fullWidth
            onClick={() => handleNavClick('/login')}
            sx={{
              color: '#667eea',
              border: '1px solid #667eea',
              textTransform: 'none',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: '#667eea',
                color: 'white'
              }
            }}
          >
            Login
          </Button>
          <Button
            fullWidth
            onClick={() => handleNavClick('/register')}
            sx={{
              backgroundColor: '#FFD700',
              color: '#667eea',
              textTransform: 'none',
              fontWeight: '600',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: '#FFC107'
              }
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

export default PublicHeader;
