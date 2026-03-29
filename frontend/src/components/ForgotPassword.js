import React, { useState } from 'react';
import { Box, Container, Card, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { EmailOutlined, ArrowBack, CheckCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/users/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <PublicHeader />
      <Container sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', py:4 }} maxWidth="sm">
        <Card elevation={0} sx={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'20px', p:{xs:3,md:4} }}>
          {!sent ? (
            <>
              <Box sx={{ textAlign:'center', mb:3 }}>
                <Box sx={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'inline-flex', alignItems:'center', justifyContent:'center', mb:2 }}>
                  <EmailOutlined sx={{ color:'white', fontSize:28 }} />
                </Box>
                <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Forgot Password?</Typography>
                <Typography color="text.secondary" mt={0.5} fontSize="0.9rem">Enter your email and we'll send you a reset link</Typography>
              </Box>
              {error && <Alert severity="error" sx={{ mb:2, borderRadius:'10px' }}>{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <TextField fullWidth label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
                  sx={{ mb:2.5, '& .MuiOutlinedInput-root': { borderRadius:'12px' } }} />
                <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
                  sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', fontWeight:700, py:1.5, borderRadius:'12px', textTransform:'none', boxShadow:'none' }}>
                  {loading ? <CircularProgress size={22} sx={{ color:'white' }} /> : 'Send Reset Link'}
                </Button>
              </form>
              <Box sx={{ mt:3, textAlign:'center' }}>
                <Link to="/login" style={{ color:'#4F46E5', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                  <ArrowBack sx={{ fontSize:16 }} /> Back to Login
                </Link>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign:'center', py:2 }}>
              <CheckCircle sx={{ fontSize:64, color:'#10B981', mb:2 }} />
              <Typography variant="h5" fontWeight={800} mb={1}>Check your email</Typography>
              <Typography color="text.secondary" mb={3}>
                We've sent a password reset link to <strong>{email}</strong>. Check your inbox (and spam folder).
              </Typography>
              <Alert severity="info" sx={{ mb:3, borderRadius:'10px', textAlign:'left' }}>
                The link expires in <strong>1 hour</strong>. If you don't get the email, check your spam or try again.
              </Alert>
              <Button fullWidth variant="outlined" onClick={() => setSent(false)} sx={{ borderRadius:'12px', textTransform:'none', fontWeight:600 }}>
                Try a different email
              </Button>
              <Box mt={2}><Link to="/login" style={{ color:'#4F46E5', fontWeight:700, textDecoration:'none' }}>Back to Login</Link></Box>
            </Box>
          )}
        </Card>
      </Container>
      <PublicFooter />
    </Box>
  );
}
