import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Alert, Snackbar, CircularProgress, Table, TableHead,
  TableRow, TableCell, TableBody, Switch, FormControlLabel, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const DEPTS = ['ALL','CSE','ISE','ECE','ME','CV','EEE','AIML','DS'];
const CATS = ['backlog_clearing','upskill','placement'];
const CAT_COLOR = { backlog_clearing: '#EF4444', upskill: '#7C3AED', placement: '#10B981' };
const EMPTY = { title:'', description:'', category:'upskill', subject_code:'', department:'ALL', semester:'', year_scheme:'', instructor:'', duration_hours:0, is_free:true, has_certificate:true, course_url:'' };

export default function AdminTraining() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [activeFilter, setActiveFilter] = useState('all');

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const load = async () => {
    setLoading(true);
    try { const res = await adminApi.get('/training'); setCourses(res.data); }
    catch (e) { showSnack('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => { setEditing(null); setForm(EMPTY); setDialog(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description || '', category: c.category, subject_code: c.subject_code || '', department: c.department || 'ALL', semester: c.semester || '', year_scheme: c.year_scheme || '', instructor: c.instructor || '', duration_hours: c.duration_hours || 0, is_free: c.is_free !== false, has_certificate: c.has_certificate !== false, course_url: c.course_url || '' });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.category) { showSnack('Title and category required', 'error'); return; }
    setSaving(true);
    try {
      if (editing) { await adminApi.put(`/training/${editing.course_id}`, form); showSnack('Course updated'); }
      else { await adminApi.post('/training', form); showSnack('Course created'); }
      setDialog(false); load();
    } catch (e) { showSnack(e.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await adminApi.delete(`/training/${id}`); showSnack('Course deleted'); setConfirmDelete(null); load(); }
    catch (e) { showSnack('Failed to delete', 'error'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const filtered = activeFilter === 'all' ? courses : courses.filter(c => c.category === activeFilter);

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="#111827">Training Courses</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">{courses.length} courses — manage backlog clearing, upskill & placement</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ background: 'linear-gradient(135deg,#10B981,#059669)', textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}>
          Add Course
        </Button>
      </Box>

      {/* Category filter tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {[['all', 'All', '#374151'], ...CATS.map(c => [c, c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), CAT_COLOR[c]])].map(([val, label, color]) => (
          <Chip key={val} label={`${label} (${val === 'all' ? courses.length : courses.filter(c => c.category === val).length})`}
            onClick={() => setActiveFilter(val)} clickable
            sx={{ bgcolor: activeFilter === val ? color : '#F1F5F9', color: activeFilter === val ? 'white' : '#374151', fontWeight: 700, fontSize: '0.75rem', '&:hover': { opacity: 0.9 } }} />
        ))}
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
                  {['Course', 'Category', 'Dept / Sem', 'Instructor', 'Hours', 'Enrollments', 'Certs', 'Free', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.course_id} sx={{ '&:hover': { bgcolor: 'var(--bg-card2,#F8FAFC)' } }}>
                    <TableCell sx={{ maxWidth: 200, py: 1.25 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-1,#111827)' }}>{c.title}</Typography>
                      {c.subject_code && <Chip label={c.subject_code} size="small" sx={{ mt: 0.25, bgcolor: '#EEF2FF', color: '#4F46E5', fontSize: '0.65rem', height: 18 }} />}
                    </TableCell>
                    <TableCell>
                      <Chip label={c.category.replace('_',' ')} size="small" sx={{ bgcolor: (CAT_COLOR[c.category]||'#4F46E5')+'18', color: CAT_COLOR[c.category]||'#4F46E5', fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>{c.department || '—'}</Typography>
                      {c.semester && <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Sem {c.semester}</Typography>}
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>{c.instructor || '—'}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>{c.duration_hours}h</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>{c.enrollment_count || 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WorkspacePremiumIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>{c.certificates_issued || 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={c.is_free ? 'Free' : 'Paid'} size="small" sx={{ bgcolor: c.is_free ? '#D1FAE5' : '#FEF9C3', color: c.is_free ? '#065F46' : '#92400E', fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(c)} sx={{ color: '#10B981' }}><EditIcon sx={{ fontSize: 15 }} /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setConfirmDelete(c)} sx={{ color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}><Typography>No courses in this category</Typography></Box>}
          </Box>
        )}
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>{editing ? 'Edit Course' : 'Add Course'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth size="small" label="Title *" value={form.title} onChange={e => set('title', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small"><InputLabel>Category *</InputLabel>
                <Select value={form.category} onChange={e => set('category', e.target.value)} label="Category *" sx={{ borderRadius: '10px' }}>
                  {CATS.map(c => <MenuItem key={c} value={c}>{c.replace('_',' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Subject Code (if backlog)" value={form.subject_code} onChange={e => set('subject_code', e.target.value)} placeholder="e.g. 21CS32" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" multiline rows={2} label="Description" value={form.description} onChange={e => set('description', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small"><InputLabel>Department</InputLabel>
                <Select value={form.department} onChange={e => set('department', e.target.value)} label="Department" sx={{ borderRadius: '10px' }}>
                  {DEPTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}><TextField fullWidth size="small" label="Semester" value={form.semester} onChange={e => set('semester', e.target.value)} placeholder="3" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" label="Year Scheme" value={form.year_scheme} onChange={e => set('year_scheme', e.target.value)} placeholder="2021" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={8}><TextField fullWidth size="small" label="Instructor" value={form.instructor} onChange={e => set('instructor', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" type="number" label="Duration (hours)" value={form.duration_hours} onChange={e => set('duration_hours', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="External Course URL (YouTube/NPTEL/Coursera)" value={form.course_url} onChange={e => set('course_url', e.target.value)} placeholder="https://youtube.com/playlist?list=..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><FormControlLabel control={<Switch checked={form.is_free} onChange={e => set('is_free', e.target.checked)} color="success" />} label="Free course" /></Grid>
            <Grid item xs={6}><FormControlLabel control={<Switch checked={form.has_certificate} onChange={e => set('has_certificate', e.target.checked)} color="primary" />} label="Has certificate" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ background: 'linear-gradient(135deg,#10B981,#059669)', textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>Delete Course?</DialogTitle>
        <DialogContent><Alert severity="error" sx={{ borderRadius: '10px' }}>Delete <strong>{confirmDelete?.title}</strong>? All enrollments will also be removed.</Alert></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => handleDelete(confirmDelete.course_id)}
            sx={{ bgcolor: '#EF4444', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '10px' }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
