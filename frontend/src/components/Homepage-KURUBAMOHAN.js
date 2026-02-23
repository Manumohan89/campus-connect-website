// src/pages/Home.js
import React, { useEffect } from 'react';
import { Container, Box, Typography, Button, Grid, Paper, Zoom } from '@mui/material';
import { Link } from 'react-router-dom';
import TestimonialsGrid from '../components/TestimonialsGrid';
import Counter from '../components/Counter';
import NewsletterPopup from '../components/NewsletterPopup';
import LiveChat from '../components/LiveChat';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter'; 
import FAQ from './FAQ';
import './Home.css';

const Home = () => {
    
    // Custom cursor effect
    useEffect(() => {
        const cursor = document.querySelector('.custom-cursor');
        const onMouseMove = (e) => {
            cursor.style.left = `${e.pageX}px`;
            cursor.style.top = `${e.pageY}px`;  
        };
        document.addEventListener('mousemove', onMouseMove);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <>
            <PublicHeader />
            <div className="home-page">
                <div className="custom-cursor"></div>

                {/* Hero Section */}
                <Box className="hero-section">
                    <div className="hero-overlay"></div>
                    <div className="hero-text">
                        <Typography variant="h2" className="hero-title" gutterBottom>
                            Campus Connect: Your Academic Companion
                        </Typography>
                        <Typography variant="h5" className="hero-subtitle" gutterBottom>
                            SGPA Calculation | Document Sharing | Job Opportunities
                        </Typography>
                        <Zoom in={true} timeout={1000}>
                            <Button variant="contained" className="hero-btn primary-btn" component={Link} to="/register">
                                Get Started
                            </Button>
                        </Zoom>
                    </div>
                </Box>

                {/* Our Services */}
                <Container maxWidth="lg" className="featured-services">
                    <Typography variant="h4" gutterBottom className="section-title">
                        Our Services
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={3} className="service-card">
                                <div className="service-icon">
                                    <i className="fas fa-calculator"></i>
                                </div>
                                <Typography variant="h5">SGPA & CGPA Calculation</Typography>
                                <Typography>Track and calculate your academic performance with ease.</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={3} className="service-card">
                                <div className="service-icon">
                                    <i className="fas fa-folder-open"></i>
                                </div>
                                <Typography variant="h5">Document Sharing</Typography>
                                <Typography>Share important study materials and projects securely.</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={3} className="service-card">
                                <div className="service-icon">
                                    <i className="fas fa-briefcase"></i>
                                </div>
                                <Typography variant="h5">Job Opportunities</Typography>
                                <Typography>Explore relevant internships and job opportunities in your field.</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>

                {/* Stats Section */}
                <Container className="stats-section">
                    <Typography variant="h4" className="section-title">Our Impact</Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={4}>
                            <Counter end="5000" duration="3" icon="📘" />
                            <Typography>SGPA Calculated</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Counter end="1200" duration="3" icon="📝" />
                            <Typography>Documents Shared</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Counter end="300" duration="3" icon="💼" />
                            <Typography>Job Opportunities Found</Typography>
                        </Grid>
                    </Grid>
                </Container>

                {/* Testimonials Section */}
                <TestimonialsGrid />

                {/* FAQ Section */}
                <FAQ />

                {/* Live Chat and Newsletter */}
                <LiveChat />
                <NewsletterPopup />
            </div>
            <PublicFooter />
        </>
    );
};

export default Home;
