// src/components/Header.js

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ShareIcon from '@mui/icons-material/Share';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';

import '../styles/Header.css';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleMenuClose = () => setAnchorEl(null);
  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar position="fixed" className={`custom-header ${scrolled ? 'scrolled' : ''}`}>
      <Toolbar className="header-toolbar">
        {/* Logo Section */}
        <Box className="header-logo" onClick={() => navigate('/')}>
          <Avatar src={require("../components/images/campusconnect.jpg")} alt="Logo" className="header-logo-avatar" />
          <Typography variant="h6" className="header-logo-text">
            Campus Connect
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box className="header-nav">
          <Button startIcon={<DashboardIcon />} onClick={() => navigate('/dashboard')}>Dashboard</Button>
          <Button startIcon={<PersonIcon />} onClick={() => navigate('/profile')}>Profile</Button>
          <Button startIcon={<UploadFileIcon />} onClick={() => navigate('/upload-marks')}>Upload Marks</Button>
          <Button startIcon={<ShareIcon />} onClick={() => navigate('/share-documents')}>Share Documents</Button>
          <Button startIcon={<LogoutIcon />} onClick={handleLogout}>Logout</Button>
        </Box>

        {/* Mobile Navigation Menu */}
        <Box className="header-mobile-menu">
          <IconButton onClick={handleMobileMenuToggle} className="menu-toggle-icon">
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuToggle}
            className="header-mobile-dropdown"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
              <DashboardIcon className="menu-icon" /> Dashboard
            </MenuItem>
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              <PersonIcon className="menu-icon" /> Profile
            </MenuItem>
            <MenuItem onClick={() => { navigate('/upload-marks'); handleMenuClose(); }}>
              <UploadFileIcon className="menu-icon" /> Upload Marks
            </MenuItem>
            <MenuItem onClick={() => { navigate('/share-documents'); handleMenuClose(); }}>
              <ShareIcon className="menu-icon" /> Share Documents
            </MenuItem>
            <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
              <LogoutIcon className="menu-icon" /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
