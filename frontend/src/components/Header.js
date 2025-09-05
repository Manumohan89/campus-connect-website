import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ShareIcon from '@mui/icons-material/Share';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../components/images/Logo-cc.png';
import logo2x from '../components/images/Logo-cc.png'; // High-res version (2x)
import '../styles/Header.css';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMobileMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    handleMenuClose();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar position="sticky" className={`custom-header ${scrolled ? 'scrolled' : ''}`} aria-label="Main navigation">
      <Toolbar className="header-toolbar">
        {/* Logo Section */}
        <Box className="header-logo" onClick={() => navigate('/')} aria-label="Campus Connect Home">
          <picture>
            <source srcSet={logo2x} media="(min-resolution: 192dpi)" />
            <Avatar src={logo} alt="Campus Connect Logo" className="header-logo-avatar" />
          </picture>
          <Typography variant="h6" className="header-logo-text">
            Campus Connect
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box className="header-nav">
          <Button
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            className="nav-button"
            aria-label="Dashboard"
          >
            Dashboard
          </Button>
          <Button
            startIcon={<PersonIcon />}
            onClick={() => navigate('/profile')}
            className="nav-button"
            aria-label="Profile"
          >
            Profile
          </Button>
          <Button
            startIcon={<UploadFileIcon />}
            onClick={() => navigate('/upload-marks')}
            className="nav-button"
            aria-label="Upload Marks"
          >
            Upload Marks
          </Button>
          <Button
            startIcon={<ShareIcon />}
            onClick={() => navigate('/share-documents')}
            className="nav-button"
            aria-label="Share Documents"
          >
            Share Documents
          </Button>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            className="nav-button"
            aria-label="Logout"
          >
            Logout
          </Button>
        </Box>

        {/* Mobile Navigation Menu */}
        <Box className="header-mobile-menu">
          <IconButton
            edge="end"
            onClick={handleMenuOpen}
            className="menu-toggle-icon"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMobileMenuOpen}
            onClose={handleMenuClose}
            className="header-mobile-dropdown"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{ className: 'mobile-menu-paper' }}
          >
            <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }} aria-label="Dashboard">
              <DashboardIcon className="menu-icon" /> Dashboard
            </MenuItem>
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }} aria-label="Profile">
              <PersonIcon className="menu-icon" /> Profile
            </MenuItem>
            <MenuItem onClick={() => { navigate('/upload-marks'); handleMenuClose(); }} aria-label="Upload Marks">
              <UploadFileIcon className="menu-icon" /> Upload Marks
            </MenuItem>
            <MenuItem onClick={() => { navigate('/share-documents'); handleMenuClose(); }} aria-label="Share Documents">
              <ShareIcon className="menu-icon" /> Share Documents
            </MenuItem>
            <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }} aria-label="Logout">
              <LogoutIcon className="menu-icon" /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;