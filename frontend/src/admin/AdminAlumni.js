import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Alert, Snackbar, CircularProgress, Table, TableHead,
  TableRow, TableCell, TableBody, Tooltip, Switch, FormControlLabel, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const BRANCHES = ['CSE','ISE','ECE','ME','CV','EEE','AIML','DS','CH','BT'];
const EMPTY = { full_name:'', email:'', branch:'CSE', graduation_year:new Date().getFullYear()-1, current_company:'', current_role:'', linkedin_url:'', bio:'', skills:[], is_available:true, college:'' };

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [skillsText, setSkillsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [search, setSearch] = useState('');

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const load = async () => {
    setLoading(true);
    try { const res = await adminApi.get('/alumni'); setAlumni(res.data); }
    catch { showSnack('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => { setEditing(null); setForm(EMPTY); setSkillsText(''); setDialog(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({ full_name: a.full_name, email: a.email, branch: a.branch, graduation_year: a.graduation_year, current_company: a.current_company || '', current_role: a.current_role || '', linkedin_url: a.linkedin_url || '', bio: a.bio || '', skills: a.skills || [], is_available: a.is_available !== false, college: a.college || '' });
    setSkillsText((a.skills || []).join(', '));
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email || !form.branch || !form.graduation_year) { showSnack('Name, email, branch and year required', 'error'); return; }
    setSaving(true);
    const payload = { ...form, skills: skillsText ? skillsText.split(',').map(s => s.trim()).filter(Boolean) : [] };
    try {
      if (editing) { await adminApi.put(`/alumni/${editing.id}`, payload); showSnack('Alumni updated'); }
      else { await adminApi.post('/alumni', payload); showSnack('Alumni added'); }
      setDialog(false); load();
    } catch (e) { showSnack(e.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await adminApi.delete(`/alumni/${id}`); showSnack('Alumni removed'); setConfirmDelete(null); load(); }
    catch { showSnack('Failed', 'error'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = alumni.filter(a => !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.current_company?.toLowerCase().includes(search.toLowerCase()) || a.branch?.toLowerCase().includes(search.toLowerCase()));

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A';
  const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="#111827">Alumni</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">{alumni.length} alumni mentors · {alumni.filter(a => a.is_available).length} available</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ background: 'linear-gradient(135deg,#EC4899,#BE185D)', textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}>
          Add Alumni
        </Button>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', p: 2, mb: 2 }}>
        <TextField size="small" fullWidth placeholder="Search name, company, branch..." value={search} onChange={e => setSearch(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
      </Card>

      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
                  {['Alumni', 'Company / Role', 'Branch', 'Batch', 'Skills', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(a => {
                  const color = AVATAR_COLORS[a.id % AVATAR_COLORS.length];
                  return (
                    <TableRow key={a.id} sx={{ '&:hover': { bgcolor: 'var(--bg-card2,#F8FAFC)' } }}>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: color, fontSize: '0.72rem', fontWeight: 800 }}>{initials(a.full_name)}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-1,#111827)' }}>{a.full_name}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{a.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>{a.current_company || '—'}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{a.current_role || '—'}</Typography>
                      </TableCell>
                      <TableCell><Chip label={a.branch} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.65rem' }} /></TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.82rem', color: '#374151' }}>{a.graduation_year}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, maxWidth: 140 }}>
                          {(a.skills || []).slice(0, 2).map((s, i) => <Chip key={i} label={s} size="small" sx={{ bgcolor: '#F1F5F9', color: '#374151', fontSize: '0.62rem', height: 18 }} />)}
                          {(a.skills || []).length > 2 && <Chip label={`+${a.skills.length - 2}`} size="small" sx={{ bgcolor: '#F1F5F9', color: '#9CA3AF', fontSize: '0.62rem', height: 18 }} />}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={a.is_available ? 'Available' : 'Busy'} size="small"
                          sx={{ bgcolor: a.is_available ? '#D1FAE5' : '#F1F5F9', color: a.is_available ? '#065F46' : '#9CA3AF', fontWeight: 700, fontSize: '0.65rem' }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {a.linkedin_url && <Tooltip title="LinkedIn"><IconButton size="small" component="a" href={a.linkedin_url} target="_blank" sx={{ color: '#0A66C2' }}><LinkedInIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>}
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(a)} sx={{ color: '#EC4899' }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => setConfirmDelete(a)} sx={{ color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filtered.length === 0 && <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}><Typography>No alumni found</Typography></Box>}
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>{editing ? 'Edit Alumni' : 'Add Alumni'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={8}><TextField fullWidth size="small" label="Full Name *" value={form.full_name} onChange={e => set('full_name', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" type="number" label="Graduation Year *" value={form.graduation_year} onChange={e => set('graduation_year', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" type="email" label="Email *" value={form.email} onChange={e => set('email', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small"><InputLabel>Branch *</InputLabel>
                <Select value={form.branch} onChange={e => set('branch', e.target.value)} label="Branch *" sx={{ borderRadius: '10px' }}>
                  {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Current Company" value={form.current_company} onChange={e => set('current_company', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Current Role" value={form.current_role} onChange={e => set('current_role', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="College" value={form.college} onChange={e => set('college', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="LinkedIn URL" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Skills (comma separated)" value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="React, Node.js, Python..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" multiline rows={2} label="Bio" value={form.bio} onChange={e => set('bio', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><FormControlLabel control={<Switch checked={form.is_available} onChange={e => set('is_available', e.target.checked)} color="success" />} label="Available for mentorship" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ background: 'linear-gradient(135deg,#EC4899,#BE185D)', textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Add Alumni'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>Remove Alumni?</DialogTitle>
        <DialogContent><Alert severity="warning" sx={{ borderRadius: '10px' }}>Remove <strong>{confirmDelete?.full_name}</strong> from the alumni directory?</Alert></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => handleDelete(confirmDelete.id)} sx={{ bgcolor: '#EF4444', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>Remove</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '10px' }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
