import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import CalculateIcon from '@mui/icons-material/Calculate';
import BookIcon from '@mui/icons-material/MenuBook';
import logo from '../components/images/Campus-connect-logo.png';
import '../styles/PublicHeader.css';

const PublicHeader = ({ isLoggedIn }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'SGPA Calculator', icon: <CalculateIcon />, path: '/public-sgpa' },
    { text: 'Resources', icon: <BookIcon />, path: '/resources' },
    { text: 'About Us', icon: <InfoIcon />, path: '/about-us' },
    { text: 'Contact', icon: <ContactMailIcon />, path: '/contact' },
  ];

  const authItems = !isLoggedIn
    ? [
        { text: 'Login', icon: <LoginIcon />, path: '/login' },
        { text: 'Register', icon: <AppRegistrationIcon />, path: '/register' },
      ]
    : [];

  return (
    <AppBar position="sticky" className={`modern-header ${scrolled ? 'scrolled' : ''}`}>
      <Toolbar>
        {/* Logo + Title */}
        <div className="logo-container">
          <img src={logo} alt="Campus Connect Logo" className="logo" />
          <Typography variant="h6" component={Link} to="/" className="logo-text">
            Campus Connect
          </Typography>
        </div>

        {/* Desktop Nav Links */}
        <div className="nav-links">
          {menuItems.map((item) => (
            <Link key={item.text} to={item.path} className="nav-link">
              {item.icon}
              {item.text}
            </Link>
          ))}
          {authItems.map((item) => (
            <Link key={item.text} to={item.path} className="nav-link">
              {item.icon}
              {item.text}
            </Link>
          ))}
        </div>

        {/* Mobile Drawer */}
        <div className="mobile-menu">
          <IconButton edge="end" color="inherit" onClick={toggleDrawer(true)}>
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            PaperProps={{ className: 'mobile-drawer' }}
          >
            <div className="drawer-header">
              <img src={logo} alt="logo" className="drawer-logo" />
              <Typography variant="h6">Campus Connect</Typography>
            </div>
            <Divider />

            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={toggleDrawer(false)}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>

            {authItems.length > 0 && (
              <>
                <Divider />
                <List>
                  {authItems.map((item) => (
                    <ListItem
                      button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Drawer>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default PublicHeader;
