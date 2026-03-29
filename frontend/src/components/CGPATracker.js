import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Grid, Card, Button, TextField,
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Paper, Alert, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import { Chart, registerables } from 'chart.js';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

Chart.register(...registerables);

const SEM_PALETTE = ['#6366F1','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6'];

const gradeFromSgpa = (s) => {
  const v = parseFloat(s);
  if (v >= 9) return { g:'S', bg:'#D1FAE5', fg:'#065F46' };
  if (v >= 8) return { g:'A', bg:'#DBEAFE', fg:'#1E40AF' };
  if (v >= 7) return { g:'B', bg:'#EDE9FE', fg:'#5B21B6' };
  if (v >= 6) return { g:'C', bg:'#FEF9C3', fg:'#854D0E' };
  if (v >= 5) return { g:'D', bg:'#FED7AA', fg:'#9A3412' };
  return { g:'F', bg:'#FEE2E2', fg:'#991B1B' };
};

function StatPill({ label, value, color, sub }) {
  return (
    <Box sx={{
      bgcolor: 'white', border: `1.5px solid ${color}33`, borderRadius: '16px',
      px: 3, py: 2.5, textAlign: 'center',
      boxShadow: `0 4px 20px ${color}15`,
      transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' }
    }}>
      <Typography sx={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: "'DM Mono', monospace", letterSpacing: '-1px', lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mt: 0.25 }}>{sub}</Typography>}
    </Box>
  );
}

export default function CGPATracker() {
  const [history, setHistory] = useState([]);
  const [marks, setMarks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ semester: '', sgpa: '', credits: '' });
  const [snack, setSnack] = useState('');
  const [goalCgpa, setGoalCgpa] = useState('');
  const [goalSems, setGoalSems] = useState('');
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const load = () => Promise.all([
    api.get('/features/sgpa-history'),
    api.get('/users/marks'),
    api.get('/users/profile'),
  ]).then(([h, m, p]) => {
    setHistory(h.data); setMarks(m.data || []); setProfile(p.data);
  }).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!history.length || !chartRef.current) return;
    if (chartInst.current) chartInst.current.destroy();
    const sorted = [...history].sort((a, b) => parseInt(a.semester) - parseInt(b.semester));
    chartInst.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: sorted.map(h => `Sem ${h.semester}`),
        datasets: [{
          label: 'SGPA',
          data: sorted.map(h => parseFloat(h.sgpa)),
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99,102,241,0.08)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: sorted.map((h, i) => SEM_PALETTE[i % SEM_PALETTE.length]),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 11,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E1B4B',
            titleColor: '#A5B4FC',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
            callbacks: { label: ctx => ` SGPA: ${ctx.raw} — ${gradeFromSgpa(ctx.raw).g} Grade` }
          }
        },
        scales: {
          y: { min: 0, max: 10, ticks: { stepSize: 2, color: '#9CA3AF', font: { size: 11 } }, grid: { color: '#F3F4F6' }, border: { display: false } },
          x: { ticks: { color: '#6B7280', font: { size: 11 } }, grid: { display: false }, border: { display: false } },
        },
        animation: { duration: 900, easing: 'easeInOutCubic' },
      },
    });
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [history]);

  const addEntry = async () => {
    if (!form.semester || !form.sgpa) return;
    try {
      await api.post('/features/sgpa-history', { semester: form.semester, sgpa: parseFloat(form.sgpa), credits: parseInt(form.credits) || 20 });
      await load();
      setSnack('Semester added!'); setDialog(false); setForm({ semester: '', sgpa: '', credits: '' });
    } catch { setSnack('Failed to add'); }
  };

  const deleteEntry = async (id) => {
    try {
      // No delete endpoint yet — just reload
      setSnack('Delete coming soon'); await load();
    } catch {}
  };

  const calcCgpa = () => {
    if (!history.length) return profile?.cgpa?.toFixed(2) || '—';
    const sorted = [...history].sort((a, b) => parseInt(a.semester) - parseInt(b.semester));
    const total = sorted.reduce((acc, h) => acc + parseFloat(h.sgpa) * (parseInt(h.credits) || 20), 0);
    const creds = sorted.reduce((acc, h) => acc + (parseInt(h.credits) || 20), 0);
    return creds ? (total / creds).toFixed(2) : '—';
  };

  const failed = marks.filter(m => m.total < 40);
  const cgpa = calcCgpa();
  const latest = [...history].sort((a, b) => parseInt(b.semester) - parseInt(a.semester))[0];

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <Header />
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#6366F1' }} /></Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F7F8FC' }}>
      <Header />

      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1D4ED8 100%)',
        pt: 6, pb: 8, px: 2, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative rings */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 450, height: 450, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(99,102,241,0.3)', borderRadius: 2 }}>
                  <TrendingUpIcon sx={{ color: '#A5B4FC', fontSize: 22 }} />
                </Box>
                <Typography sx={{ color: '#A5B4FC', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Academic Performance</Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', lineHeight: 1.1, fontFamily: "'DM Sans', sans-serif" }}>
                CGPA Tracker
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, maxWidth: 480 }}>
                Upload each semester's marks card and watch your CGPA trend evolve over time
              </Typography>
            </Box>
            <Button onClick={() => setDialog(true)} variant="contained"
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#6366F1', color: 'white', fontWeight: 700, borderRadius: '12px', textTransform: 'none', px: 3, py: 1.5, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(99,102,241,0.4)', '&:hover': { bgcolor: '#4F46E5', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
              Add Semester
            </Button>
          </Box>

          {/* Hero stats */}
          <Grid container spacing={2} sx={{ mt: 4 }}>
            {[
              { label: 'Overall CGPA', value: cgpa, color: '#A5B4FC', sub: `${history.length} semesters` },
              { label: 'Latest SGPA', value: latest ? parseFloat(latest.sgpa).toFixed(2) : '—', color: '#67E8F9', sub: latest ? `Semester ${latest.semester}` : 'No data yet' },
              { label: 'Subjects', value: marks.length || '—', color: '#86EFAC', sub: 'Total subjects' },
              { label: 'Backlogs', value: failed.length, color: failed.length ? '#FCA5A5' : '#86EFAC', sub: failed.length ? 'Need clearing' : 'All clear 🎉' },
            ].map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', borderRadius: '16px', p: 2.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: s.color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', mt: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', mt: 0.25 }}>{s.sub}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: 5, mt: -2 }}>
        {failed.length > 0 && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', border: '1px solid #FCA5A5' }}>
            <strong>{failed.length} backlog(s) detected:</strong> {failed.map(s => s.subject_code).join(', ')} — visit <strong>Backlog Dashboard</strong> to take action
          </Alert>
        )}

        {/* Chart */}
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: 4, mb: 4, bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>SGPA Trend</Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Semester-wise performance over time</Typography>
            </Box>
            {history.length >= 2 && (
              <Chip label={parseFloat(cgpa) >= 8 ? '📈 Excellent Trend' : parseFloat(cgpa) >= 6 ? '📊 Steady Progress' : '⚠️ Needs Improvement'}
                sx={{ bgcolor: parseFloat(cgpa) >= 8 ? '#D1FAE5' : parseFloat(cgpa) >= 6 ? '#EEF2FF' : '#FEE2E2', color: parseFloat(cgpa) >= 8 ? '#065F46' : parseFloat(cgpa) >= 6 ? '#4338CA' : '#991B1B', fontWeight: 700, fontSize: '0.75rem' }} />
            )}
          </Box>
          {history.length < 2 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
              <SchoolIcon sx={{ fontSize: 52, mb: 2, opacity: 0.3 }} />
              <Typography fontWeight={600}>Add at least 2 semesters to see the trend graph</Typography>
              <Typography variant="caption">Click "Add Semester" above to manually enter SGPA data</Typography>
            </Box>
          ) : (
            <Box sx={{ height: 280 }}>
              <canvas ref={chartRef} />
            </Box>
          )}
        </Paper>

        {/* Semester Table */}
        {history.length > 0 && (
          <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', overflow: 'hidden', bgcolor: 'white', mb: 4 }}>
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>Semester History</Typography>
              <Chip label={`Overall CGPA: ${cgpa}`} sx={{ bgcolor: '#EEF2FF', color: '#4338CA', fontWeight: 800, fontSize: '0.85rem' }} />
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Semester', 'SGPA', 'Grade', 'Credits', 'Contribution', 'Added'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Semester' ? 'left' : 'center', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #F3F4F6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].sort((a, b) => parseInt(a.semester) - parseInt(b.semester)).map((h, i) => {
                    const { g, bg, fg } = gradeFromSgpa(h.sgpa);
                    const credits = parseInt(h.credits) || 20;
                    const contribution = (parseFloat(h.sgpa) * credits).toFixed(1);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: SEM_PALETTE[parseInt(h.semester) - 1] || '#6366F1' }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>Semester {h.semester}</Typography>
                          </Box>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#111827', fontFamily: "'DM Mono', monospace" }}>{parseFloat(h.sgpa).toFixed(2)}</Typography>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <span style={{ padding: '3px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, background: bg, color: fg }}>{g}</span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>{credits}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', color: '#6366F1', fontWeight: 700, fontSize: '0.875rem' }}>{contribution}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.75rem' }}>{new Date(h.uploaded_on).toLocaleDateString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </Paper>
        )}

        {history.length === 0 && (
          <Paper elevation={0} sx={{ border: '2px dashed #E5E7EB', borderRadius: '20px', p: 8, textAlign: 'center', bgcolor: 'white' }}>
            <TrendingUpIcon sx={{ fontSize: 56, color: '#D1D5DB', mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#374151', mb: 1 }}>No semester data yet</Typography>
            <Typography sx={{ color: '#9CA3AF', mb: 3 }}>Add your SGPA for each semester to track your CGPA progress over time</Typography>
            <Button onClick={() => setDialog(true)} variant="contained" startIcon={<AddIcon />}
              sx={{ bgcolor: '#6366F1', textTransform: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
              Add First Semester
            </Button>
          </Paper>
        )}
      </Container>

      {/* Add Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>Add Semester SGPA</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', mb: 3 }}>Enter your SGPA from your VTU marks card for this semester</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth label="Semester (1–8)" type="number" inputProps={{ min: 1, max: 8 }}
                value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="SGPA (0–10)" type="number" inputProps={{ min: 0, max: 10, step: 0.01 }}
                value={form.sgpa} onChange={e => setForm(f => ({ ...f, sgpa: e.target.value }))} size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Total Credits (optional, default 20)" type="number"
                value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            </Grid>
          </Grid>
          {form.sgpa && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#EEF2FF', borderRadius: '10px', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, color: '#4338CA', fontSize: '0.85rem' }}>
                Grade: {gradeFromSgpa(form.sgpa).g} — {parseFloat(form.sgpa) >= 8 ? 'Outstanding!' : parseFloat(form.sgpa) >= 6 ? 'Good performance' : 'Keep working hard!'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none', borderRadius: '10px', color: '#6B7280' }}>Cancel</Button>
          <Button onClick={addEntry} variant="contained" disabled={!form.semester || !form.sgpa}
            sx={{ textTransform: 'none', borderRadius: '10px', bgcolor: '#6366F1', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#4F46E5' } }}>
            Save Semester
          </Button>
        </DialogActions>
      </Dialog>

      {/* CGPA Goal Calculator */}
      <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: 4, mb: 4, bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmojiEventsIcon sx={{ color: '#7C3AED', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>CGPA Goal Calculator</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Find out what SGPA you need to hit your target CGPA</Typography>
          </Box>
        </Box>

        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <TextField size="small" fullWidth label="Target CGPA" type="number"
              value={goalCgpa} onChange={e => setGoalCgpa(e.target.value)}
              inputProps={{ min: 0, max: 10, step: 0.1 }} placeholder="e.g. 8.5"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField size="small" fullWidth label="Remaining Semesters" type="number"
              value={goalSems} onChange={e => setGoalSems(e.target.value)}
              inputProps={{ min: 1, max: 8, step: 1 }} placeholder="e.g. 3"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            {(() => {
              const target = parseFloat(goalCgpa);
              const semsLeft = parseInt(goalSems);
              const currentCgpaNum = parseFloat(cgpa) || 0;
              const totalSemsDone = history.length;
              const avgCredits = history.length > 0
                ? history.reduce((s, h) => s + (parseInt(h.credits) || 20), 0) / history.length
                : 20;

              if (!target || !semsLeft || target > 10 || target < 0) {
                return (
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Enter target & remaining semesters</Typography>
                  </Box>
                );
              }

              const totalCreditsEarned = history.reduce((s, h) => s + (parseInt(h.credits) || 20), 0);
              const totalGPEarned = history.reduce((s, h) => s + parseFloat(h.sgpa) * (parseInt(h.credits) || 20), 0);
              const creditsNeeded = semsLeft * avgCredits;
              const totalCreditsAfter = totalCreditsEarned + creditsNeeded;
              const neededTotalGP = target * totalCreditsAfter;
              const neededGP = neededTotalGP - totalGPEarned;
              const neededSgpa = neededGP / creditsNeeded;

              if (neededSgpa > 10) {
                return (
                  <Box sx={{ p: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#991B1B' }}>❌ Not achievable</Typography>
                    <Typography variant="caption" color="text.secondary">Would need SGPA {'>'} 10.0. Lower target or add more semesters.</Typography>
                  </Box>
                );
              }
              if (neededSgpa <= 0 || (currentCgpaNum > 0 && currentCgpaNum >= target)) {
                return (
                  <Box sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#065F46' }}>🎉 Already achieved!</Typography>
                    <Typography variant="caption" color="text.secondary">Your current CGPA already meets or exceeds your target.</Typography>
                  </Box>
                );
              }
              const color = neededSgpa >= 9 ? '#EF4444' : neededSgpa >= 8 ? '#F59E0B' : '#10B981';
              return (
                <Box sx={{ p: 2, bgcolor: `${color}08`, border: `1.5px solid ${color}33`, borderRadius: '10px', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color, fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>
                    {neededSgpa.toFixed(2)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    SGPA needed per sem
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    For {semsLeft} more semester{semsLeft > 1 ? 's' : ''} to reach CGPA {target}
                  </Typography>
                </Box>
              );
            })()}
          </Grid>
        </Grid>

        {goalCgpa && goalSems && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#EEF2FF', borderRadius: '10px' }}>
            <Typography variant="caption" color="#4338CA" sx={{ display: 'block', fontWeight: 600 }}>
              📌 Formula: Required SGPA = (Target CGPA × Total Credits − Current GP Earned) / Credits in Remaining Sems
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
