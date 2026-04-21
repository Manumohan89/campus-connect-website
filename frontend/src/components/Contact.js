import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, Card, Grid, Stack, Snackbar } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupportIcon from '@mui/icons-material/Support';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/users/contact', form);
      setSnack('Message sent! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setError('Failed to send. Please email us directly at support@campusconnect.in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <PublicHeader />

      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', py: { xs: 7, md: 10 }, px: 2, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', fontFamily: "'Space Grotesk', sans-serif" }}>Get in Touch</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 1, fontSize: '1.05rem' }}>Have a question or feedback? We'd love to hear from you.</Typography>
        </Container>
      </Box>

      <Container sx={{ py: 7, px: 2 }} maxWidth="md">
        <Grid container spacing={4}>
          {/* Info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {[
                { icon: <EmailIcon />, title: 'Email', body: 'support@campusconnect.in', sub: 'We reply within 24 hours' },
                { icon: <LocationOnIcon />, title: 'Location', body: 'Bengaluru, Karnataka', sub: 'Serving all VTU colleges' },
                { icon: <SupportIcon />, title: 'Support', body: 'Mon–Sat, 9am–6pm', sub: 'IST timezone' },
              ].map((info, i) => (
                <Card key={i} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '14px', p: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {React.cloneElement(info.icon, { sx: { color: '#4F46E5', fontSize: 20 } })}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-1,#111827)' }}>{info.title}</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#4F46E5', fontSize: '0.85rem' }}>{info.body}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{info.sub}</Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Grid>

          {/* Form */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: { xs: 3, md: 4 } }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-1,#111827)', mb: 0.5, fontFamily: "'Space Grotesk', sans-serif" }}>Send a Message</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#9CA3AF', mb: 3 }}>Tell us about your issue or suggestion</Typography>

              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Your Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                  </Grid>
                  <TextField fullWidth label="Message *" multiline rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required
                    placeholder="Describe your issue or feedback in detail..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                  <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth
                    sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', textTransform: 'none', fontWeight: 700, borderRadius: '12px', py: 1.5, boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Stack>
              </form>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <PublicFooter />
    </Box>
  );
}
