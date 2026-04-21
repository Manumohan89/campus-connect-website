import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Alert, Snackbar,
  CircularProgress, Table, TableHead, TableRow, TableCell, TableBody,
  Switch, FormControlLabel, Stack, Select, MenuItem, FormControl,
  InputLabel, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const EMPTY_PROJ = {
  title:'', description:'', tech_stack:[], category:'Web App', level:'intermediate',
  price_paise:0, preview_url:'', download_url:'', thumbnail_url:'', tags:[], is_active:true
};

const CUSTOM_STATUS_OPTS = ['pending','reviewing','quoted','payment_pending','in_progress','delivered','cancelled'];
const CUSTOM_STATUS_COLORS = {
  pending:         '#6366F1', reviewing: '#F59E0B', quoted:'#0EA5E9',
  payment_pending: '#7C3AED', in_progress:'#10B981', delivered:'#059669', cancelled:'#94A3B8'
};

export default function AdminProjects() {
  const [tab, setTab]           = useState('listings');
  const [projects, setProjects] = useState([]);
  const [customs, setCustoms]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dialog, setDialog]     = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_PROJ);
  const [techText, setTechText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving]     = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [customDialog, setCustomDialog] = useState(null);
  const [customForm, setCustomForm] = useState({ status:'', admin_notes:'', final_price_paise:'', delivery_url:'' });
  const [snack, setSnack]       = useState({ open:false, msg:'', sev:'success' });

  const show = (msg, sev='success') => setSnack({ open:true, msg, sev });

  const load = async () => {
    setLoading(true);
    try {
      const [pr, cu] = await Promise.all([adminApi.get('/projects'), adminApi.get('/custom-projects')]);
      setProjects(pr.data);
      setCustoms(cu.data);
    } catch { show('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => { setEditing(null); setForm(EMPTY_PROJ); setTechText(''); setTagsText(''); setDialog(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ title:p.title, description:p.description||'', tech_stack:p.tech_stack||[], category:p.category||'Web App', level:p.level||'intermediate', price_paise:p.price_paise||0, preview_url:p.preview_url||'', download_url:p.download_url||'', thumbnail_url:p.thumbnail_url||'', tags:p.tags||[], is_active:p.is_active!==false });
    setTechText((p.tech_stack||[]).join(', '));
    setTagsText((p.tags||[]).join(', '));
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.title) { show('Title required', 'error'); return; }
    setSaving(true);
    const payload = { ...form, tech_stack: techText.split(',').map(s=>s.trim()).filter(Boolean), tags: tagsText.split(',').map(s=>s.trim()).filter(Boolean) };
    try {
      if (editing) { await adminApi.put(`/projects/${editing.id}`, payload); show('Updated'); }
      else { await adminApi.post('/projects', payload); show('Created'); }
      setDialog(false); load();
    } catch (e) { show(e.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await adminApi.delete(`/projects/${delConfirm.id}`); show('Deleted'); setDelConfirm(null); load(); }
    catch { show('Delete failed', 'error'); }
  };

  const openCustomEdit = (r) => {
    setCustomDialog(r);
    setCustomForm({ status: r.status, admin_notes: r.admin_notes||'', final_price_paise: r.final_price_paise ? r.final_price_paise/100 : '', delivery_url: r.delivery_url||'' });
  };

  const handleCustomUpdate = async () => {
    try {
      await adminApi.patch(`/custom-projects/${customDialog.id}`, {
        ...customForm,
        final_price_paise: customForm.final_price_paise ? parseInt(customForm.final_price_paise)*100 : null });
      show('Updated'); setCustomDialog(null); load();
    } catch { show('Update failed', 'error'); }
  };

  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

  return (
    <AdminLayout>
      <Box mb={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700}>Project Management</Typography>
            <Typography variant="body2" color="text.secondary">{projects.length} listings · {customs.length} custom requests</Typography>
          </Box>
          {tab === 'listings' && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
              sx={{ borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#4F46E5' }}>
              Add Project
            </Button>
          )}
        </Stack>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb:3, '& .MuiTabs-indicator':{ bgcolor:'#4F46E5' } }}>
        <Tab value="listings" label={`Project Listings (${projects.length})`} sx={{ textTransform:'none', fontWeight:600 }} />
        <Tab value="custom" label={`Custom Requests (${customs.length})`} sx={{ textTransform:'none', fontWeight:600 }} />
      </Tabs>

      {loading ? <CircularProgress /> : (
        <>
          {tab === 'listings' && (
            <Card elevation={0} sx={{ border:'1px solid #E2E8F0', borderRadius:3, overflow:'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor:'#F8FAFC' }}>
                    {['Title','Category','Level','Price','Downloads','Active','Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.78rem', whiteSpace:'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py:4, color:'#94A3B8' }}>No projects yet</TableCell></TableRow>
                  ) : projects.map(p => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontWeight:600, fontSize:'0.82rem', maxWidth:200 }}>
                        <Typography noWrap fontSize="0.82rem" fontWeight={600}>{p.title}</Typography>
                        <Typography noWrap fontSize="0.72rem" color="text.secondary">{(p.tech_stack||[]).join(', ')}</Typography>
                      </TableCell>
                      <TableCell><Chip label={p.category} size="small" sx={{ fontSize:'0.68rem', height:20 }} /></TableCell>
                      <TableCell>
                        <Chip label={p.level} size="small" sx={{ fontSize:'0.68rem', height:20,
                          bgcolor: p.level==='beginner'?'#F0FDF4':p.level==='advanced'?'#FEF2F2':'#FFFBEB',
                          color: p.level==='beginner'?'#059669':p.level==='advanced'?'#EF4444':'#D97706' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight:700, fontSize:'0.82rem', color:'#4F46E5' }}>
                        {p.price_paise ? `₹${(p.price_paise/100).toLocaleString('en-IN')}` : 'FREE'}
                      </TableCell>
                      <TableCell sx={{ fontSize:'0.82rem' }}>{p.purchase_count||0}</TableCell>
                      <TableCell>
                        <Chip label={p.is_active ? 'Active' : 'Hidden'} size="small"
                          sx={{ bgcolor: p.is_active?'#F0FDF4':'#F1F5F9', color:p.is_active?'#059669':'#94A3B8', fontSize:'0.68rem', height:20 }} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setDelConfirm(p)}><DeleteIcon fontSize="small" /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {tab === 'custom' && (
            <Stack spacing={2}>
              {customs.length === 0 ? (
                <Box textAlign="center" py={6}><Typography color="text.secondary">No custom requests</Typography></Box>
              ) : customs.map(r => (
                <Card key={r.id} elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:2.5 }}>
                  <Stack direction={{ xs:'column', sm:'row' }} justifyContent="space-between" alignItems={{ sm:'center' }} mb={1.5} spacing={1}>
                    <Box>
                      <Typography fontWeight={700}>{r.title}</Typography>
                      <Typography variant="body2" color="text.secondary" fontSize="0.82rem">{r.username} · {r.email}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={r.status} size="small"
                        sx={{ bgcolor: (CUSTOM_STATUS_COLORS[r.status]||'#94A3B8')+'20', color: CUSTOM_STATUS_COLORS[r.status]||'#94A3B8', fontWeight:600 }} />
                      <Button size="small" variant="outlined" onClick={() => openCustomEdit(r)}
                        sx={{ borderRadius:2, textTransform:'none', borderColor:'#E2E8F0', color:'#64748B' }}>
                        Update
                      </Button>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" fontSize="0.82rem" mb={1}>{r.description}</Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {r.tech_preferences && <Typography variant="caption" color="text.secondary">Tech: {r.tech_preferences}</Typography>}
                    {r.deadline && <Typography variant="caption" color="text.secondary">Deadline: {new Date(r.deadline).toLocaleDateString('en-IN')}</Typography>}
                    {r.budget_paise && <Typography variant="caption" color="text.secondary">Budget: ₹{(r.budget_paise/100).toLocaleString('en-IN')}</Typography>}
                    {r.final_price_paise && <Typography variant="caption" fontWeight={700} color="#4F46E5">Quoted: ₹{(r.final_price_paise/100).toLocaleString('en-IN')}</Typography>}
                    <Typography variant="caption" color="text.secondary">Submitted: {new Date(r.submitted_at).toLocaleDateString('en-IN')}</Typography>
                  </Stack>
                  {r.admin_notes && <Alert severity="info" sx={{ mt:1, fontSize:'0.78rem', py:0.5 }}>{r.admin_notes}</Alert>}
                </Card>
              ))}
            </Stack>
          )}
        </>
      )}

      {/* Add/Edit Project Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth maxWidth="md" PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={700}>{editing ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} pt={1}>
            <Grid item xs={12} sm={8}><TextField label="Title *" fullWidth size="small" value={form.title} onChange={e => setF('title',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={form.category} onChange={e => setF('category',e.target.value)} label="Category" sx={{ borderRadius:2 }}>
                  {['Web App','Machine Learning','Android','IoT','Desktop','Data Science','Blockchain','Other'].map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth size="small" multiline rows={3} value={form.description} onChange={e => setF('description',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Tech Stack (comma-separated)" fullWidth size="small" value={techText} onChange={e => setTechText(e.target.value)} placeholder="React, Node.js, MongoDB" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Tags (comma-separated)" fullWidth size="small" value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="CRUD, Admin Panel, Auth" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={6} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Level</InputLabel>
                <Select value={form.level} onChange={e => setF('level',e.target.value)} label="Level" sx={{ borderRadius:2 }}>
                  {['beginner','intermediate','advanced'].map(l=><MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4}><TextField label="Price (₹)" type="number" fullWidth size="small" value={form.price_paise/100||0} onChange={e => setF('price_paise', parseFloat(e.target.value)*100||0)} helperText="0 = Free" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={4}><FormControlLabel control={<Switch checked={form.is_active} onChange={e => setF('is_active',e.target.checked)} />} label="Active" /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Preview URL" fullWidth size="small" value={form.preview_url} onChange={e => setF('preview_url',e.target.value)} placeholder="Demo link or screenshot" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Download URL" fullWidth size="small" value={form.download_url} onChange={e => setF('download_url',e.target.value)} placeholder="GitHub or Drive link" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} /></Grid>
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
        <DialogTitle fontWeight={700}>Delete Project?</DialogTitle>
        <DialogContent><Alert severity="error">This will remove the project and all purchase records.</Alert></DialogContent>
        <DialogActions sx={{ px:2.5, pb:2, gap:1 }}>
          <Button onClick={() => setDelConfirm(null)} sx={{ textTransform:'none', borderRadius:2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius:2, textTransform:'none', fontWeight:700 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Custom Request Update Dialog */}
      <Dialog open={!!customDialog} onClose={() => setCustomDialog(null)} fullWidth maxWidth="sm" PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={700}>Update Custom Request</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={customForm.status} onChange={e => setCustomForm(f=>({...f, status:e.target.value}))} label="Status" sx={{ borderRadius:2 }}>
                {CUSTOM_STATUS_OPTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Final Price (₹)" type="number" fullWidth size="small"
              value={customForm.final_price_paise} onChange={e => setCustomForm(f=>({...f, final_price_paise:e.target.value}))}
              placeholder="Set price for student to pay" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
            <TextField label="Admin Notes (visible to student)" fullWidth size="small" multiline rows={3}
              value={customForm.admin_notes} onChange={e => setCustomForm(f=>({...f, admin_notes:e.target.value}))}
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
            <TextField label="Delivery URL (after delivery)" fullWidth size="small"
              value={customForm.delivery_url} onChange={e => setCustomForm(f=>({...f, delivery_url:e.target.value}))}
              placeholder="GitHub/Drive link for delivered project"
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={() => setCustomDialog(null)} sx={{ textTransform:'none', borderRadius:2, color:'#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCustomUpdate}
            sx={{ borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#4F46E5' }}>Update</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.sev} onClose={() => setSnack(s=>({...s,open:false}))} sx={{ borderRadius:2 }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
