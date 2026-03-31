import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Button, Grid, Chip, Stack,
  TextField, Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  LinearProgress, IconButton, Tooltip
} from '@mui/material';
import AddIcon          from '@mui/icons-material/Add';
import EditIcon         from '@mui/icons-material/Edit';
import DeleteIcon       from '@mui/icons-material/Delete';
import WorkIcon         from '@mui/icons-material/Work';
import LinkIcon         from '@mui/icons-material/Link';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import AccessTimeIcon   from '@mui/icons-material/AccessTime';
import CancelIcon       from '@mui/icons-material/Cancel';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const STATUS_CONFIG = {
  applied:     { label:'Applied',      color:'#4F46E5', bg:'#EEF2FF' },
  interviewing:{ label:'Interviewing', color:'#F59E0B', bg:'#FFFBEB' },
  offered:     { label:'Offer Received',color:'#10B981', bg:'#F0FDF4' },
  accepted:    { label:'Accepted 🎉',  color:'#059669', bg:'#DCFCE7' },
  rejected:    { label:'Rejected',     color:'#EF4444', bg:'#FEF2F2' },
  withdrawn:   { label:'Withdrawn',    color:'#9CA3AF', bg:'#F9FAFB' },
};

const EMPTY = {
  company:'', role:'', location:'', type:'internship', status:'applied',
  apply_date:'', stipend:'', duration:'', notes:'', link:''
};

export default function InternshipTracker() {
  const [entries, setEntries]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('internships') || '[]'); } catch { return []; }
  });
  const [dialog, setDialog]     = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [filter, setFilter]     = useState('all');
  const [snack, setSnack]       = useState('');

  const save = () => localStorage.setItem('internships', JSON.stringify(entries));
  useEffect(() => { save(); }, [entries]);

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleSubmit = () => {
    if (!form.company || !form.role) { setSnack('Company and role required'); return; }
    if (editing !== null) {
      setEntries(e => e.map((x,i) => i===editing ? { ...form, id:x.id } : x));
    } else {
      setEntries(e => [...e, { ...form, id: Date.now() }]);
    }
    setDialog(false);
    setEditing(null);
    setForm(EMPTY);
    setSnack(editing !== null ? 'Updated!' : 'Application tracked!');
  };

  const handleEdit = (i) => { setEditing(i); setForm({ ...entries[i] }); setDialog(true); };
  const handleDelete = (i) => setEntries(e => e.filter((_,j) => j!==i));
  const handleStatus = (i, status) => setEntries(e => e.map((x,j) => j===i ? {...x, status} : x));

  const display = filter === 'all' ? entries : entries.filter(e => e.status === filter);

  // Stats
  const stats = {
    total:     entries.length,
    active:    entries.filter(e => ['applied','interviewing'].includes(e.status)).length,
    offers:    entries.filter(e => ['offered','accepted'].includes(e.status)).length,
    rejected:  entries.filter(e => e.status === 'rejected').length,
  };

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#0F172A,#1E3A8A,#1D4ED8)', py:{ xs:5, md:7 }, px:2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:2 }}>
            <Box>
              <Chip label="Career Tool" sx={{ bgcolor:'rgba(255,255,255,0.15)', color:'white', fontWeight:700, mb:1 }} />
              <Typography sx={{ fontSize:{ xs:'2rem', md:'2.5rem' }, fontWeight:900, color:'white', fontFamily:"'Space Grotesk',sans-serif" }}>
                Internship Tracker
              </Typography>
              <Typography sx={{ color:'rgba(255,255,255,0.7)', mt:0.5 }}>
                Track every application — from applied to accepted
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => { setEditing(null); setForm(EMPTY); setDialog(true); }}
              sx={{ bgcolor:'white', color:'#1D4ED8', fontWeight:700, borderRadius:'12px', textTransform:'none', boxShadow:'none', px:3, py:1.25 }}>
              Track Application
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py:4 }}>
        {/* Stats */}
        <Grid container spacing={2} mb={3}>
          {[
            { label:'Total Applied',   value:stats.total,    color:'#4F46E5', icon:'📋' },
            { label:'In Progress',     value:stats.active,   color:'#F59E0B', icon:'⏳' },
            { label:'Offers Received', value:stats.offers,   color:'#10B981', icon:'🎉' },
            { label:'Rejected',        value:stats.rejected, color:'#EF4444', icon:'❌' },
          ].map((s,i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card elevation={0} sx={{ border:`1.5px solid ${s.color}22`, borderRadius:'14px', p:2.5, textAlign:'center', bgcolor:`${s.color}08` }}>
                <Typography fontSize="1.75rem">{s.icon}</Typography>
                <Typography fontWeight={900} fontSize="2rem" color={s.color} lineHeight={1}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filter chips */}
        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
          <Chip label={`All (${entries.length})`} onClick={() => setFilter('all')} clickable
            sx={{ bgcolor:filter==='all'?'#4F46E5':'#F1F5F9', color:filter==='all'?'white':'#374151', fontWeight:700 }} />
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => {
            const count = entries.filter(e=>e.status===val).length;
            if (count === 0) return null;
            return (
              <Chip key={val} label={`${cfg.label} (${count})`} onClick={() => setFilter(val)} clickable
                sx={{ bgcolor:filter===val?cfg.color:cfg.bg, color:filter===val?'white':cfg.color, fontWeight:700 }} />
            );
          })}
        </Stack>

        {/* Applications list */}
        {display.length === 0 ? (
          <Card elevation={0} sx={{ border:'2px dashed #E5E7EB', borderRadius:'16px', p:6, textAlign:'center' }}>
            <WorkIcon sx={{ fontSize:48, color:'#CBD5E1', mb:1 }} />
            <Typography fontWeight={700} color="#374151">No applications {filter!=='all' ? 'with this status' : 'tracked yet'}</Typography>
            <Typography color="text.secondary" fontSize="0.875rem" mb={3}>
              {filter==='all' ? 'Start tracking your internship applications' : 'Try a different filter'}
            </Typography>
            {filter==='all' && (
              <Button variant="contained" startIcon={<AddIcon />}
                onClick={() => { setEditing(null); setForm(EMPTY); setDialog(true); }}
                sx={{ background:'linear-gradient(135deg,#1D4ED8,#4F46E5)', textTransform:'none', fontWeight:700, borderRadius:'12px', boxShadow:'none' }}>
                Add First Application
              </Button>
            )}
          </Card>
        ) : (
          <Grid container spacing={2}>
            {display.map((entry, i) => {
              const globalIdx = entries.indexOf(entry);
              const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.applied;
              return (
                <Grid item xs={12} md={6} lg={4} key={entry.id || i}>
                  <Card elevation={0} sx={{ border:`1.5px solid ${cfg.color}33`, borderRadius:'16px', p:2.5, height:'100%', display:'flex', flexDirection:'column', transition:'all 0.2s', '&:hover':{ transform:'translateY(-2px)', boxShadow:`0 8px 24px ${cfg.color}18` } }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:1.5 }}>
                      <Chip label={cfg.label} size="small" sx={{ bgcolor:cfg.bg, color:cfg.color, fontWeight:700, fontSize:'0.7rem' }} />
                      <Box sx={{ display:'flex', gap:0.5 }}>
                        <IconButton size="small" onClick={() => handleEdit(globalIdx)} sx={{ color:'#9CA3AF','&:hover':{ color:'#4F46E5' } }}><EditIcon sx={{ fontSize:14 }}/></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(globalIdx)} sx={{ color:'#9CA3AF','&:hover':{ color:'#EF4444' } }}><DeleteIcon sx={{ fontSize:14 }}/></IconButton>
                      </Box>
                    </Box>

                    <Typography fontWeight={800} fontSize="1rem" fontFamily="'Space Grotesk',sans-serif" color="#111827">{entry.company}</Typography>
                    <Typography color="#6B7280" fontSize="0.875rem" mb={1}>{entry.role}</Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1.5}>
                      {entry.location && <Chip label={`📍 ${entry.location}`} size="small" sx={{ bgcolor:'#F1F5F9', fontSize:'0.68rem' }} />}
                      {entry.type && <Chip label={entry.type} size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontSize:'0.68rem' }} />}
                      {entry.stipend && <Chip label={`₹${entry.stipend}/mo`} size="small" sx={{ bgcolor:'#F0FDF4', color:'#059669', fontWeight:700, fontSize:'0.68rem' }} />}
                    </Stack>

                    {entry.apply_date && (
                      <Typography variant="caption" color="text.secondary" sx={{ display:'flex', alignItems:'center', gap:0.5, mb:1 }}>
                        <AccessTimeIcon sx={{ fontSize:12 }} /> Applied: {new Date(entry.apply_date).toLocaleDateString('en-IN')}
                      </Typography>
                    )}
                    {entry.notes && (
                      <Typography variant="caption" color="#374151" sx={{ bgcolor:'#F9FAFB', p:1, borderRadius:'8px', display:'block', mb:1.5 }}>
                        {entry.notes.slice(0,80)}{entry.notes.length>80?'...':''}
                      </Typography>
                    )}

                    <Box sx={{ mt:'auto', pt:1.5, display:'flex', gap:0.75, flexWrap:'wrap' }}>
                      {entry.link && (
                        <Button size="small" href={entry.link} target="_blank" startIcon={<LinkIcon sx={{ fontSize:13 }}/>}
                          sx={{ textTransform:'none', fontSize:'0.72rem', color:'#4F46E5', p:'3px 10px', borderRadius:'8px', border:'1px solid #C7D2FE' }}>
                          View
                        </Button>
                      )}
                      {entry.status === 'offered' && (
                        <Button size="small" startIcon={<CheckCircleIcon sx={{ fontSize:13 }}/>}
                          onClick={() => handleStatus(globalIdx, 'accepted')}
                          sx={{ textTransform:'none', fontSize:'0.72rem', color:'white', bgcolor:'#10B981', p:'3px 10px', borderRadius:'8px', '&:hover':{ bgcolor:'#059669' } }}>
                          Accept
                        </Button>
                      )}
                      {['applied','interviewing'].includes(entry.status) && (
                        <Select size="small" value={entry.status}
                          onChange={e => handleStatus(globalIdx, e.target.value)}
                          sx={{ fontSize:'0.72rem', height:28, borderRadius:'8px', '.MuiOutlinedInput-notchedOutline':{ borderColor:'#E5E7EB' } }}>
                          {Object.entries(STATUS_CONFIG).map(([val,cfg]) => (
                            <MenuItem key={val} value={val} sx={{ fontSize:'0.8rem' }}>{cfg.label}</MenuItem>
                          ))}
                        </Select>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:'16px' } }}>
        <DialogTitle fontWeight={800}>{editing !== null ? 'Edit Application' : 'Track New Application'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Company *" value={form.company} onChange={e=>set('company',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Role *" value={form.role} onChange={e=>set('role',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Location" value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Bengaluru / Remote" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={form.type} onChange={e=>set('type',e.target.value)} label="Type" sx={{ borderRadius:'10px' }}>
                  {['internship','full-time','part-time','contract','freelance'].map(t=><MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={form.status} onChange={e=>set('status',e.target.value)} label="Status" sx={{ borderRadius:'10px' }}>
                  {Object.entries(STATUS_CONFIG).map(([v,c])=><MenuItem key={v} value={v}>{c.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" type="date" label="Applied On" value={form.apply_date} onChange={e=>set('apply_date',e.target.value)} InputLabelProps={{ shrink:true }} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Stipend (₹/month)" value={form.stipend} onChange={e=>set('stipend',e.target.value)} placeholder="15000" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Duration" value={form.duration} onChange={e=>set('duration',e.target.value)} placeholder="2 months" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Job Posting Link" value={form.link} onChange={e=>set('link',e.target.value)} placeholder="https://..." sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" multiline rows={2} label="Notes" value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Interview tips, referral name, etc." sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform:'none', borderRadius:'10px' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained"
            sx={{ background:'linear-gradient(135deg,#1D4ED8,#4F46E5)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
            {editing !== null ? 'Update' : 'Track Application'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
      <Footer />
    </Box>
  );
}
