import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Card, Typography,
  Alert, Stack, CircularProgress, Snackbar
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';     // ← use the centralized axios instance with /api base
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [notVerified, setNotVerified] = useState(null); // username for resend
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // POST /api/users/login  (baseURL '/api' is set in api.js)
      const response = await api.post('/users/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role || 'user');
      setSnackOpen(true);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'EMAIL_NOT_VERIFIED') {
        setNotVerified(username);
        setError('');
      } else {
        setError(errData?.error || errData?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />

      <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, py: 4 }}>
        <Card sx={{ width: '100%', maxWidth: '450px', p: { xs: 3, md: 4 }, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', borderRadius: 3 }}>

          {/* Icon + heading */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', mb: 2 }}>
              <LockOutlined sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              Sign in to your Campus Connect account
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            {notVerified && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}
                action={
                  <Button size="small" onClick={async () => {
                    try {
                      const r = await api.post('/users/resend-otp', { username: notVerified });
                      setError('');
                      setNotVerified(null);
                      navigate('/verify-otp', { state: { username: notVerified, devMode: r.data.devMode } });
                    } catch (e) { setError(e.response?.data?.error || 'Failed to resend OTP'); }
                  }} sx={{ fontWeight: 700, textTransform: 'none' }}>
                    Verify Now
                  </Button>
                }>
                Email not verified. Please verify your account.
              </Alert>
            )}

            <Stack spacing={2.5}>
              <TextField
                fullWidth label="Username" type="text"
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username" disabled={loading} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth label="Password" type="password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" disabled={loading} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                fullWidth type="submit" variant="contained" size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  fontWeight: 700, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(79,70,229,0.4)' },
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              <Link to="/forgot-password" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        message="Login successful! Redirecting..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <PublicFooter />
    </Box>
  );
}

export default Login;
