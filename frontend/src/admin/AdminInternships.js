import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Alert, Snackbar,
  CircularProgress, Table, TableHead, TableRow, TableCell, TableBody,
  Switch, FormControlLabel, Stack, Tooltip, Tabs, Tab, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const EMPTY = {
  title:'', company:'', description:'', duration:'', stipend:'', skills_covered:[],
  mode:'remote', eligibility:'', last_date:'', start_date:'', seats:30,
  is_active:true, is_premium:false, has_certificate:true, has_training_cert:false,
  apply_link:'', logo_url:'', category:'technical'
};

const STATUS_COLORS = {
  pending:   { bg:'#FFFBEB', color:'#D97706' },
  approved:  { bg:'#F0FDF4', color:'#059669' },
  rejected:  { bg:'#FEF2F2', color:'#DC2626' },
  completed: { bg:'#EEF2FF', color:'#4F46E5' } };

export default function AdminInternships() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dialog, setDialog]     = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [snack, setSnack]       = useState({ open:false, msg:'', sev:'success' });
  const [viewApplicants, setViewApplicants] = useState(null);
  const [applicants, setApplicants]         = useState([]);
  const [loadingApps, setLoadingApps]       = useState(false);
  const [appTab, setAppTab]     = useState('all');
  const [skillsText, setSkillsText] = useState('');

  const show = (msg, sev='success') => setSnack({ open:true, msg, sev });

  const load = async () => {
    setLoading(true);
    try { const r = await adminApi.get('/internships'); setPrograms(r.data); }
    catch { show('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null); setForm(EMPTY); setSkillsText(''); setDialog(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ title:p.title, company:p.company, description:p.description||'', duration:p.duration||'', stipend:p.stipend||'', skills_covered:p.skills_covered||[], mode:p.mode||'remote', eligibility:p.eligibility||'', last_date:p.last_date?p.last_date.split('T')[0]:'', start_date:p.start_date?p.start_date.split('T')[0]:'', seats:p.seats||30, is_active:p.is_active!==false, is_premium:!!p.is_premium, has_certificate:p.has_certificate!==false, has_training_cert:!!p.has_training_cert, apply_link:p.apply_link||'', logo_url:p.logo_url||'', category:p.category||'technical' });
    setSkillsText((p.skills_covered||[]).join(', '));
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.company) { show('Title and company required', 'error'); return; }
    setSaving(true);
    const payload = { ...form, skills_covered: skillsText.split(',').map(s => s.trim()).filter(Boolean) };
    try {
      if (editing) { await adminApi.put(`/internships/${editing.id}`, payload); show('Updated'); }
      else { await adminApi.post('/internships', payload); show('Created'); }
      setDialog(false); load();
    } catch (e) { show(e.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await adminApi.delete(`/internships/${delConfirm.id}`); show('Deleted'); setDelConfirm(null); load(); }
    catch { show('Delete failed', 'error'); }
  };

  const loadApplicants = async (prog) => {
    setViewApplicants(prog); setLoadingApps(true);
    try { const r = await adminApi.get(`/internships/${prog.id}/applicants`); setApplicants(r.data); }
    catch { show('Failed to load applicants', 'error'); }
    finally { setLoadingApps(false); }
  };

  const updateApp = async (appId, updates) => {
    try {
      await adminApi.patch(`/internships/applications/${appId}`, updates);
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, ...updates } : a));
      show('Updated');
    } catch { show('Update failed', 'error'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filteredApps = appTab === 'all' ? applicants : applicants.filter(a => a.status === appTab);

  if (viewApplicants) {
    return (
      <AdminLayout>
        <Box mb={3}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => setViewApplicants(null)}
            sx={{ textTransform:'none', color:'#64748B', mb:2 }}>Back to Programs</Button>
          <Typography variant="h5" fontWeight={700}>{viewApplicants.title} — Applicants</Typography>
          <Typography variant="body2" color="text.secondary">{viewApplicants.company}</Typography>
        </Box>
        <Tabs value={appTab} onChange={(_, v) => setAppTab(v)} sx={{ mb:2 }}>
          {['all','pending','approved','rejected','completed'].map(s => (
            <Tab key={s} value={s} label={s.charAt(0).toUpperCase()+s.slice(1)} sx={{ textTransform:'none' }} />
          ))}
        </Tabs>
        {loadingApps ? <CircularProgress /> : (
          <Card elevation={0} sx={{ border:'1px solid #E2E8F0', borderRadius:3, overflow:'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor:'#F8FAFC' }}>
                  {['Student','Email','College','Semester','Applied','Status','Certs','Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.78rem', whiteSpace:'nowrap' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApps.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py:4, color:'#94A3B8' }}>No applicants</TableCell></TableRow>
                ) : filteredApps.map(a => {
                  const sc = STATUS_COLORS[a.status] || {};
                  return (
                    <TableRow key={a.id} hover>
                      <TableCell sx={{ fontWeight:600, fontSize:'0.82rem' }}>{a.username}</TableCell>
                      <TableCell sx={{ fontSize:'0.78rem' }}>{a.email}</TableCell>
                      <TableCell sx={{ fontSize:'0.78rem' }}>{a.college||'—'}</TableCell>
                      <TableCell sx={{ fontSize:'0.78rem' }}>{a.semester||'—'}</TableCell>
                      <TableCell sx={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{new Date(a.applied_at).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Select size="small" value={a.status}
                          onChange={e => updateApp(a.id, { status: e.target.value })}
                          sx={{ fontSize:'0.75rem', height:28, bgcolor: sc.bg||'white', color: sc.color, '.MuiOutlinedInput-notchedOutline':{ borderColor:'transparent' } }}>
                          {['pending','approved','rejected','completed'].map(s => (
                            <MenuItem key={s} value={s} sx={{ fontSize:'0.78rem' }}>{s}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Internship Cert">
                            <Switch size="small" checked={!!a.certificate_issued}
                              onChange={e => updateApp(a.id, { certificate_issued: e.target.checked })} />
                          </Tooltip>
                          <Tooltip title="Training Cert">
                            <Switch size="small" checked={!!a.training_cert_issued}
                              onChange={e => updateApp(a.id, { training_cert_issued: e.target.checked })} />
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <TextField size="small" placeholder="Note" defaultValue={a.admin_notes||''}
                          onBlur={e => e.target.value !== (a.admin_notes||'') && updateApp(a.id, { admin_notes: e.target.value })}
                          sx={{ width:120, '& .MuiInputBase-input':{ fontSize:'0.75rem', py:0.5 } }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s=>({...s,open:false}))}>
          <Alert severity={snack.sev} onClose={() => setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
        </Snackbar>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box mb={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700}>Internship Programs</Typography>
            <Typography variant="body2" color="text.secondary">{programs.length} programs total</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
            sx={{ borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#4F46E5' }}>
            Add Program
          </Button>
        </Stack>
      </Box>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {programs.map(p => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:2.5,
                opacity: p.is_active ? 1 : 0.65 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box flex={1}>
                    <Typography fontWeight={700} fontSize="0.95rem" lineHeight={1.3}>{p.title}</Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.82rem">{p.company}</Typography>
                  </Box>
                  <Stack direction="row">
                    <Tooltip title="View Applicants">
                      <IconButton size="small" onClick={() => loadApplicants(p)}>
                        <PeopleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDelConfirm(p)}><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={0.7} flexWrap="wrap" mb={1}>
                  <Chip label={p.category} size="small" sx={{ fontSize:'0.68rem', height:20 }} />
                  <Chip label={p.mode} size="small" sx={{ fontSize:'0.68rem', height:20 }} />
                  {!p.is_active && <Chip label="Inactive" size="small" color="error" sx={{ fontSize:'0.68rem', height:20 }} />}
                  {p.is_premium && <Chip label="Premium" size="small" color="warning" sx={{ fontSize:'0.68rem', height:20 }} />}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {p.duration} · {p.stipend} · {p.applicants_count||0} applicants / {p.seats} seats
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth maxWidth="md"
        PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={700}>{editing ? 'Edit Program' : 'Add Internship Program'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} pt={1}>
            <Grid item xs={12} sm={8}><TextField label="Title *" fullWidth size="small" value={form.title} onChange={e => set('title',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={form.category} onChange={e => set('category',e.target.value)} label="Category" sx={{ borderRadius:2 }}>
                  {['technical','general','management'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Company *" fullWidth size="small" value={form.company} onChange={e => set('company',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Duration (e.g. 6 weeks)" fullWidth size="small" value={form.duration} onChange={e => set('duration',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth size="small" multiline rows={3} value={form.description} onChange={e => set('description',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Stipend (e.g. ₹5000/month)" fullWidth size="small" value={form.stipend} onChange={e => set('stipend',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Mode</InputLabel>
                <Select value={form.mode} onChange={e => set('mode',e.target.value)} label="Mode" sx={{ borderRadius:2 }}>
                  {['remote','onsite','hybrid'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField label="Skills Covered (comma-separated)" fullWidth size="small" value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="React, Node.js, PostgreSQL" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12}><TextField label="Eligibility" fullWidth size="small" value={form.eligibility} onChange={e => set('eligibility',e.target.value)} placeholder="VTU students 4th sem and above" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={6} sm={4}><TextField label="Seats" type="number" fullWidth size="small" value={form.seats} onChange={e => set('seats',parseInt(e.target.value)||0)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={6} sm={4}><TextField label="Last Date" type="date" fullWidth size="small" InputLabelProps={{ shrink:true }} value={form.last_date} onChange={e => set('last_date',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={6} sm={4}><TextField label="Start Date" type="date" fullWidth size="small" InputLabelProps={{ shrink:true }} value={form.start_date} onChange={e => set('start_date',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12}><TextField label="Apply Link (optional)" fullWidth size="small" value={form.apply_link} onChange={e => set('apply_link',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel control={<Switch checked={form.is_active} onChange={e => set('is_active',e.target.checked)} />} label="Active" />
                <FormControlLabel control={<Switch checked={form.is_premium} onChange={e => set('is_premium',e.target.checked)} />} label="Premium Only" />
                <FormControlLabel control={<Switch checked={form.has_certificate} onChange={e => set('has_certificate',e.target.checked)} />} label="Internship Certificate" />
                <FormControlLabel control={<Switch checked={form.has_training_cert} onChange={e => set('has_training_cert',e.target.checked)} />} label="Training Certificate" />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform:'none', borderRadius:2, color:'#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#4F46E5' }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!delConfirm} onClose={() => setDelConfirm(null)} PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={700}>Delete Program?</DialogTitle>
        <DialogContent><Alert severity="error">This will also delete all applications. This cannot be undone.</Alert></DialogContent>
        <DialogActions sx={{ px:2.5, pb:2, gap:1 }}>
          <Button onClick={() => setDelConfirm(null)} sx={{ textTransform:'none', borderRadius:2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius:2, textTransform:'none', fontWeight:700 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.sev} onClose={() => setSnack(s=>({...s,open:false}))} sx={{ borderRadius:2 }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
