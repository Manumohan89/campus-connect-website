import React from 'react';
import { Box, Grid, Typography, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import './PublicFooter.css';

const PublicFooter = () => {
    return (
        <Box className="footer" sx={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '40px 0' }}>
            <Box className="footer-container">
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" className="footer-heading">Company</Typography>
                        <Link href="/about" color="inherit" underline="none" className="footer-link">About Us</Link><br />
                        <Link href="/contact" color="inherit" underline="none" className="footer-link">Contact Us</Link><br />
                        <Link href="/careers" color="inherit" underline="none" className="footer-link">Careers</Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" className="footer-heading">Support</Typography>
                        <Link href="/faq" color="inherit" underline="none" className="footer-link">FAQ</Link><br />
                        <Link href="/terms" color="inherit" underline="none" className="footer-link">Terms of Service</Link><br />
                        <Link href="/privacy" color="inherit" underline="none" className="footer-link">Privacy Policy</Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" className="footer-heading">Follow Us</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '15px', mt: 2 }}>
                            <Link href="https://facebook.com" target="_blank" color="inherit">
                                <FacebookIcon />
                            </Link>
                            <Link href="https://twitter.com" target="_blank" color="inherit">
                                <TwitterIcon />
                            </Link>
                            <Link href="https://instagram.com" target="_blank" color="inherit">
                                <InstagramIcon />
                            </Link>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                        &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default PublicFooter;
