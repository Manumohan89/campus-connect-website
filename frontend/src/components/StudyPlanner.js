import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Button, Grid, Chip, IconButton,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, CircularProgress, Paper, Stack, Tooltip, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4'];

function getWeekDates(offset = 0) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmt(date) { return date.toISOString().slice(0, 10); }

export default function StudyPlanner() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [plans, setPlans] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null); // { date }
  const [form, setForm] = useState({ subject_code:'', subject_name:'', duration_hours:1, notes:'' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const navigate = useNavigate();

  const weekDates = getWeekDates(weekOffset);
  const startDate = fmt(weekDates[0]);
  const endDate = fmt(weekDates[6]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/users/study-plan', { params: { start: startDate, end: endDate } }),
      api.get('/users/marks')
    ]).then(([p, m]) => {
      setPlans(p.data || []);
      setMarks(m.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  const getPlansForDate = (date) => plans.filter(p => p.study_date === fmt(date));

  const toggleComplete = async (id) => {
    await api.patch(`/users/study-plan/${id}/complete`).catch(() => {});
    setPlans(prev => prev.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
  };

  const deletePlan = async (id) => {
    await api.delete(`/users/study-plan/${id}`).catch(() => {});
    setPlans(prev => prev.filter(p => p.id !== id));
    setSnack('Deleted');
  };

  const handleAdd = async () => {
    if (!form.subject_code) { setSnack('Select a subject'); return; }
    setSaving(true);
    try {
      const res = await api.post('/users/study-plan', { ...form, study_date: dialog.date });
      setPlans(prev => [...prev, res.data]);
      setDialog(null);
      setForm({ subject_code:'', subject_name:'', duration_hours:1, notes:'' });
      setSnack('Study session added!');
    } catch { setSnack('Failed to add'); }
    finally { setSaving(false); }
  };

  const subjectColor = (code) => COLORS[code.charCodeAt(code.length - 1) % COLORS.length];

  const totalHours = plans.reduce((s, p) => s + (p.duration_hours || 1), 0);
  const doneHours = plans.filter(p => p.completed).reduce((s, p) => s + (p.duration_hours || 1), 0);
  const completionRate = totalHours > 0 ? Math.round((doneHours / totalHours) * 100) : 0;

  const today = fmt(new Date());

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#064E3B 0%,#059669 60%,#10B981 100%)', py:5, px:2 }}>
        <Container>
          <Box sx={{ display:'flex', gap:1.5, alignItems:'center', mb:1 }}>
            <CalendarMonthIcon sx={{ color:'#A7F3D0', fontSize:20 }} />
            <Typography sx={{ color:'#A7F3D0', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em' }}>Productivity</Typography>
          </Box>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:2 }}>
            <Box>
              <Typography sx={{ fontSize:{xs:'2rem',md:'2.5rem'}, fontWeight:900, color:'white' }}>Study Planner</Typography>
              <Typography sx={{ color:'rgba(255,255,255,0.65)', mt:0.5 }}>Plan your study sessions week by week</Typography>
            </Box>
            <Box sx={{ display:'flex', gap:1, p:2, bgcolor:'rgba(0,0,0,0.2)', borderRadius:'14px' }}>
              <Box sx={{ textAlign:'center', mr:3 }}>
                <Typography sx={{ fontSize:'1.8rem', fontWeight:900, color:'white', lineHeight:1 }}>{totalHours}h</Typography>
                <Typography sx={{ color:'rgba(255,255,255,0.6)', fontSize:'0.7rem' }}>Planned</Typography>
              </Box>
              <Box sx={{ textAlign:'center' }}>
                <Typography sx={{ fontSize:'1.8rem', fontWeight:900, color:'#A7F3D0', lineHeight:1 }}>{completionRate}%</Typography>
                <Typography sx={{ color:'rgba(255,255,255,0.6)', fontSize:'0.7rem' }}>Done</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ mt:2 }}>
            <LinearProgress variant="determinate" value={completionRate}
              sx={{ borderRadius:99, height:6, bgcolor:'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar':{ bgcolor:'#A7F3D0', borderRadius:99 } }} />
          </Box>
        </Container>
      </Box>

      <Container sx={{ py:4 }}>
        {/* Week navigation */}
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
          <Button onClick={() => setWeekOffset(w => w - 1)} variant="outlined" sx={{ borderRadius:'10px', textTransform:'none', borderColor:'#E5E7EB', color:'#374151', fontWeight:600 }}>← Prev Week</Button>
          <Box sx={{ textAlign:'center' }}>
            <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif">
              {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : `Week of ${weekDates[0].toLocaleDateString('en-IN',{day:'numeric',month:'short'})}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {weekDates[0].toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {weekDates[6].toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
            </Typography>
          </Box>
          <Button onClick={() => setWeekOffset(w => w + 1)} variant="outlined" sx={{ borderRadius:'10px', textTransform:'none', borderColor:'#E5E7EB', color:'#374151', fontWeight:600 }}>Next Week →</Button>
        </Box>

        {loading ? <Box sx={{ display:'flex', justifyContent:'center', py:6 }}><CircularProgress /></Box> : (
          <Grid container spacing={2}>
            {weekDates.map((date, i) => {
              const dayPlans = getPlansForDate(date);
              const isToday = fmt(date) === today;
              const isPast = date < new Date() && !isToday;
              const donePlans = dayPlans.filter(p => p.completed).length;
              return (
                <Grid item xs={12} sm={6} md key={i}>
                  <Card elevation={0} sx={{ border:`1.5px solid ${isToday ? '#10B981' : '#E5E7EB'}`, borderRadius:'16px', height:'100%', bgcolor: isToday ? '#F0FDF4' : isPast ? '#FAFAFA' : 'white' }}>
                    {/* Day header */}
                    <Box sx={{ px:2, pt:2, pb:1, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <Box>
                        <Typography sx={{ fontWeight:800, color: isToday ? '#059669' : '#374151', fontSize:'0.85rem' }}>{DAYS[date.getDay()]}</Typography>
                        <Typography sx={{ fontSize:'1.3rem', fontWeight:900, color: isToday ? '#059669' : '#111827', lineHeight:1 }}>{date.getDate()}</Typography>
                      </Box>
                      <Box sx={{ display:'flex', gap:0.5, alignItems:'center' }}>
                        {dayPlans.length > 0 && <Chip label={`${donePlans}/${dayPlans.length}`} size="small" sx={{ bgcolor: donePlans === dayPlans.length ? '#D1FAE5' : '#EEF2FF', color: donePlans === dayPlans.length ? '#065F46' : '#4F46E5', fontWeight:700, fontSize:'0.65rem' }} />}
                        <IconButton size="small" onClick={() => setDialog({ date: fmt(date) })} sx={{ color:'#10B981', bgcolor:'#D1FAE5', '&:hover':{ bgcolor:'#A7F3D0' }, width:26, height:26 }}>
                          <AddIcon sx={{ fontSize:16 }} />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Sessions */}
                    <Box sx={{ px:1.5, pb:1.5, minHeight:80 }}>
                      {dayPlans.length === 0 ? (
                        <Box sx={{ textAlign:'center', py:2, color:'#CBD5E1' }}>
                          <Typography variant="caption">No sessions</Typography>
                        </Box>
                      ) : (
                        <Stack spacing={0.75}>
                          {dayPlans.map(plan => (
                            <Box key={plan.id} sx={{ p:1, borderRadius:'8px', bgcolor: plan.completed ? '#F0FDF4' : 'white', border:`1px solid ${plan.completed ? '#BBF7D0' : '#E5E7EB'}`, display:'flex', gap:1, alignItems:'center' }}>
                              <IconButton size="small" onClick={() => toggleComplete(plan.id)} sx={{ p:0, color: plan.completed ? '#10B981' : '#CBD5E1', flexShrink:0 }}>
                                {plan.completed ? <CheckCircleIcon sx={{ fontSize:18 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize:18 }} />}
                              </IconButton>
                              <Box sx={{ flex:1, minWidth:0 }}>
                                <Typography sx={{ fontSize:'0.72rem', fontWeight:700, color: subjectColor(plan.subject_code), textDecoration: plan.completed ? 'line-through' : 'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                  {plan.subject_code}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display:'flex', alignItems:'center', gap:0.25 }}>
                                  <AccessTimeIcon sx={{ fontSize:10 }} />{plan.duration_hours}h
                                </Typography>
                              </Box>
                              <IconButton size="small" onClick={() => deletePlan(plan.id)} sx={{ color:'#CBD5E1', '&:hover':{ color:'#EF4444' }, p:0, flexShrink:0 }}>
                                <DeleteIcon sx={{ fontSize:14 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Subjects quick add */}
        {marks.length > 0 && (
          <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3, mt:3 }}>
            <Typography fontWeight={700} mb={2} fontSize="0.875rem">📚 Your Subjects — click to add to today's plan</Typography>
            <Box sx={{ display:'flex', flexWrap:'wrap', gap:1 }}>
              {marks.map((m, i) => (
                <Chip key={i} label={`${m.subject_code}${m.total < 40 ? ' ⚠️' : ''}`} clickable
                  onClick={() => { setDialog({ date: today }); setForm(f => ({ ...f, subject_code: m.subject_code, subject_name: m.subject_name || m.subject_code })); }}
                  sx={{ bgcolor: subjectColor(m.subject_code)+'18', color: subjectColor(m.subject_code), fontWeight:700, border:`1px solid ${subjectColor(m.subject_code)}33` }} />
              ))}
            </Box>
          </Card>
        )}
      </Container>

      {/* Add session dialog */}
      <Dialog open={!!dialog} onClose={() => setDialog(null)} PaperProps={{ sx:{ borderRadius:'16px' } }} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={800}>Add Study Session — {dialog?.date}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt:1 }}>
            <TextField size="small" label="Subject Code *" value={form.subject_code} onChange={e => setForm(f => ({...f, subject_code: e.target.value.toUpperCase()}))}
              placeholder="e.g. 21CS32" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            <TextField size="small" label="Subject Name" value={form.subject_name} onChange={e => setForm(f => ({...f, subject_name: e.target.value}))}
              placeholder="e.g. DAA" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            <TextField size="small" type="number" label="Duration (hours)" value={form.duration_hours} onChange={e => setForm(f => ({...f, duration_hours: parseFloat(e.target.value) || 1}))}
              inputProps={{ min:0.5, max:12, step:0.5 }} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            <TextField size="small" label="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              placeholder="Topics to cover..." sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2, gap:1 }}>
          <Button onClick={() => setDialog(null)} sx={{ textTransform:'none' }}>Cancel</Button>
          <Button onClick={handleAdd} disabled={saving} variant="contained"
            sx={{ background:'linear-gradient(135deg,#059669,#10B981)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
            {saving ? <CircularProgress size={18} sx={{ color:'white' }} /> : 'Add Session'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
      <Footer />
    </Box>
  );
}
