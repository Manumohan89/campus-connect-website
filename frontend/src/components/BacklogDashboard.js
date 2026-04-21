import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, Button, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, LinearProgress, Paper
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function useCountdown(targetDate) {
  const [left, setLeft] = useState('');
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setLeft('Passed'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setUrgent(d < 7);
      setLeft(d > 0 ? `${d}d ${h}h` : `${h}h`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);
  return { left, urgent };
}

function CountdownBadge({ date, label }) {
  const { left, urgent } = useCountdown(date);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, borderRadius: '8px', bgcolor: urgent ? '#FEF2F2' : '#F5F3FF', border: `1px solid ${urgent ? '#FECACA' : '#DDD6FE'}` }}>
      <TimerIcon sx={{ fontSize: 13, color: urgent ? '#EF4444' : '#7C3AED' }} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: urgent ? '#DC2626' : '#6D28D9' }}>{label}: {left}</Typography>
    </Box>
  );
}

export default function BacklogDashboard() {
  const [marks, setMarks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [revals, setRevals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revalDialog, setRevalDialog] = useState(null);
  const [form, setForm] = useState({ usn: '', reason: '' });
  const [snack, setSnack] = useState('');
  const navigate = useNavigate();

  // VTU approximate dates
  const nextExam = new Date(); nextExam.setMonth(nextExam.getMonth() + 3);
  const revalDeadline = new Date(); revalDeadline.setDate(revalDeadline.getDate() + 28);

  useEffect(() => {
    Promise.all([
      api.get('/users/marks'),
      api.get('/training/courses', { params: { category: 'backlog_clearing' } }),
      api.get('/features/revaluation'),
    ]).then(([m, c, r]) => {
      setMarks(m.data || []);
      setCourses(c.data || []);
      setRevals(r.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failed = marks.filter(m => m.total < 40);
  const nearMiss = marks.filter(m => m.total >= 40 && m.total < 50);
  const daysToExam = Math.max(0, Math.floor((nextExam - new Date()) / 86400000));

  const submitReval = async () => {
    if (!form.usn || !form.reason) return;
    try {
      await api.post('/features/revaluation', {
        subject_code: revalDialog.subject_code,
        subject_name: revalDialog.subject_name,
        semester: revalDialog.semester,
        usn: form.usn, reason: form.reason,
      });
      setSnack('Revaluation request submitted!');
      setRevalDialog(null);
      const r = await api.get('/features/revaluation');
      setRevals(r.data);
    } catch { setSnack('Submission failed. Try again.'); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header /><Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#EF4444' }} /></Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFF7F7' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #450A0A 0%, #991B1B 60%, #B45309 100%)', pt: 6, pb: 8, px: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(239,68,68,0.2) 0%, transparent 70%)' }} />
        <Container sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
            <WarningAmberIcon sx={{ color: '#FCA5A5', fontSize: 20 }} />
            <Typography sx={{ color: '#FCA5A5', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Backlog Management</Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
            Backlog Dashboard
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>Smart alerts, countdowns, and revaluation tools for VTU backlogs</Typography>

          <Grid container spacing={2} sx={{ mt: 4 }}>
            {[
              { v: failed.length, l: 'Active Backlogs', c: failed.length ? '#FCA5A5' : '#86EFAC' },
              { v: nearMiss.length, l: 'Near-Miss (40–49)', c: '#FDE68A' },
              { v: daysToExam, l: 'Days to Next Exam', c: '#67E8F9' },
              { v: revals.length, l: 'Revals Submitted', c: '#C4B5FD' },
            ].map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', borderRadius: '14px', p: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: s.c, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.v}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', mt: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: 5 }}>
        {failed.length === 0 ? (
          <Paper elevation={0} sx={{ border: '2px solid #BBF7D0', borderRadius: '20px', p: 6, textAlign: 'center', bgcolor: '#F0FDF4', mb: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 56, color: '#10B981', mb: 2 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#065F46' }}>No Backlogs! 🎉</Typography>
            <Typography sx={{ color: '#059669', mt: 1 }}>All your subjects are cleared. Keep maintaining this record!</Typography>
          </Paper>
        ) : (
          <>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-1,#111827)', mb: 2 }}>
              ⚠️ Failed Subjects — Take Action Now
            </Typography>
            <Grid container spacing={3} mb={4}>
              {failed.map((sub, i) => {
                const matchedCourse = courses.find(c => c.subject_code === sub.subject_code);
                return (
                  <Grid item xs={12} md={6} key={i}>
                    <Card elevation={0} sx={{ border: '1.5px solid #FECACA', borderRadius: '20px', overflow: 'hidden', bgcolor: 'white' }}>
                      {/* Card header */}
                      <Box sx={{ bgcolor: '#FEF2F2', px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #FECACA' }}>
                        <Box>
                          <Chip label={sub.subject_code} size="small" sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '0.75rem', mb: 0.75 }} />
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1,#111827)' }}>{sub.subject_name || sub.subject_code}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#EF4444', lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{sub.total}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>/ 100 marks</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        {/* Score breakdown */}
                        <Grid container spacing={2} mb={2.5}>
                          {[['Internal', sub.internal_marks, 30], ['External', sub.external_marks, 70]].map(([lbl, val, mx]) => (
                            <Grid item xs={6} key={lbl}>
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75 }}>{lbl}</Typography>
                              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#374151' }}>{val} <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 400 }}>/ {mx}</span></Typography>
                              <LinearProgress variant="determinate" value={Math.min((val / mx) * 100, 100)}
                                sx={{ mt: 0.75, height: 5, borderRadius: 99, bgcolor: '#FEE2E2', '& .MuiLinearProgress-bar': { bgcolor: val >= mx * 0.4 ? '#F59E0B' : '#EF4444' } }} />
                            </Grid>
                          ))}
                        </Grid>

                        {/* Countdowns */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                          <CountdownBadge date={nextExam} label="Next Exam" />
                          <CountdownBadge date={revalDeadline} label="Reval Deadline" />
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          {matchedCourse && (
                            <Button size="small" variant="contained" startIcon={<PlayCircleIcon />} onClick={() => navigate('/training')}
                              sx={{ textTransform: 'none', borderRadius: '10px', bgcolor: '#6366F1', fontWeight: 700, flex: 1, boxShadow: 'none', '&:hover': { bgcolor: '#4F46E5' } }}>
                              Study Now
                            </Button>
                          )}
                          <Button size="small" variant="outlined" startIcon={<AssignmentIcon />} onClick={() => { setRevalDialog(sub); setForm({ usn: '', reason: '' }); }}
                            sx={{ textTransform: 'none', borderRadius: '10px', borderColor: '#FECACA', color: '#DC2626', fontWeight: 700, flex: 1, '&:hover': { bgcolor: '#FEF2F2', borderColor: '#FCA5A5' } }}>
                            Request Reval
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}

        {/* Near-miss warning */}
        {nearMiss.length > 0 && (
          <Paper elevation={0} sx={{ border: '1.5px solid #FDE68A', borderRadius: '16px', p: 3, mb: 4, bgcolor: '#FFFBEB' }}>
            <Typography sx={{ fontWeight: 800, color: '#92400E', mb: 1.5, fontSize: '0.95rem' }}>⚡ Near-Miss Subjects (40–49 marks) — Don't let these slip!</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {nearMiss.map((s, i) => (
                <Chip key={i} label={`${s.subject_code}: ${s.total}/100`} sx={{ bgcolor: '#FEF9C3', color: '#92400E', fontWeight: 700, fontSize: '0.75rem' }} />
              ))}
            </Box>
          </Paper>
        )}

        {/* Revaluation History */}
        {revals.length > 0 && (
          <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', overflow: 'hidden', bgcolor: 'white' }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid #F3F4F6' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1,#111827)' }}>Revaluation Requests</Typography>
            </Box>
            {revals.map((r, i) => (
              <Box key={i} sx={{ px: 4, py: 2.5, borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: 'var(--text-1,#111827)', fontSize: '0.9rem' }}>{r.subject_code} — {r.subject_name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', mt: 0.25 }}>USN: {r.usn} • {new Date(r.submitted_at).toLocaleDateString('en-IN')}</Typography>
                </Box>
                <Chip label={r.status === 'submitted' ? '✓ Submitted' : r.status} size="small"
                  sx={{ bgcolor: r.status === 'submitted' ? '#D1FAE5' : '#F3F4F6', color: r.status === 'submitted' ? '#065F46' : '#374151', fontWeight: 700, fontSize: '0.7rem' }} />
              </Box>
            ))}
          </Paper>
        )}
      </Container>

      {/* Revaluation Dialog */}
      {revalDialog && (
        <Dialog open onClose={() => setRevalDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Request Revaluation — {revalDialog.subject_code}</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }}>
              Current score: <strong style={{ color: '#DC2626' }}>{revalDialog.total}/100</strong>. VTU revaluation costs ₹500–₹750 per subject. Deadline is ~30 days after results.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Your USN *" value={form.usn} onChange={e => setForm(f => ({ ...f, usn: e.target.value }))}
                  placeholder="e.g. 1VT21CS001" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Reason for Revaluation *" value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="I believe my answer scripts were not evaluated correctly because..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setRevalDialog(null)} sx={{ textTransform: 'none', borderRadius: '10px', color: '#6B7280' }}>Cancel</Button>
            <Button onClick={submitReval} disabled={!form.usn || !form.reason} variant="contained"
              sx={{ textTransform: 'none', borderRadius: '10px', bgcolor: '#EF4444', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
