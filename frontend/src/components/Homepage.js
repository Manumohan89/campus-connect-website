import React, { useEffect, useRef } from 'react';
import { Container, Box, Typography, Button, Grid, Paper, Zoom } from '@mui/material';
import { Link } from 'react-router-dom';
import TestimonialsGrid from '../components/TestimonialsGrid';
import Counter from '../components/Counter';
import NewsletterPopup from '../components/NewsletterPopup';
import LiveChat from '../components/LiveChat';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import FAQ from '../components/FAQ';
import '../styles/Home.css';

const Home = () => {
  const ctaRef = useRef(null);

  // Custom cursor and scroll-triggered CTA animation
  useEffect(() => {
    // Custom cursor
    const cursor = document.querySelector('.custom-cursor');
    const handleMouseMove = (e) => {
      cursor.style.left = `${e.clientX - 12}px`;
      cursor.style.top = `${e.clientY - 12}px`;
    };
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, .service-card, .faq-card')) {
        cursor.classList.add('active');
      } else {
        cursor.classList.remove('active');
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);

    // CTA animation
    const ctaElement = ctaRef.current; // Store ref value
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );
    if (ctaElement) observer.observe(ctaElement);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      if (ctaElement) observer.unobserve(ctaElement); // Use stored value
    };
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <>
      <PublicHeader />
      <div className="home-page">
        {/* Custom Cursor */}
        <div className="custom-cursor"></div>

        {/* Hero Section */}
        <Box className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-text">
            <Typography
              variant="h2"
              className="hero-title"
              aria-label="Campus Connect Academic Companion"
              tabIndex={0}
            >
              Campus Connect
            </Typography>
            <Typography
              variant="h5"
              className="hero-subtitle"
              aria-label="Services description"
            >
              SGPA Calculation | Document Sharing | Job Opportunities
            </Typography>
            <Zoom in={true} timeout={1000}>
              <Button
                variant="contained"
                className="hero-btn"
                component={Link}
                to="/register"
                aria-label="Get started with Campus Connect"
              >
                Get Started
              </Button>
            </Zoom>
          </div>
        </Box>

        {/* Quick Links */}
        <Container className="quick-links">
          <Grid container spacing={4} justifyContent="center">
            <Grid item>
              <Button
                variant="outlined"
                className="quick-link-btn primary"
                component={Link}
                to="/public-sgpa"
                aria-label="Try SGPA Calculator"
              >
                Try SGPA Calculator
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                className="quick-link-btn secondary"
                component={Link}
                to="/resources"
                aria-label="Visit Resources Page"
              >
                Visit Resources Page
              </Button>
            </Grid>
          </Grid>
        </Container>

        {/* Video Section */}
        <Container maxWidth="md" className="video-section">
          <Typography
            variant="h4"
            className="section-title"
            aria-label="How Campus Connect Works"
          >
            How Campus Connect Works
          </Typography>
          <Box className="video-container">
            <iframe
              width="100%"
              height="400"
              src={require('../components/videos/campus-connect video.mp4')}
              title="Campus Connect Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </Box>
        </Container>

        {/* Services */}
        <Container maxWidth="lg" className="featured-services">
          <Typography
            variant="h4"
            className="section-title"
            aria-label="Our Services"
          >
            Our Services
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper className="service-card" elevation={0}>
                <div className="service-icon calculator-icon"></div>
                <Typography variant="h5" className="service-title">
                  SGPA & CGPA Calculation
                </Typography>
                <Typography className="service-text">
                  Track and calculate your academic performance with ease.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper className="service-card" elevation={0}>
                <div className="service-icon document-icon"></div>
                <Typography variant="h5" className="service-title">
                  Document Sharing
                </Typography>
                <Typography className="service-text">
                  Share important study materials and projects securely.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper className="service-card" elevation={0}>
                <div className="service-icon job-icon"></div>
                <Typography variant="h5" className="service-title">
                  Job Opportunities
                </Typography>
                <Typography className="service-text">
                  Explore relevant internships and job opportunities in your field.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Stats */}
        <Container className="stats-section">
          <Typography
            variant="h4"
            className="section-title"
            aria-label="Our Impact"
          >
            Our Impact
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Counter end="5000" duration="3" icon="📘" />
              <Typography className="counter-text">
                SGPA Calculated
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Counter end="1200" duration="3" icon="📝" />
              <Typography className="counter-text">
                Documents Shared
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Counter end="300" duration="3" icon="💼" />
              <Typography className="counter-text">
                Job Opportunities Found
              </Typography>
            </Grid>
          </Grid>
        </Container>

        {/* Call-to-Action Banner */}
        <Container maxWidth="md" className="cta-banner" ref={ctaRef}>
          <Box className="cta-content">
            <Typography
              variant="h4"
              className="cta-title"
              aria-label="Join Campus Connect Today"
            >
              Join Campus Connect Today
            </Typography>
            <Typography
              variant="body1"
              className="cta-text"
              aria-label="CTA description"
            >
              Unlock powerful tools to boost your academic and professional journey.
            </Typography>
            <Button
              variant="contained"
              className="cta-btn primary-btn"
              component={Link}
              to="/register"
              aria-label="Sign up now"
            >
              Sign Up Now
            </Button>
          </Box>
        </Container>

        <TestimonialsGrid />
        <FAQ />
        <LiveChat />
        <NewsletterPopup />
      </div>
      <PublicFooter />
    </>
  );
};

export default Home;