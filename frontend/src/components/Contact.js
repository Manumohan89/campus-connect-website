import React from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import './Contact.css';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const Contact = () => {
  return (
    <>
    <PublicHeader />
    <Container className="contact-page">
      <Typography variant="h4" className="page-title">
        Contact Us
      </Typography>
      <form className="contact-form">
        <TextField label="Name" fullWidth margin="normal" />
        <TextField label="Email" fullWidth margin="normal" />
        <TextField label="Message" multiline rows={4} fullWidth margin="normal" />
        <Button variant="contained" color="primary">Send Message</Button>
      </form>
    </Container>
    <PublicFooter />
    </>
  );
};

export default Contact;
