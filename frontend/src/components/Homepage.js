import React, { useEffect, useRef } from 'react';
import { Container, Box, Button, Grid, Paper,Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import TestimonialsGrid from '../components/TestimonialsGrid';
import Counter from '../components/Counter';
import NewsletterPopup from '../components/NewsletterPopup';
import LiveChat from '../components/LiveChat';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import FAQ from '../components/FAQ';
import heroVideo from '../components/videos/HomePage-1.mp4'; // Ensure this path is correct
import demoVideo from '../components/videos/campus-connect video.mp4'; // Separate video for demo section
import fallbackImage from '../components/images/frontpage.png'; // Fallback image for video
import '../styles/Home.css';

// Reusable ServiceCard component
const ServiceCard = ({ iconClass, title, description }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Paper className="service-card" elevation={0} role="article">
      <div className={`service-icon ${iconClass}`} aria-hidden="true" />
      <Typography variant="h5" className="service-title">
        {title}
      </Typography>
      <Typography className="service-text">{description}</Typography>
    </Paper>
  </Grid>
);

const Home = () => {
  const ctaRef = useRef(null);

  useEffect(() => {
    const cursor = document.querySelector('.custom-cursor');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;

    if (!isTouchDevice && cursor) {
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

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseover', handleMouseOver);
      };
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const ctaElement = ctaRef.current;
    if (ctaElement) observer.observe(ctaElement);

    return () => {
      if (ctaElement) observer.unobserve(ctaElement);
    };
  }, []);

  return (
    <>
      <PublicHeader />
      <div className="home-page">
        <div className="custom-cursor" aria-hidden="true" />
        <Box className="hero-section" role="banner">
          <video className="hero-video" autoPlay loop muted playsInline poster={fallbackImage}>
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>

        <Container className="quick-links" role="navigation">
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

        <Container maxWidth="md" className="video-section">
          <Typography
            variant="h4"
            className="section-title"
            aria-label="How Campus Connect Works"
          >
            How Campus Connect Works
          </Typography>
          <Box className="video-container">
            <video
              width="100%"
              height="400"
              controls
              aria-label="Campus Connect Demo Video"
              poster={fallbackImage}
            >
              <source src={demoVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        </Container>

        <Container maxWidth="lg" className="featured-services">
          <Typography
            variant="h4"
            className="section-title"
            aria-label="Our Services"
          >
            Our Services
          </Typography>
          <Grid container spacing={4}>
            <ServiceCard
              iconClass="calculator-icon"
              title="SGPA & CGPA Calculation"
              description="Track and calculate your academic performance with ease."
            />
            <ServiceCard
              iconClass="document-icon"
              title="Document Sharing"
              description="Share important study materials and projects securely."
            />
            <ServiceCard
              iconClass="job-icon"
              title="Job Opportunities"
              description="Explore relevant internships and job opportunities in your field."
            />
          </Grid>
        </Container>

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
              <Counter end={5000} duration={3} icon="📘" />
              <Typography className="counter-text">SGPA Calculated</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Counter end={1200} duration={3} icon="📝" />
              <Typography className="counter-text">Documents Shared</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Counter end={300} duration={3} icon="💼" />
              <Typography className="counter-text">Job Opportunities Found</Typography>
            </Grid>
          </Grid>
        </Container>

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