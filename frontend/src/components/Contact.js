import React from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import '../styles/Contact.css';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import ContactIcon from '../components/images/campusconnect.jpg'; // Replace with your icon path

const Contact = () => {
  return (
    <>
      <PublicHeader />
      <Container className="contact-page">
        <Typography variant="h4" className="page-title">
          Contact Us
        </Typography>
        <div className="contact-form-container">
          {/* Animated Icon */}
          <img src={ContactIcon} alt="Contact" className="contact-icon" />

          {/* Contact Form */}
          <form className="contact-form">
            <TextField label="Name" fullWidth margin="normal" />
            <TextField label="Email" fullWidth margin="normal" />
            <TextField label="Message" multiline rows={4} fullWidth margin="normal" />
            <Button variant="contained" color="primary">Send Message</Button>
          </form>
        </div>
      </Container>
      <PublicFooter />
    </>
  );
};

export default Contact;
