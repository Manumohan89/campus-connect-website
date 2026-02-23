import React from 'react';
import { Container, Typography } from '@mui/material';
import './About.css';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const About = () => {
  return (
    <>
    <PublicHeader />
    <Container className="about-page">
      <Typography variant="h4" className="page-title">
        About Us
      </Typography>
      <Typography variant="body1">
        Campus Connect is a platform dedicated to helping students and institutions connect in meaningful ways, offering services like CGPA/SGPA calculation, document sharing, and more. We aim to make student life easier and help institutions offer more efficient digital services.
      </Typography>
    </Container>
    <PublicFooter />
    </>
  );
};

export default About;
