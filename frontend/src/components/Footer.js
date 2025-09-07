import React from 'react';
import { Box, Grid, Typography, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <Box
      className="footer"
      sx={{
        backgroundColor: '#2e3b55',
        color: '#fff',
        padding: '40px 20px 20px',
        margin: 0,
      }}
    >
      <Box className="footer-container">
        <Grid container spacing={4}>
          {/* Company Section */}
          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" gutterBottom>
              Company
            </Typography>
            <Link href="/about-us" color="inherit" underline="none" className="footer-link">
              About Us
            </Link>
            <br />
            <Link href="/contact" color="inherit" underline="none" className="footer-link">
              Contact Us
            </Link>
            <br />
            <Link href="/careers" color="inherit" underline="none" className="footer-link">
              Careers
            </Link>
          </Grid>

          {/* Support Section */}
          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Link href="/faq" color="inherit" underline="none" className="footer-link">
              FAQ
            </Link>
            <br />
            <Link href="/terms" color="inherit" underline="none" className="footer-link">
              Terms of Service
            </Link>
            <br />
            <Link href="/privacy-policy" color="inherit" underline="none" className="footer-link">
              Privacy Policy
            </Link>
          </Grid>

          {/* Social Media Section */}
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <Link href="https://facebook.com" target="_blank" color="inherit" aria-label="Facebook">
                <FacebookIcon fontSize="large" />
              </Link>
              <Link href="https://twitter.com" target="_blank" color="inherit" aria-label="Twitter">
                <TwitterIcon fontSize="large" />
              </Link>
              <Link href="https://instagram.com" target="_blank" color="inherit" aria-label="Instagram">
                <InstagramIcon fontSize="large" />
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Note */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
