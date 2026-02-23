import React, { useState, useEffect } from 'react';
import { Button, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './NewsletterPopup.css';

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Automatically trigger the popup after a delay (e.g., 5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 5000); // Show popup after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
    }
  };

  if (!open) return null;

  return (
    <div className="newsletter-popup">
      <div className="popup-header">
        <h4>Subscribe to our Newsletter</h4>
        <IconButton className="close-button" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className="popup-content">
        {subscribed ? (
          <p>Thank you for subscribing!</p>
        ) : (
          <>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleSubscribe} variant="contained" color="primary">
              Subscribe
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterPopup;
