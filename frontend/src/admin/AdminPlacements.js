import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Alert, Snackbar, CircularProgress, Table, TableHead,
  TableRow, TableCell, TableBody, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const BRANCHES = ['CSE','ISE','ECE','ME','CV','EEE','AIML','DS'];
const STATUS_COLOR = { upcoming:'#4F46E5', open:'#10B981', closed:'#9CA3AF', completed:'#F59E0B' };
const EMPTY = {
  company_name:'', role:'', package_lpa:'', package_max_lpa:'', drive_date:'',
  registration_deadline:'', eligible_branches:[], min_cgpa:'6.0', eligible_backlogs:'0',
  description:'', apply_link:'', drive_type:'campus', status:'upcoming', location:''
};

export default function AdminPlacements() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [statusFilter, setStatusFilter] = useState('all');

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const load = async () => {
    setLoading(true);
    try { const res = await adminApi.get('/placements'); setDrives(res.data); }
    catch { showSnack('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setDialog(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({
      company_name: d.company_name, role: d.role, package_lpa: d.package_lpa || '',
      package_max_lpa: d.package_max_lpa || '', drive_date: d.drive_date ? d.drive_date.slice(0,10) : '',
      registration_deadline: d.registration_deadline ? d.registration_deadline.slice(0,10) : '',
      eligible_branches: d.eligible_branches || [], min_cgpa: d.min_cgpa || '6.0',
      eligible_backlogs: d.eligible_backlogs ?? '0', description: d.description || '',
      apply_link: d.apply_link || '', drive_type: d.drive_type || 'campus',
      status: d.status || 'upcoming', location: d.location || ''
    });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.company_name || !form.role) { showSnack('Company name and role required', 'error'); return; }
    setSaving(true);
    try {
      if (editing) { await adminApi.put(`/placements/${editing.drive_id}`, form); showSnack('Drive updated'); }
      else { await adminApi.post('/placements', form); showSnack('Drive created'); }
      setDialog(false); load();
    } catch (e) { showSnack(e.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await adminApi.delete(`/placements/${id}`); showSnack('Drive deleted'); setConfirmDelete(null); load(); }
    catch { showSnack('Failed', 'error'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleBranch = (b) => set('eligible_branches', form.eligible_branches.includes(b) ? form.eligible_branches.filter(x => x !== b) : [...form.eligible_branches, b]);
  const filtered = statusFilter === 'all' ? drives : drives.filter(d => d.status === statusFilter);

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="#111827">Placement Drives</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">{drives.length} drives · {drives.filter(d => d.status === 'open').length} open now</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}>
          Add Drive
        </Button>
      </Box>

      {/* Status filter */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {['all','upcoming','open','closed','completed'].map(s => (
          <Chip key={s} label={`${s.charAt(0).toUpperCase()+s.slice(1)} (${s==='all'?drives.length:drives.filter(d=>d.status===s).length})`}
            onClick={() => setStatusFilter(s)} clickable
            sx={{ bgcolor: statusFilter === s ? (STATUS_COLOR[s]||'#374151') : '#F1F5F9', color: statusFilter === s ? 'white' : '#374151', fontWeight: 700, fontSize: '0.75rem' }} />
        ))}
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['Company / Role', 'Package', 'Drive Date', 'Min CGPA', 'Branches', 'Applications', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={d.drive_id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{d.company_name}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{d.role}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#10B981' }}>
                        ₹{d.package_lpa}{d.package_max_lpa > d.package_lpa ? `–${d.package_max_lpa}` : ''} LPA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>
                        {d.drive_date ? new Date(d.drive_date).toLocaleDateString('en-IN') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>{d.min_cgpa}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, maxWidth: 140 }}>
                        {(d.eligible_branches || []).slice(0,3).map(b => (
                          <Chip key={b} label={b} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontSize: '0.6rem', height: 18, fontWeight: 700 }} />
                        ))}
                        {(d.eligible_branches||[]).length > 3 && <Chip label={`+${d.eligible_branches.length-3}`} size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontSize: '0.6rem', height: 18 }} />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>{d.application_count || 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={d.status} size="small" sx={{ bgcolor: (STATUS_COLOR[d.status]||'#9CA3AF')+'18', color: STATUS_COLOR[d.status]||'#9CA3AF', fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(d)} sx={{ color: '#F59E0B' }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setConfirmDelete(d)} sx={{ color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}><Typography>No drives found</Typography></Box>}
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>{editing ? 'Edit Drive' : 'Add Placement Drive'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}><TextField fullWidth size="small" label="Company Name *" value={form.company_name} onChange={e => set('company_name', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Role / Position *" value={form.role} onChange={e => set('role', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" type="number" label="Min Package (LPA)" value={form.package_lpa} onChange={e => set('package_lpa', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" type="number" label="Max Package (LPA)" value={form.package_max_lpa} onChange={e => set('package_max_lpa', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" type="number" label="Min CGPA" value={form.min_cgpa} onChange={e => set('min_cgpa', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" type="date" label="Drive Date" value={form.drive_date} onChange={e => set('drive_date', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" type="date" label="Registration Deadline" value={form.registration_deadline} onChange={e => set('registration_deadline', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small"><InputLabel>Drive Type</InputLabel>
                <Select value={form.drive_type} onChange={e => set('drive_type', e.target.value)} label="Drive Type" sx={{ borderRadius: '10px' }}>
                  <MenuItem value="campus">Campus</MenuItem>
                  <MenuItem value="off_campus">Off Campus</MenuItem>
                  <MenuItem value="hackathon">Hackathon</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small"><InputLabel>Status</InputLabel>
                <Select value={form.status} onChange={e => set('status', e.target.value)} label="Status" sx={{ borderRadius: '10px' }}>
                  {['upcoming','open','closed','completed'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}><TextField fullWidth size="small" type="number" label="Max Backlogs Allowed" value={form.eligible_backlogs} onChange={e => set('eligible_backlogs', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', mb: 0.75 }}>Eligible Branches</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {BRANCHES.map(b => (
                  <Chip key={b} label={b} onClick={() => toggleBranch(b)} clickable size="small"
                    sx={{ bgcolor: form.eligible_branches.includes(b) ? '#4F46E5' : '#F1F5F9', color: form.eligible_branches.includes(b) ? 'white' : '#374151', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }} />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Location" value={form.location} onChange={e => set('location', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Apply Link" value={form.apply_link} onChange={e => set('apply_link', e.target.value)} placeholder="https://..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" multiline rows={3} label="Description" value={form.description} onChange={e => set('description', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Create Drive'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>Delete Drive?</DialogTitle>
        <DialogContent><Alert severity="error" sx={{ borderRadius: '10px' }}>Delete <strong>{confirmDelete?.company_name} — {confirmDelete?.role}</strong>? Applications will also be removed.</Alert></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => handleDelete(confirmDelete.drive_id)} sx={{ bgcolor: '#EF4444', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '10px' }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
