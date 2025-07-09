import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import '../styles/PublicSGPA.css';
import API from '../api';
import { Link } from 'react-router-dom';

const PublicSGPA = () => {
  const [file, setFile] = useState(null);
  const [sgpa, setSgpa] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Focus file input on mount for accessibility
  useEffect(() => {
    fileInputRef.current.focus();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setSgpa(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('marksCard', file);

    try {
      setLoading(true);
      const response = await API.post('/api/users/public-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { sgpa } = response.data;
      setSgpa(sgpa);
      setMessage('SGPA calculated successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage(
        error.response?.data?.error || 'Failed to calculate SGPA. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <Container maxWidth="sm" className="public-sgpa-page">
        <Box className="upload-box">
          <Typography
            variant="h4"
            className="page-title"
            aria-label="SGPA Calculator"
            tabIndex={0}
          >
            Try SGPA Calculator (No Login)
          </Typography>
          <Box className="input-group">
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input"
              ref={fileInputRef}
              aria-label="Upload marks card file"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading}
            className="upload-btn"
            aria-label={loading ? "Calculating SGPA" : "Calculate SGPA"}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate SGPA'}
          </Button>
          {message && (
            <Typography
              className={`message ${message.includes('successfully') ? 'success' : 'error'}`}
              aria-live="polite"
            >
              {message}
            </Typography>
          )}
          {sgpa && (
            <Box className="result-box">
              <Typography variant="h6" className="result-title">
                Your SGPA: <strong>{sgpa}</strong>
              </Typography>
              <Typography variant="body1" className="result-text" sx={{ marginTop: '8px' }}>
                Want to save this result and track your progress?
              </Typography>
              <Box className="result-actions" mt={2}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/login"
                  className="action-btn secondary"
                  aria-label="Login to save results"
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  className="action-btn primary"
                  aria-label="Register to save results"
                >
                  Register
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
      <PublicFooter />
    </>
  );
};

export default PublicSGPA;