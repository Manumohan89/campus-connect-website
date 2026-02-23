// src/components/PublicHeader.js
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import './PublicHeader.css';
import logo from '../components/campusconnect.jpg'; // Add your logo image

const PublicHeader = ({ isLoggedIn, handleLogout }) => {
    const [anchorEl, setAnchorEl] = useState(null);
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

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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
                </div>

                {/* Account & Mobile Menu */}
                <div className="right-icons">
                    <IconButton
                        edge="end"
                        aria-label="account of current user"
                        aria-haspopup="true"
                        onClick={handleMenuOpen}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>

                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {isLoggedIn ? (
                            <>
                                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </>
                        ) : (
                            <>
                                <MenuItem component={Link} to="/login" onClick={handleMenuClose}>Login</MenuItem>
                                <MenuItem component={Link} to="/register" onClick={handleMenuClose}>Register</MenuItem>
                            </>
                        )}
                    </Menu>

                    {/* Mobile Menu */}
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
