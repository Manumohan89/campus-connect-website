import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, Button, TextField,
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Snackbar, Paper, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getDaysLeft(date) { return Math.ceil((new Date(date) - new Date()) / 86400000); }

function ExamCard({ exam, onDelete }) {
  const days = getDaysLeft(exam.exam_date);
  const isPast = days < 0;
  const isToday = days === 0;
  const isUrgent = days >= 0 && days <= 3;
  const isSoon = days >= 0 && days <= 7;

  const d = new Date(exam.exam_date);
  const dayNum = d.getDate();
  const month = MONTHS[d.getMonth()];
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();

  const accentColor = isPast ? '#9CA3AF' : isUrgent ? '#EF4444' : isSoon ? '#F59E0B' : '#6366F1';
  const cardBg = isPast ? '#F9FAFB' : isUrgent ? '#FFF5F5' : isSoon ? '#FFFBEB' : 'white';
  const borderColor = isPast ? '#E5E7EB' : isUrgent ? '#FECACA' : isSoon ? '#FDE68A' : '#E5E7EB';

  return (
    <Card elevation={0} sx={{ border: `1.5px solid ${borderColor}`, borderRadius: '18px', bgcolor: cardBg, overflow: 'hidden', transition: 'all 0.2s', opacity: isPast ? 0.65 : 1, '&:hover': { transform: isPast ? 'none' : 'translateY(-3px)', boxShadow: isPast ? 'none' : `0 8px 24px ${accentColor}15` } }}>
      {/* Left accent bar */}
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ width: 6, bgcolor: accentColor, flexShrink: 0 }} />
        <Box sx={{ flex: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Date calendar block */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ textAlign: 'center', bgcolor: accentColor, color: 'white', borderRadius: '12px', px: 2, py: 1.5, minWidth: 56, flexShrink: 0 }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.85, letterSpacing: '0.08em' }}>{weekday}</Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{dayNum}</Typography>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.85 }}>{month}</Typography>
              </Box>
              <Box>
                {exam.subject_code && <Chip label={exam.subject_code} size="small" sx={{ bgcolor: `${accentColor}15`, color: accentColor, fontWeight: 800, fontSize: '0.7rem', mb: 0.75 }} />}
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1,#111827)', lineHeight: 1.3 }}>{exam.subject_name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.75, flexWrap: 'wrap' }}>
                  {exam.exam_time && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{exam.exam_time}</Typography>
                    </Box>
                  )}
                  {exam.venue && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>📍 {exam.venue}</Typography>
                  )}
                  {exam.semester && <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Sem {exam.semester}</Typography>}
                </Box>
              </Box>
            </Box>

            {/* Right actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <IconButton size="small" onClick={() => onDelete(exam.id)} sx={{ color: '#D1D5DB', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
              {!isPast && (
                <Chip
                  label={isToday ? '🔥 TODAY' : days === 1 ? '⚡ Tomorrow' : `${days} days`}
                  size="small"
                  sx={{ bgcolor: isUrgent ? '#FEE2E2' : isSoon ? '#FEF9C3' : '#EEF2FF', color: isUrgent ? '#DC2626' : isSoon ? '#92400E' : '#4338CA', fontWeight: 800, fontSize: '0.7rem' }}
                />
              )}
              {!isPast && isUrgent && <NotificationsActiveIcon sx={{ fontSize: 18, color: '#EF4444' }} />}
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default function ExamTimetable() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ subject_code: '', subject_name: '', exam_date: '', exam_time: '10:00', venue: '', semester: '' });
  const [snack, setSnack] = useState('');

  const load = async () => {
    try { const r = await api.get('/features/timetable'); setExams(r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.subject_name || !form.exam_date) return;
    try {
      await api.post('/features/timetable', { ...form, exam_time: form.exam_time });
      setSnack('Exam added!'); setDialog(false);
      setForm({ subject_code: '', subject_name: '', exam_date: '', exam_time: '10:00', venue: '', semester: '' });
      load();
    } catch { setSnack('Failed to add exam'); }
  };

  const del = async (id) => {
    try { await api.delete(`/features/timetable/${id}`); setSnack('Removed'); load(); }
    catch { setSnack('Failed to remove'); }
  };

  const upcoming = exams.filter(e => getDaysLeft(e.exam_date) >= 0).sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
  const past = exams.filter(e => getDaysLeft(e.exam_date) < 0).sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));
  const nextExam = upcoming[0];
  const urgent3Days = upcoming.filter(e => getDaysLeft(e.exam_date) <= 3);

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}><Header /><Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#6366F1' }} /></Box></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F3FF' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 50%, #5B21B6 100%)', pt: 6, pb: 8, px: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', right: '3%', transform: 'translateY(-50%)', fontSize: '160px', opacity: 0.04, userSelect: 'none', lineHeight: 1 }}>📅</Box>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                <CalendarMonthIcon sx={{ color: '#C4B5FD', fontSize: 20 }} />
                <Typography sx={{ color: '#C4B5FD', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Exam Management</Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>Exam Timetable</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 1 }}>Live countdowns, 3-day alerts, and organized exam schedule</Typography>
            </Box>
            <Button onClick={() => setDialog(true)} variant="contained" startIcon={<AddIcon />}
              sx={{ bgcolor: '#7C3AED', color: 'white', fontWeight: 800, borderRadius: '12px', textTransform: 'none', px: 3, py: 1.5, boxShadow: '0 4px 16px rgba(124,58,237,0.4)', '&:hover': { bgcolor: '#6D28D9' } }}>
              Add Exam
            </Button>
          </Box>

          {/* Stats */}
          {exams.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 4 }}>
              {[
                { v: upcoming.length, l: 'Upcoming', c: '#C4B5FD' },
                { v: urgent3Days.length, l: 'In 3 Days!', c: urgent3Days.length ? '#FCA5A5' : '#86EFAC' },
                { v: nextExam ? getDaysLeft(nextExam.exam_date) : '—', l: 'Days to Next', c: '#FDE68A' },
                { v: past.length, l: 'Completed', c: '#86EFAC' },
              ].map((s, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderRadius: '14px', p: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: s.c, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.v}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', mt: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Container sx={{ py: 5 }}>
        {/* Next exam spotlight */}
        {nextExam && (
          <Paper elevation={0} sx={{ border: '2px solid #7C3AED', borderRadius: '20px', p: 4, mb: 4, background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)' }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '16px', bgcolor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <EventIcon sx={{ color: 'white', fontSize: 36 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>NEXT EXAM</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#1F2937' }}>{nextExam.subject_name}</Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                  {new Date(nextExam.exam_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {nextExam.exam_time}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '3.5rem', fontWeight: 900, color: getDaysLeft(nextExam.exam_date) <= 3 ? '#EF4444' : '#7C3AED', fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                  {getDaysLeft(nextExam.exam_date)}
                </Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>days left</Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {urgent3Days.length > 0 && (
          <Alert severity="error" icon={<NotificationsActiveIcon />} sx={{ mb: 3, borderRadius: '12px', border: '1px solid #FECACA' }}>
            🔔 <strong>{urgent3Days.length} exam(s) in the next 3 days!</strong> {urgent3Days.map(e => e.subject_name).join(', ')}
          </Alert>
        )}

        {upcoming.length > 0 ? (
          <>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1,#111827)', mb: 2 }}>Upcoming Exams</Typography>
            <Grid container spacing={2.5} mb={4}>
              {upcoming.map((e, i) => <Grid item xs={12} sm={6} md={4} key={i}><ExamCard exam={e} onDelete={del} /></Grid>)}
            </Grid>
          </>
        ) : (
          <Paper elevation={0} sx={{ border: '2px dashed #DDD6FE', borderRadius: '20px', p: 8, textAlign: 'center', bgcolor: 'white', mb: 4 }}>
            <CalendarMonthIcon sx={{ fontSize: 56, color: '#DDD6FE', mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#374151', mb: 1 }}>No upcoming exams</Typography>
            <Typography sx={{ color: '#9CA3AF', mb: 3 }}>Add your exam dates to get countdown timers and 3-day reminders</Typography>
            <Button onClick={() => setDialog(true)} variant="contained" startIcon={<AddIcon />}
              sx={{ bgcolor: '#7C3AED', textTransform: 'none', borderRadius: '10px', fontWeight: 700, '&:hover': { bgcolor: '#6D28D9' } }}>
              Add Exam
            </Button>
          </Paper>
        )}

        {past.length > 0 && (
          <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', overflow: 'hidden', bgcolor: 'white' }}>
            <Box sx={{ px: 4, py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
              <Typography sx={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.9rem' }}>Past Exams ({past.length})</Typography>
            </Box>
            {past.slice(0, 5).map((e, i) => (
              <Box key={i} sx={{ px: 4, py: 2, borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.65 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151' }}>{e.subject_name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(e.exam_date).toLocaleDateString('en-IN')} {e.exam_time && `• ${e.exam_time}`}</Typography>
                </Box>
                <IconButton size="small" onClick={() => del(e.id)} sx={{ color: '#D1D5DB' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
              </Box>
            ))}
          </Paper>
        )}
      </Container>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Exam</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}><TextField fullWidth size="small" label="Subject Code" value={form.subject_code} onChange={e => setForm(f => ({ ...f, subject_code: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Semester" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Subject Name *" value={form.subject_name} onChange={e => setForm(f => ({ ...f, subject_name: e.target.value }))} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Exam Date *" type="date" InputLabelProps={{ shrink: true }} value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Time" type="time" InputLabelProps={{ shrink: true }} value={form.exam_time} onChange={e => setForm(f => ({ ...f, exam_time: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Venue (optional)" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Exam Hall A / Online" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
          </Grid>
          {form.exam_date && (
            <Box sx={{ mt: 2, p: 2, borderRadius: '10px', bgcolor: '#EDE9FE', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, color: '#6D28D9', fontSize: '0.85rem' }}>
                {getDaysLeft(form.exam_date) > 0 ? `${getDaysLeft(form.exam_date)} days from today` : getDaysLeft(form.exam_date) === 0 ? '🔥 That\'s today!' : 'Date is in the past'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none', borderRadius: '10px', color: '#6B7280' }}>Cancel</Button>
          <Button onClick={save} disabled={!form.subject_name || !form.exam_date} variant="contained"
            sx={{ textTransform: 'none', borderRadius: '10px', bgcolor: '#7C3AED', fontWeight: 700, '&:hover': { bgcolor: '#6D28D9' } }}>
            Add Exam
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
