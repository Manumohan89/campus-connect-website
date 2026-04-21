import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Container, Card, Typography, TextField, Button, Alert, CircularProgress, LinearProgress } from '@mui/material';
import { LockReset, CheckCircle, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';

function strength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABEL = ['','Weak','Fair','Good','Strong','Very Strong'];
const STRENGTH_COLOR = ['','#EF4444','#F59E0B','#F59E0B','#10B981','#059669'];

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const pw_strength = strength(password);
  const mismatch = confirm && password !== confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/users/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <PublicHeader />
      <Container sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', py:4 }}>
        <Alert severity="error" sx={{ borderRadius:'12px', maxWidth:400 }}>Invalid reset link. Please request a new one from the Forgot Password page.</Alert>
      </Container>
      <PublicFooter />
    </Box>
  );

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <PublicHeader />
      <Container sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', py:4 }} maxWidth="sm">
        <Card elevation={0} sx={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'20px', p:{xs:3,md:4} }}>
          {!done ? (
            <>
              <Box sx={{ textAlign:'center', mb:3 }}>
                <Box sx={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'inline-flex', alignItems:'center', justifyContent:'center', mb:2 }}>
                  <LockReset sx={{ color:'white', fontSize:28 }} />
                </Box>
                <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Set New Password</Typography>
                <Typography color="text.secondary" mt={0.5} fontSize="0.9rem">Choose a strong password for your account</Typography>
              </Box>
              {error && <Alert severity="error" sx={{ mb:2, borderRadius:'10px' }}>{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <TextField fullWidth label="New Password" type={show ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required disabled={loading}
                  InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow(s => !s)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                  sx={{ mb:1, '& .MuiOutlinedInput-root': { borderRadius:'12px' } }} />
                {password && (
                  <Box sx={{ mb:2 }}>
                    <LinearProgress variant="determinate" value={(pw_strength/5)*100}
                      sx={{ borderRadius:99, height:6, bgcolor:'#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: STRENGTH_COLOR[pw_strength] } }} />
                    <Typography variant="caption" sx={{ color: STRENGTH_COLOR[pw_strength], fontWeight:700 }}>{STRENGTH_LABEL[pw_strength]}</Typography>
                  </Box>
                )}
                <TextField fullWidth label="Confirm Password" type="password" value={confirm}
                  onChange={e => setConfirm(e.target.value)} required disabled={loading}
                  error={mismatch} helperText={mismatch ? "Passwords don't match" : ''}
                  sx={{ mb:2.5, '& .MuiOutlinedInput-root': { borderRadius:'12px' } }} />
                <Box sx={{ mb:2.5, p:2, bgcolor:'#EEF2FF', borderRadius:'10px' }}>
                  {[['At least 6 characters', password.length >= 6],['Uppercase letter', /[A-Z]/.test(password)],['Number', /[0-9]/.test(password)]].map(([label, ok]) => (
                    <Typography key={label} variant="caption" sx={{ display:'block', color: ok ? '#10B981' : '#9CA3AF', fontWeight: ok ? 700 : 400 }}>
                      {ok ? '✓' : '○'} {label}
                    </Typography>
                  ))}
                </Box>
                <Button fullWidth type="submit" variant="contained" size="large" disabled={loading || mismatch}
                  sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', fontWeight:700, py:1.5, borderRadius:'12px', textTransform:'none', boxShadow:'none' }}>
                  {loading ? <CircularProgress size={22} sx={{ color:'white' }} /> : 'Reset Password'}
                </Button>
              </form>
            </>
          ) : (
            <Box sx={{ textAlign:'center', py:2 }}>
              <CheckCircle sx={{ fontSize:64, color:'#10B981', mb:2 }} />
              <Typography variant="h5" fontWeight={800} mb={1}>Password Reset!</Typography>
              <Typography color="text.secondary" mb={2}>Your password has been reset successfully. Redirecting to login...</Typography>
              <LinearProgress sx={{ borderRadius:99 }} />
            </Box>
          )}
        </Card>
      </Container>
      <PublicFooter />
    </Box>
  );
}
