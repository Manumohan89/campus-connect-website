// src/components/PublicHeader.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import '../styles/PublicHeader.css';
import logo from '../components/images/campusconnect.jpg'; // Add your logo image

const PublicHeader = ({ isLoggedIn }) => {
    const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleMobileMenuOpen = (event) => {
        setMobileAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileAnchorEl(null);
    };

    return (
        <AppBar position="sticky" className={`header ${scrolled ? 'scrolled' : ''}`}>
            <Toolbar>
                {/* Logo */}
                <div className="logo-container">
                    <img src={logo} alt="Campus Connect Logo" className="logo" />
                    <Typography variant="h6" component={Link} to="/" className="logo-text">
                        Campus Connect
                    </Typography>
                </div>

                {/* Menu Links */}
                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/about-us" className="nav-link">About Us</Link>
                    <Link to="/contact" className="nav-link">Contact</Link>
                    {!isLoggedIn && (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Register</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="mobile-menu">
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        aria-controls="mobile-menu"
                        aria-haspopup="true"
                        onClick={handleMobileMenuOpen}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Menu
                        id="mobile-menu"
                        anchorEl={mobileAnchorEl}
                        keepMounted
                        open={Boolean(mobileAnchorEl)}
                        onClose={handleMobileMenuClose}
                    >
                        <MenuItem component={Link} to="/">Home</MenuItem>
                        <MenuItem component={Link} to="/about-us">About Us</MenuItem>
                        <MenuItem component={Link} to="/contact">Contact</MenuItem>
                        {!isLoggedIn && (
                            <>
                                <MenuItem component={Link} to="/login">Login</MenuItem>
                                <MenuItem component={Link} to="/register">Register</MenuItem>
                            </>
                        )}
                    </Menu>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default PublicHeader;
