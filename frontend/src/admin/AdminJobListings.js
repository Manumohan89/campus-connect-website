import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, CircularProgress, TextField, InputAdornment, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Snackbar,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const EMPTY = { title:'', company:'', description:'', type:'Full-time', location:'Bengaluru',
  tags:'', link:'', min_cgpa:0, eligible_branches:'', deadline:'', is_active:true };

const TYPE_STYLE = {
  'Internship':{ bg:'#EDE9FE', color:'#5B21B6' },
  'Full-time': { bg:'#D1FAE5', color:'#065F46' },
  'Contract':  { bg:'#FEF9C3', color:'#92400E' },
  'Remote':    { bg:'#DBEAFE', color:'#1E3A8A' } };

export default function AdminJobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(null); // null | 'add' | job object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    adminApi.get('/jobs').then(r => setJobs(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const openAdd = () => { setForm(EMPTY); setDialog('add'); };
  const openEdit = (job) => {
    setForm({
      ...job,
      tags: (job.tags || []).join(', '),
      eligible_branches: (job.eligible_branches || []).join(', '),
      deadline: job.deadline ? job.deadline.split('T')[0] : '' });
    setDialog(job);
  };

  const save = async () => {
    if (!form.title || !form.company || !form.link) { setSnack('Title, company and link are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        eligible_branches: form.eligible_branches.split(',').map(t => t.trim()).filter(Boolean),
        min_cgpa: parseFloat(form.min_cgpa) || 0 };
      if (dialog === 'add') {
        await adminApi.post('/jobs', payload);
        setSnack('Job listing created');
      } else {
        await adminApi.put(`/jobs/${dialog.id}`, payload);
        setSnack('Job listing updated');
      }
      setDialog(null);
      load();
    } catch (e) { setSnack(e.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  const deleteJob = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await adminApi.delete(`/jobs/${id}`);
      setJobs(j => j.filter(x => x.id !== id));
      setSnack('Deleted');
    } catch { setSnack('Failed to delete'); }
  };

  const toggle = async (job) => {
    try {
      await adminApi.put(`/jobs/${job.id}`, { ...job, is_active: !job.is_active });
      setJobs(j => j.map(x => x.id === job.id ? { ...x, is_active: !x.is_active } : x));
    } catch { setSnack('Failed to toggle'); }
  };

  const filtered = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AdminLayout>
      <Box sx={{ mb:3, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Job Listings</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">{jobs.length} listings · {jobs.filter(j=>j.is_active).length} active</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
          Add Job
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb:2, borderRadius:'12px', fontSize:'0.8rem' }}>
        Jobs added here appear on the student-facing Job Opportunities page. Seeded with 15 real VTU-relevant companies on first deploy.
      </Alert>

      <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'14px', p:2, mb:2 }}>
        <TextField fullWidth size="small" placeholder="Search by title or company..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ color:'#9CA3AF', fontSize:18 }} /></InputAdornment> }}
          sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
      </Card>

      <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden' }}>
        {loading ? <Box sx={{ display:'flex', justifyContent:'center', py:6 }}><CircularProgress /></Box> : (
          <Box sx={{ overflowX:'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                  {['Title','Company','Type','Location','Min CGPA','Status','Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.7rem', color:'#9CA3AF', textTransform:'uppercase', py:1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(job => {
                  const tc = TYPE_STYLE[job.type] || TYPE_STYLE['Full-time'];
                  return (
                    <TableRow key={job.id} sx={{ '&:hover':{ bgcolor:'#FAFAFA' } }}>
                      <TableCell sx={{ py:1.5, maxWidth:180 }}>
                        <Typography fontSize="0.82rem" fontWeight={600} sx={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{job.title}</Typography>
                      </TableCell>
                      <TableCell><Typography fontSize="0.82rem">{job.company}</Typography></TableCell>
                      <TableCell><Chip label={job.type} size="small" sx={{ bgcolor:tc.bg, color:tc.color, fontWeight:700, fontSize:'0.62rem' }} /></TableCell>
                      <TableCell><Typography fontSize="0.75rem" color="text.secondary">{job.location || '—'}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.75rem">{job.min_cgpa > 0 ? job.min_cgpa : 'Any'}</Typography></TableCell>
                      <TableCell>
                        <Switch size="small" checked={job.is_active} onChange={() => toggle(job)} color="success" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display:'flex', gap:0.5 }}>
                          <IconButton size="small" onClick={() => openEdit(job)} sx={{ color:'#4F46E5' }}><EditIcon sx={{ fontSize:15 }} /></IconButton>
                          <IconButton size="small" onClick={() => deleteJob(job.id, job.title)} sx={{ color:'#EF4444' }}><DeleteIcon sx={{ fontSize:15 }} /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} sx={{ textAlign:'center', py:6, color:'#9CA3AF' }}>
                    No job listings yet. Click "Add Job" to create your first listing.
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:'16px' } }}>
        <DialogTitle fontWeight={800}>{dialog === 'add' ? 'Add Job Listing' : 'Edit Job Listing'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt:1 }}>
            <Grid item xs={12} sm={8}>
              <TextField label="Job Title *" fullWidth size="small" value={form.title} onChange={e => set('title',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={form.type} onChange={e => set('type',e.target.value)} label="Type" sx={{ borderRadius:'10px' }}>
                  {['Internship','Full-time','Contract','Remote'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Company *" fullWidth size="small" value={form.company} onChange={e => set('company',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Location" fullWidth size="small" value={form.location} onChange={e => set('location',e.target.value)} placeholder="Bengaluru / Remote" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth size="small" multiline rows={3} value={form.description} onChange={e => set('description',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Apply Link *" fullWidth size="small" value={form.link} onChange={e => set('link',e.target.value)} placeholder="https://company.com/careers" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Min CGPA (0 = any)" fullWidth size="small" type="number" value={form.min_cgpa} onChange={e => set('min_cgpa',e.target.value)} inputProps={{ min:0, max:10, step:0.5 }} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Deadline (optional)" fullWidth size="small" type="date" value={form.deadline} onChange={e => set('deadline',e.target.value)} InputLabelProps={{ shrink:true }} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Tags (comma-separated)" fullWidth size="small" value={form.tags} onChange={e => set('tags',e.target.value)} placeholder="CSE, ISE, Python, React, DSA" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Eligible Branches (blank = all)" fullWidth size="small" value={form.eligible_branches} onChange={e => set('eligible_branches',e.target.value)} placeholder="CSE, ISE, ECE" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={e => set('is_active',e.target.checked)} color="success" />} label="Active (visible to students)" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3 }}>
          <Button onClick={() => setDialog(null)} sx={{ textTransform:'none' }}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving || !form.title || !form.company || !form.link}
            startIcon={saving ? <CircularProgress size={16} sx={{ color:'#fff' }} /> : null}
            sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
            {saving ? 'Saving...' : dialog === 'add' ? 'Add Job' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
    </AdminLayout>
  );
}
