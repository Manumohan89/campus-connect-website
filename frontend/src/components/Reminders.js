import React, { useState, useEffect } from 'react';
import {
  Container, Box, Card, TextField, Button, Stack, Typography,
  Alert, Chip, IconButton, Snackbar, Grid, Paper, Divider
} from '@mui/material';
import { Notifications, Add, Delete, AccessTime, CheckCircle } from '@mui/icons-material';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

export default function Reminders() {
  const [form, setForm] = useState({ time: '', message: '' });
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');

  const load = () => {
    api.get('/users/reminders')
      .then(r => setReminders(r.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.time || !form.message.trim()) { setError('Both time and message are required.'); return; }
    setError(null);
    setLoading(true);
    try {
      await api.post('/users/reminders', form);
      setSnack('Reminder set!');
      setForm({ time: '', message: '' });
      load();
    } catch {
      setError('Failed to set reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group reminders by done status
  const pending = reminders.filter(r => !r.is_done);
  const done = reminders.filter(r => r.is_done);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #7C3AED 100%)', py: 5, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
            <Notifications sx={{ color: '#C4B5FD', fontSize: 20 }} />
            <Typography sx={{ color: '#C4B5FD', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Productivity</Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900, color: 'white' }}>Reminders</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>Set reminders for exam dates, assignment deadlines, and more</Typography>
        </Container>
      </Box>

      <Container sx={{ py: 4 }} maxWidth="md">
        <Grid container spacing={3}>
          {/* Form */}
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: 3, position: { md: 'sticky' }, top: { md: 80 } }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#111827', mb: 0.5 }}>Add New Reminder</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', mb: 3 }}>Set a time and message for your reminder</Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  {error && <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>}

                  <TextField fullWidth label="Time" type="time" value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    InputLabelProps={{ shrink: true }} disabled={loading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />

                  <TextField fullWidth label="Reminder Message" multiline rows={3}
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="e.g. Submit DBMS assignment by 5 PM" disabled={loading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />

                  <Button fullWidth type="submit" variant="contained" disabled={loading} startIcon={<Add />}
                    sx={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', textTransform: 'none', fontWeight: 700, borderRadius: '12px', py: 1.5, boxShadow: 'none' }}>
                    {loading ? 'Setting...' : 'Set Reminder'}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 3 }} />
              <Typography sx={{ fontWeight: 700, color: '#374151', mb: 1.5, fontSize: '0.85rem' }}>💡 Tips</Typography>
              {['Set reminders 24h before deadlines', 'Add exam dates to Exam Timetable for countdown timers', 'Use specific messages — e.g. "Submit Lab Record for 21CS38"'].map((tip, i) => (
                <Typography key={i} variant="caption" sx={{ display: 'block', color: '#9CA3AF', mb: 0.75 }}>• {tip}</Typography>
              ))}
            </Card>
          </Grid>

          {/* Reminders List */}
          <Grid item xs={12} md={7}>
            {fetching ? (
              <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
                <Typography>Loading reminders...</Typography>
              </Box>
            ) : reminders.length === 0 ? (
              <Paper elevation={0} sx={{ border: '2px dashed #E5E7EB', borderRadius: '20px', p: 8, textAlign: 'center', bgcolor: 'white' }}>
                <Notifications sx={{ fontSize: 52, color: '#E5E7EB', mb: 2 }} />
                <Typography sx={{ fontWeight: 700, color: '#374151', mb: 1 }}>No reminders yet</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Add your first reminder using the form on the left</Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {pending.length > 0 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Upcoming ({pending.length})</Typography>
                    </Box>
                    {pending.map((r, i) => (
                      <Card key={i} elevation={0} sx={{ border: '1.5px solid #DDD6FE', borderRadius: '14px', p: 2.5, bgcolor: '#FAFAFF' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <AccessTime sx={{ color: '#7C3AED', fontSize: 20 }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', mb: 0.25 }}>{r.message}</Typography>
                              <Chip label={r.time_str} size="small" sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: '0.7rem' }} />
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', ml: 1, flexShrink: 0 }}>
                            {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : ''}
                          </Typography>
                        </Box>
                      </Card>
                    ))}
                  </>
                )}
                {done.length > 0 && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />
                      <Typography sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.875rem' }}>Completed ({done.length})</Typography>
                    </Box>
                    {done.map((r, i) => (
                      <Card key={i} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '14px', p: 2, bgcolor: '#F9FAFB', opacity: 0.6 }}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', textDecoration: 'line-through' }}>{r.message}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{r.time_str}</Typography>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
