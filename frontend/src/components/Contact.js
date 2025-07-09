import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import '../styles/Contact.css';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import ContactIcon from '../components/images/campusconnect.jpg'; // Replace with your icon path

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const nameRef = useRef(null);

  // Focus on name input when component mounts
  useEffect(() => {
    nameRef.current.focus();
  }, []);

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'name':
        if (value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters long';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'message':
        if (value.length < 10) {
          newErrors.message = 'Message must be at least 10 characters long';
        } else {
          delete newErrors.message;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError(null);

    // Validate all fields before submission
    Object.keys(formData).forEach((key) => validateField(key, formData[key]));

    // Prevent submission if there are errors
    if (Object.keys(errors).length > 0) {
      setGeneralError('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);

    // Simulate API call (replace with actual API call when implemented)
    setTimeout(() => {
      alert('Message sent successfully!'); // Placeholder for API response
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
      setIsLoading(false);
    }, 1000);
  };

  // Handle form reset
  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setErrors({});
    setGeneralError(null);
  };

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
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <TextField
                label="Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputRef={nameRef}
                error={!!errors.name}
                helperText={errors.name}
                aria-required="true"
                required
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="form-group">
              <TextField
                label="Email *"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email}
                aria-required="true"
                required
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="form-group">
              <TextField
                label="Message *"
                name="message"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                margin="normal"
                error={!!errors.message}
                helperText={errors.message}
                aria-required="true"
                required
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="form-actions">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading || Object.keys(errors).length > 0}
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </Button>
              <Button
                variant="contained"
                className="btn-secondary"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
            {generalError && <p className="error error-general">{generalError}</p>}
          </form>
        </div>
      </Container>
      <PublicFooter />
    </>
  );
};

export default Contact;