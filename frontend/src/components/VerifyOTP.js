import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Card, Typography,
  Alert, Stack, CircularProgress, Snackbar, Chip
} from '@mui/material';
import { VerifiedOutlined, MailOutline, BugReport } from '@mui/icons-material';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';

function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // State passed from Register.js
  const username = location.state?.username || '';
  const devMode = location.state?.devMode || false;
  const devOtpHint = location.state?.devOtpHint || '';

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) { setError('OTP must be exactly 6 digits.'); return; }
    setLoading(true);
    try {
      const response = await api.post('/users/verify-otp', { username, otp });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role || 'user');
        setSnackOpen(true);
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        // No token — account exists but login separately
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please check the OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fill dev OTP with one click
  const fillDevOtp = () => setOtp('000000');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <PublicHeader />

      <Container sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Card sx={{
          width: '100%', maxWidth: '440px',
          p: { xs: 3, md: 4 },
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
        }}>

          {/* Icon */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 68, height: 68, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              mb: 2, boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            }}>
              <VerifiedOutlined sx={{ color: 'white', fontSize: 36 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', fontFamily: "'Space Grotesk', sans-serif" }}>
              Verify Your Email
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.75, lineHeight: 1.6 }}>
              {devMode
                ? 'Email is not configured. Use the dev OTP below.'
                : 'Enter the 6-digit OTP sent to your registered email'}
            </Typography>
            {username && (
              <Chip
                label={`Account: ${username}`}
                size="small"
                sx={{ mt: 1.5, bgcolor: '#EEF2FF', color: '#4338CA', fontWeight: 700 }}
              />
            )}
          </Box>

          {/* Dev mode banner */}
          {devMode && (
            <Alert
              severity="warning"
              icon={<BugReport />}
              sx={{ mb: 2.5, borderRadius: '12px', border: '1px solid #FDE68A' }}
              action={
                <Button size="small" onClick={fillDevOtp} sx={{ fontWeight: 700, color: '#92400E', textTransform: 'none', whiteSpace: 'nowrap' }}>
                  Fill 000000
                </Button>
              }
            >
              <Typography variant="body2" fontWeight={600}>Dev Mode</Typography>
              <Typography variant="caption" display="block">
                {devOtpHint || 'Use 000000 as OTP. Configure EMAIL_USER in .env for real OTPs.'}
              </Typography>
            </Alert>
          )}

          {/* Email sent confirmation (production) */}
          {!devMode && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 2, bgcolor: '#EEF2FF', borderRadius: '12px', mb: 2.5 }}>
              <MailOutline sx={{ color: '#4F46E5', fontSize: 20, flexShrink: 0 }} />
              <Typography variant="body2" color="#3730A3" fontWeight={600}>
                OTP sent to your email. Check spam if not found.
              </Typography>
            </Box>
          )}

          {/* Form */}
          <form onSubmit={handleVerify}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="6-Digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="0  0  0  0  0  0"
                inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                disabled={loading}
                required
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                  '& input': {
                    letterSpacing: '0.5em',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700,
                    py: 1.5,
                  }
                }}
              />

              {/* OTP progress dots */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75 }}>
                {[0,1,2,3,4,5].map(i => (
                  <Box key={i} sx={{
                    width: 10, height: 10, borderRadius: '50%',
                    bgcolor: i < otp.length ? '#4F46E5' : '#E5E7EB',
                    transition: 'background-color 0.15s',
                  }} />
                ))}
              </Box>

              <Button
                fullWidth type="submit" variant="contained" size="large"
                disabled={loading || otp.length !== 6}
                sx={{
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  fontWeight: 700, py: 1.5, borderRadius: '12px', textTransform: 'none', fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(79,70,229,0.4)' },
                  '&:disabled': { background: '#E5E7EB', transform: 'none', boxShadow: 'none' },
                  transition: 'all 0.2s',
                }}
              >
                {loading
                  ? <><CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />Verifying...</>
                  : 'Verify OTP & Continue'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Didn't get the OTP?{' '}
              <Link to="/register" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>
                Register again
              </Link>
              {' · '}
              <Link to="/login" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>
                Back to login
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        message="✅ Email verified! Redirecting to dashboard..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <PublicFooter />
    </Box>
  );
}

export default VerifyOTP;
