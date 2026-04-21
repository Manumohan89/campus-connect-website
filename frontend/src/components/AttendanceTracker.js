import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, Button, TextField,
  Alert, CircularProgress, LinearProgress, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Snackbar, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DangerousIcon from '@mui/icons-material/Dangerous';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const getStatus = (pct) => {
  if (pct >= 85) return { label: 'Safe', color: '#10B981', bg: '#D1FAE5', border: '#A7F3D0', icon: <CheckCircleIcon />, cardBg: '#F0FDF4' };
  if (pct >= 75) return { label: 'Warning', color: '#F59E0B', bg: '#FEF9C3', border: '#FDE68A', icon: <WarningIcon />, cardBg: '#FFFBEB' };
  return { label: 'Shortage!', color: '#EF4444', bg: '#FEE2E2', border: '#FECACA', icon: <DangerousIcon />, cardBg: '#FFF5F5' };
};

function SubjectCard({ subject, onEdit, onDelete }) {
  const pct = subject.total_classes > 0 ? (subject.attended_classes / subject.total_classes) * 100 : 0;
  const st = getStatus(pct);
  const needed = pct < 85 ? Math.ceil((0.85 * subject.total_classes - subject.attended_classes) / 0.15) : null;
  const canMiss = pct >= 85 ? Math.floor((subject.attended_classes - 0.75 * subject.total_classes) / 0.75) : 0;

  return (
    <Card elevation={0} sx={{
      border: `1.5px solid ${st.border}`, borderRadius: '18px', bgcolor: st.cardBg, overflow: 'hidden',
      transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${st.color}20` }
    }}>
      {/* Top accent bar */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${st.color}, ${st.color}88)` }} />

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ flex: 1 }}>
            <Chip label={subject.subject_code} size="small" sx={{ bgcolor: 'white', border: `1px solid ${st.border}`, color: st.color, fontWeight: 800, fontSize: '0.72rem', mb: 0.75 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-1,#111827)', lineHeight: 1.3 }}>{subject.subject_name || subject.subject_code}</Typography>
            {subject.semester && <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', mt: 0.25 }}>Semester {subject.semester}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
            <IconButton size="small" onClick={() => onEdit(subject)} sx={{ color: '#9CA3AF', '&:hover': { color: '#374151', bgcolor: 'rgba(0,0,0,0.05)' } }}><EditIcon sx={{ fontSize: 15 }} /></IconButton>
            <IconButton size="small" onClick={() => onDelete(subject.subject_code)} sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
          </Box>
        </Box>

        {/* Big percentage */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: '3.5rem', fontWeight: 900, color: st.color, lineHeight: 1, fontFamily: "'DM Mono', monospace", letterSpacing: '-2px' }}>
            {pct.toFixed(0)}<span style={{ fontSize: '1.5rem', fontWeight: 600 }}>%</span>
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', mt: 0.25 }}>
            {subject.attended_classes} attended / {subject.total_classes} total
          </Typography>
        </Box>

        {/* Progress bar with 85% marker */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          <LinearProgress variant="determinate" value={Math.min(pct, 100)}
            sx={{ height: 10, borderRadius: 99, bgcolor: 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { bgcolor: st.color, borderRadius: 99 } }} />
          {/* 85% line */}
          <Box sx={{ position: 'absolute', top: 0, left: '85%', width: '2px', height: 10, bgcolor: '#374151', opacity: 0.35 }} />
          <Box sx={{ position: 'absolute', top: 12, left: '82%', fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 700 }}>85%</Box>
        </Box>

        {/* Status + insight */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip icon={React.cloneElement(st.icon, { sx: { fontSize: '13px !important', color: `${st.color} !important` } })} label={st.label}
            size="small" sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${st.border}` }} />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: pct >= 85 && canMiss > 0 ? '#10B981' : pct < 85 ? '#EF4444' : '#9CA3AF' }}>
            {pct >= 85 && canMiss > 0 ? `Can miss ${canMiss} more` : pct < 85 && needed !== null ? `Attend ${needed} more → 85%` : ''}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default function AttendanceTracker() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ subject_code: '', subject_name: '', total_classes: '', attended_classes: '', semester: '' });
  const [snack, setSnack] = useState('');

  const load = async () => {
    try { const r = await api.get('/features/attendance'); setSubjects(r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ subject_code: '', subject_name: '', total_classes: '', attended_classes: '', semester: '' }); setDialog(true); };
  const openEdit = (s) => { setEditing(s); setForm({ subject_code: s.subject_code, subject_name: s.subject_name || '', total_classes: s.total_classes, attended_classes: s.attended_classes, semester: s.semester || '' }); setDialog(true); };

  const save = async () => {
    if (!form.subject_code || !form.total_classes || form.attended_classes === '') return;
    try {
      await api.post('/features/attendance', { ...form, total_classes: parseInt(form.total_classes), attended_classes: parseInt(form.attended_classes) });
      setSnack(editing ? 'Updated!' : 'Subject added!'); setDialog(false); load();
    } catch { setSnack('Failed to save'); }
  };

  const del = async (code) => {
    try { await api.delete(`/features/attendance/${code}`); setSnack('Deleted'); load(); }
    catch { setSnack('Failed to delete'); }
  };

  const danger = subjects.filter(s => s.total_classes > 0 && (s.attended_classes / s.total_classes) * 100 < 75);
  const warning = subjects.filter(s => { const p = s.total_classes > 0 ? (s.attended_classes / s.total_classes) * 100 : 0; return p >= 75 && p < 85; });
  const safe = subjects.filter(s => s.total_classes > 0 && (s.attended_classes / s.total_classes) * 100 >= 85);
  const overall = subjects.length ? (subjects.reduce((a, s) => a + (s.total_classes > 0 ? (s.attended_classes / s.total_classes) * 100 : 0), 0) / subjects.length).toFixed(1) : 0;

  const livePercent = form.total_classes && form.attended_classes !== '' ? ((parseInt(form.attended_classes) / parseInt(form.total_classes)) * 100).toFixed(1) : null;

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}><Header /><Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#0EA5E9' }} /></Box></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F0F9FF' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 60%, #0891B2 100%)', pt: 6, pb: 8, px: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', bottom: -40, right: -40, width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                <EventAvailableIcon sx={{ color: '#BAE6FD', fontSize: 20 }} />
                <Typography sx={{ color: '#BAE6FD', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Attendance Management</Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>Attendance Tracker</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>VTU requires ≥75%. We recommend keeping ≥85% as a buffer.</Typography>
            </Box>
            <Button onClick={openAdd} variant="contained" startIcon={<AddIcon />}
              sx={{ bgcolor: 'white', color: '#0369A1', fontWeight: 800, borderRadius: '12px', textTransform: 'none', px: 3, py: 1.5, '&:hover': { bgcolor: '#E0F2FE' }, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              Add Subject
            </Button>
          </Box>

          {subjects.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 4 }}>
              {[
                { v: `${overall}%`, l: 'Overall Avg', c: parseFloat(overall) >= 85 ? '#86EFAC' : parseFloat(overall) >= 75 ? '#FDE68A' : '#FCA5A5' },
                { v: safe.length, l: 'Safe (≥85%)', c: '#86EFAC' },
                { v: warning.length, l: 'Warning (75–84%)', c: '#FDE68A' },
                { v: danger.length, l: 'Shortage (<75%)', c: danger.length ? '#FCA5A5' : '#86EFAC' },
              ].map((s, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderRadius: '14px', p: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: s.c, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.v}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', mt: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Container sx={{ py: 5 }}>
        {danger.length > 0 && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', border: '1px solid #FECACA' }}>
            🚨 <strong>{danger.length} subject(s) below 75%:</strong> {danger.map(s => s.subject_code).join(', ')} — You may be detained!
          </Alert>
        )}
        {warning.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px', border: '1px solid #FDE68A' }}>
            ⚠️ <strong>{warning.length} subject(s) in warning zone (75–84%):</strong> {warning.map(s => s.subject_code).join(', ')}
          </Alert>
        )}

        {subjects.length === 0 ? (
          <Paper elevation={0} sx={{ border: '2px dashed #BAE6FD', borderRadius: '20px', p: 8, textAlign: 'center', bgcolor: 'white' }}>
            <EventAvailableIcon sx={{ fontSize: 56, color: '#BAE6FD', mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#374151', mb: 1 }}>No subjects tracked yet</Typography>
            <Typography sx={{ color: '#9CA3AF', mb: 3 }}>Add your subjects to start monitoring attendance. You'll get smart alerts when you're at risk.</Typography>
            <Button onClick={openAdd} variant="contained" startIcon={<AddIcon />}
              sx={{ bgcolor: '#0EA5E9', textTransform: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: '0 4px 14px rgba(14,165,233,0.4)', '&:hover': { bgcolor: '#0284C7' } }}>
              Add First Subject
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {subjects.map((s, i) => <Grid item xs={12} sm={6} md={4} key={i}><SubjectCard subject={s} onEdit={openEdit} onDelete={del} /></Grid>)}
          </Grid>
        )}
      </Container>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editing ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={8}>
              <TextField fullWidth size="small" label="Subject Code *" value={form.subject_code}
                onChange={e => setForm(f => ({ ...f, subject_code: e.target.value }))} disabled={!!editing}
                placeholder="e.g. 21CS32" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth size="small" label="Semester" value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Subject Name" value={form.subject_name}
                onChange={e => setForm(f => ({ ...f, subject_name: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Total Classes *" type="number" value={form.total_classes}
                onChange={e => setForm(f => ({ ...f, total_classes: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Classes Attended *" type="number" value={form.attended_classes}
                onChange={e => setForm(f => ({ ...f, attended_classes: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
          </Grid>
          {livePercent !== null && !isNaN(livePercent) && (
            <Box sx={{ mt: 2, p: 2, borderRadius: '10px', bgcolor: parseFloat(livePercent) >= 85 ? '#D1FAE5' : parseFloat(livePercent) >= 75 ? '#FEF9C3' : '#FEE2E2', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: parseFloat(livePercent) >= 85 ? '#065F46' : parseFloat(livePercent) >= 75 ? '#92400E' : '#991B1B', fontFamily: "'DM Mono', monospace" }}>
                {livePercent}%
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mt: 0.25 }}>
                {parseFloat(livePercent) >= 85 ? '✓ Safe zone' : parseFloat(livePercent) >= 75 ? '⚠ Warning zone' : '✗ Shortage — below 75%'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none', borderRadius: '10px', color: '#6B7280' }}>Cancel</Button>
          <Button onClick={save} variant="contained" disabled={!form.subject_code || !form.total_classes || form.attended_classes === ''}
            sx={{ textTransform: 'none', borderRadius: '10px', bgcolor: '#0EA5E9', fontWeight: 700, '&:hover': { bgcolor: '#0284C7' } }}>
            {editing ? 'Update' : 'Add Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
