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
import './Header.css';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AppBar position="sticky" className={`header ${scrolled ? 'scrolled' : ''}`} sx={{ backgroundColor: '#2e3b55', padding: 0 }}>
            <Toolbar sx={{ justifyContent: 'space-between', padding: '0 20px' }}>
                {/* Left side logo and title */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        alt="Logo"
                        src="/path/to/logo.png"
                        sx={{ width: 50, height: 50, marginRight: 2, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    />
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        Campus Connect
                    </Typography>
                </Box>

                {/* Desktop Menu with Buttons */}
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <Button color="inherit" onClick={() => navigate('/dashboard')} startIcon={<DashboardIcon />}>Dashboard</Button>
                    <Button color="inherit" onClick={() => navigate('/profile')} startIcon={<PersonIcon />}>Profile</Button>
                    <Button color="inherit" onClick={() => navigate('/upload-marks')} startIcon={<UploadFileIcon />}>Upload Marks</Button>
                    <Button color="inherit" onClick={() => navigate('/share-documents')} startIcon={<ShareIcon />}>Share Documents</Button>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>Logout</Button>
                </Box>

                {/* Mobile Menu Icon */}
                <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
                        <MenuIcon /> {/* MenuIcon for mobile navigation */}
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}><DashboardIcon sx={{ marginRight: '10px' }} /> Dashboard</MenuItem>
                        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}><PersonIcon sx={{ marginRight: '10px' }} /> Profile</MenuItem>
                        <MenuItem onClick={() => { navigate('/upload-marks'); handleMenuClose(); }}><UploadFileIcon sx={{ marginRight: '10px' }} /> Upload Marks</MenuItem>
                        <MenuItem onClick={() => { navigate('/share-documents'); handleMenuClose(); }}><ShareIcon sx={{ marginRight: '10px' }} /> Share Documents</MenuItem>
                        <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}><LogoutIcon sx={{ marginRight: '10px' }} /> Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
