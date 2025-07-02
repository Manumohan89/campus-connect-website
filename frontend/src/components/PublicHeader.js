import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import CalculateIcon from '@mui/icons-material/Calculate';
import BookIcon from '@mui/icons-material/MenuBook';
import logo from '../components/images/campusconnect.jpg';
import '../styles/PublicHeader.css';

const PublicHeader = ({ isLoggedIn }) => {
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuOpen = (event) => setMobileAnchorEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileAnchorEl(null);

  return (
    <AppBar position="sticky" className={`modern-header ${scrolled ? 'scrolled' : ''}`}>
      <Toolbar>
        <div className="logo-container">
          <img src={logo} alt="Campus Connect Logo" className="logo" />
          <Typography variant="h6" component={Link} to="/" className="logo-text">
            Campus Connect
          </Typography>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link"><HomeIcon className="nav-icon" />Home</Link>
          <Link to="/public-sgpa" className="nav-link"><CalculateIcon className="nav-icon" />SGPA Calculator</Link>
          <Link to="/resources" className="nav-link"><BookIcon className="nav-icon" />Resources</Link>
          <Link to="/about-us" className="nav-link"><InfoIcon className="nav-icon" />About</Link>
          <Link to="/contact" className="nav-link"><ContactMailIcon className="nav-icon" />Contact</Link>
          {!isLoggedIn && (
            <>
              <Link to="/login" className="nav-link"><LoginIcon className="nav-icon" />Login</Link>
              <Link to="/register" className="nav-link"><AppRegistrationIcon className="nav-icon" />Register</Link>
            </>
          )}
        </div>

        <div className="mobile-menu">
          <IconButton edge="end" color="inherit" onClick={handleMobileMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={mobileAnchorEl} open={Boolean(mobileAnchorEl)} onClose={handleMobileMenuClose}>
            <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}><HomeIcon /> Home</MenuItem>
            <MenuItem component={Link} to="/public-sgpa" onClick={handleMobileMenuClose}><CalculateIcon /> SGPA Calculator</MenuItem>
            <MenuItem component={Link} to="/resources" onClick={handleMobileMenuClose}><BookIcon /> Resources</MenuItem>
            <MenuItem component={Link} to="/about-us" onClick={handleMobileMenuClose}><InfoIcon /> About Us</MenuItem>
            <MenuItem component={Link} to="/contact" onClick={handleMobileMenuClose}><ContactMailIcon /> Contact</MenuItem>
            {!isLoggedIn && (
              <>
                <MenuItem component={Link} to="/login" onClick={handleMobileMenuClose}><LoginIcon /> Login</MenuItem>
                <MenuItem component={Link} to="/register" onClick={handleMobileMenuClose}><AppRegistrationIcon /> Register</MenuItem>
              </>
            )}
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default PublicHeader;
