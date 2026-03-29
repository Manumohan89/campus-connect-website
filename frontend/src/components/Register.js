import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, TextField, Button, Card, Typography,
  Alert, Stack, Grid, CircularProgress, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import { PersonAddOutlined, CheckCircle, Cancel } from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';     // ← centralized axios instance with /api base
import './Register.css';

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const PW_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const PW_COLOR = ['', '#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#059669'];

const BRANCHES = ['CSE','ISE','ECE','ME','CV','EEE','AIML','DS','CH','BT'];
const SEMESTERS = ['1','2','3','4','5','6','7','8'];
const SCHEMES = ['2021','2022','2023','2018','2015'];

function Register() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    fullName: '', semester: '', college: '', mobile: '', branch: '', yearScheme: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // POST /api/users/register  (baseURL '/api' is set in api.js)
      const { confirmPassword, ...payload } = formData;
      const res = await api.post('/users/register', payload);
      // Pass devMode hint so VerifyOTP can show "use 000000" if email isn't configured
      navigate('/verify-otp', {
        state: {
          username: formData.username,
          devMode: res.data.devMode,
          devOtpHint: res.data.devOtpHint,
        }
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const set = (field, value) => setFormData(f => ({ ...f, [field]: value }));

  return (
    <Box className="register-page" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />

      <Container sx={{ flex: 1, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: '620px', p: { xs: 3, md: 4 }, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', borderRadius: 3 }}>

          {/* Icon + heading */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', mb: 2 }}>
              <PersonAddOutlined sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', fontFamily: "'Space Grotesk', sans-serif" }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              Join Campus Connect — your VTU academic hub
            </Typography>
          </Box>

          <form onSubmit={handleRegister}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Stack spacing={2}>
              {/* Row 1 — username + email */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Username *" name="username" value={formData.username}
                    onChange={e => set('username', e.target.value)} placeholder="Choose a username"
                    disabled={loading} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email *" name="email" type="email" value={formData.email}
                    onChange={e => set('email', e.target.value)} placeholder="you@email.com"
                    disabled={loading} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
              </Grid>

              {/* Row 2 — fullName + mobile */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name *" name="fullName" value={formData.fullName}
                    onChange={e => set('fullName', e.target.value)} placeholder="Your full name"
                    disabled={loading} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Mobile" name="mobile" value={formData.mobile}
                    onChange={e => set('mobile', e.target.value)} placeholder="10-digit number"
                    inputProps={{ maxLength: 10 }}
                    disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
              </Grid>

              {/* Row 3 — password + confirm */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Password *" name="password" type="password" value={formData.password}
                    onChange={e => set('password', e.target.value)} placeholder="Min 8 characters (use A-Z, 0-9)"
                    disabled={loading} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  {formData.password && (
                    <Box sx={{ mt: 0.75 }}>
                      <LinearProgress variant="determinate" value={(pwStrength(formData.password)/5)*100}
                        sx={{ height: 5, borderRadius: 99, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: PW_COLOR[pwStrength(formData.password)] } }} />
                      <Typography variant="caption" sx={{ color: PW_COLOR[pwStrength(formData.password)], fontWeight: 700 }}>
                        {PW_LABEL[pwStrength(formData.password)]}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Confirm Password *" name="confirmPassword" type="password" value={formData.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)} placeholder="Re-enter password"
                    disabled={loading} required
                    error={!!formData.confirmPassword && formData.password !== formData.confirmPassword}
                    helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
              </Grid>

              {/* Row 4 — college (full width) */}
              <TextField fullWidth label="College" name="college" value={formData.college}
                onChange={e => set('college', e.target.value)} placeholder="Your college name"
                disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

              {/* Row 5 — branch + semester + scheme */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="medium">
                    <InputLabel>Branch</InputLabel>
                    <Select value={formData.branch} onChange={e => set('branch', e.target.value)} label="Branch"
                      sx={{ borderRadius: 2 }}>
                      <MenuItem value=""><em>Select</em></MenuItem>
                      {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Semester</InputLabel>
                    <Select value={formData.semester} onChange={e => set('semester', e.target.value)} label="Semester"
                      sx={{ borderRadius: 2 }}>
                      <MenuItem value=""><em>Select</em></MenuItem>
                      {SEMESTERS.map(s => <MenuItem key={s} value={s}>Semester {s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Scheme Year</InputLabel>
                    <Select value={formData.yearScheme} onChange={e => set('yearScheme', e.target.value)} label="Scheme Year"
                      sx={{ borderRadius: 2 }}>
                      <MenuItem value=""><em>Select</em></MenuItem>
                      {SCHEMES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                fullWidth type="submit" variant="contained" size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  fontWeight: 700, py: 1.5, mt: 1, borderRadius: 2, textTransform: 'none', fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(79,70,229,0.4)' },
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>

      <PublicFooter />
    </Box>
  );
}

export default Register;
