import React, { useState, useEffect } from 'react';
import {
  Container, Box, Card, TextField, Button, CircularProgress,
  Alert, Typography, Grid, FormControl, InputLabel, Select,
  MenuItem, Snackbar
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const BRANCHES = ['CSE','ISE','ECE','ME','CV','EEE','AIML','DS','CH','BT'];
const SEMESTERS = ['1','2','3','4','5','6','7','8'];
const SCHEMES = ['2021','2022','2023','2018','2015'];

export default function UpdateProfile() {
  const [form, setForm] = useState({ full_name: '', semester: '', college: '', mobile: '', branch: '', year_scheme: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/profile')
      .then(r => setForm({
        full_name: r.data.full_name || '',
        semester: r.data.semester || '',
        college: r.data.college || '',
        mobile: r.data.mobile || '',
        branch: r.data.branch || '',
        year_scheme: r.data.year_scheme || '',
      }))
      .catch(() => setError('Failed to load profile. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.put('/users/profile', form);
      setSnack('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#4F46E5' }} /></Box>
      <Footer />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />

      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', py: 5, px: 2 }}>
        <Container>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/profile')} sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', mb: 1.5, '&:hover': { color: 'white' } }}>
            Back to Profile
          </Button>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900, color: 'white' }}>Update Profile</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>Keep your information up to date</Typography>
        </Container>
      </Box>

      <Container sx={{ py: 4 }} maxWidth="sm">
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: { xs: 3, md: 4 } }}>
          <form onSubmit={handleSave}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  placeholder="Your full name" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="College" value={form.college} onChange={e => set('college', e.target.value)}
                  placeholder="Your college name" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Mobile Number" value={form.mobile} onChange={e => set('mobile', e.target.value)}
                  placeholder="10-digit mobile number" inputProps={{ maxLength: 10 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Branch</InputLabel>
                  <Select value={form.branch} onChange={e => set('branch', e.target.value)} label="Branch" sx={{ borderRadius: '12px' }}>
                    <MenuItem value="">Select</MenuItem>
                    {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select value={form.semester} onChange={e => set('semester', e.target.value)} label="Semester" sx={{ borderRadius: '12px' }}>
                    <MenuItem value="">Select</MenuItem>
                    {SEMESTERS.map(s => <MenuItem key={s} value={s}>Sem {s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Year Scheme</InputLabel>
                  <Select value={form.year_scheme} onChange={e => set('year_scheme', e.target.value)} label="Year Scheme" sx={{ borderRadius: '12px' }}>
                    <MenuItem value="">Select</MenuItem>
                    {SCHEMES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth type="submit" variant="contained" size="large" disabled={saving} startIcon={saving ? null : <Save />}
                  sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', textTransform: 'none', fontWeight: 700, borderRadius: '12px', py: 1.5, boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
                  {saving ? <><CircularProgress size={20} sx={{ color: 'white', mr: 1 }} /> Saving...</> : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
