import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Card, Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Alert, Snackbar, CircularProgress, Table, TableHead,
  TableRow, TableCell, TableBody, Tooltip, Tabs, Tab, InputAdornment,
  LinearProgress
} from '@mui/material';
import AddIcon        from '@mui/icons-material/Add';
import EditIcon       from '@mui/icons-material/Edit';
import DeleteIcon     from '@mui/icons-material/Delete';
import DownloadIcon   from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon     from '@mui/icons-material/Search';
import LinkIcon       from '@mui/icons-material/Link';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const DEPTS   = ['ALL','CSE','ISE','ECE','ME','CV','EEE','AIML','DS','CH','BT'];
const SCHEMES = ['2021','2022','2018','2015','2017'];
const TYPES   = ['notes','question_paper','syllabus','video_lecture'];
const TYPE_LABELS = { notes:'Notes', question_paper:'Question Papers', syllabus:'Syllabus', video_lecture:'Video Lectures' };
const SEMS    = [1,2,3,4,5,6,7,8];

const EMPTY = {
  title:'', resource_type:'notes', subject_code:'', subject_name:'',
  department:'CSE', semester:'3', year_scheme:'2021', file_url:'', source:'Admin'
};

export default function AdminResources() {
  const [resources, setResources]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [dialog, setDialog]             = useState(false);
  const [uploadDialog, setUploadDialog] = useState(null); // resource being file-uploaded
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(EMPTY);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snack, setSnack]               = useState({ open:false, msg:'', severity:'success' });
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [deptFilter, setDeptFilter]     = useState('all');
  const fileInputRef                    = useRef(null);

  const showSnack = (msg, severity='success') => setSnack({ open:true, msg, severity });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const load = async () => {
    setLoading(true);
    try { const r = await adminApi.get('/resources'); setResources(r.data); }
    catch (e) { showSnack('Failed to load resources', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setDialog(true); };
  const openEdit = r => {
    setEditing(r);
    setForm({ title:r.title, resource_type:r.resource_type, subject_code:r.subject_code||'', subject_name:r.subject_name, department:r.department, semester:String(r.semester), year_scheme:r.year_scheme, file_url:r.file_url, source:r.source||'Admin' });
    setDialog(true);
  };

  const save = async () => {
    if (!form.title||!form.subject_name||!form.department||!form.semester||!form.year_scheme)
      return showSnack('Fill all required fields', 'error');
    if (!form.file_url && !editing) return showSnack('Provide a URL or upload a file after saving', 'warning');
    setSaving(true);
    try {
      if (editing) await adminApi.put(`/resources/${editing.resource_id}`, form);
      else await adminApi.post('/resources', form);
      showSnack(editing ? 'Resource updated!' : 'Resource added!');
      setDialog(false); load();
    } catch (e) { showSnack(e.response?.data?.error || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const deleteResource = async () => {
    try { await adminApi.delete(`/resources/${confirmDelete.resource_id}`); showSnack('Deleted'); load(); }
    catch { showSnack('Delete failed', 'error'); }
    setConfirmDelete(null);
  };

  const handleFileUpload = async (e, resourceId) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return showSnack('File must be under 50MB', 'error');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await adminApi.post(`/resources/${resourceId}/upload`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      showSnack(`File uploaded! URL: ${res.data.file_url}`);
      setUploadDialog(null);
      load();
    } catch (e) { showSnack(e.response?.data?.error || 'Upload failed', 'error'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value=''; }
  };

  // Filter resources
  let display = resources;
  if (search) display = display.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || (r.subject_code||'').toLowerCase().includes(search.toLowerCase()) || r.department.toLowerCase().includes(search.toLowerCase()));
  if (typeFilter !== 'all') display = display.filter(r => r.resource_type === typeFilter);
  if (deptFilter !== 'all') display = display.filter(r => r.department === deptFilter);

  const typeChipColor = { notes:'#4F46E5', question_paper:'#DC2626', syllabus:'#059669', video_lecture:'#D97706' };

  return (
    <AdminLayout>
      <Box sx={{ p:3 }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">VTU Resources</Typography>
            <Typography color="text.secondary" fontSize="0.875rem">{resources.length} total resources · {display.length} shown</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
            sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
            Add Resource
          </Button>
        </Box>

        {/* Filters */}
        <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'14px', p:2, mb:3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" placeholder="Search title, subject code..." value={search} onChange={e=>setSearch(e.target.value)}
                InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ color:'#9CA3AF', fontSize:18 }}/></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} label="Type" sx={{ borderRadius:'10px' }}>
                  <MenuItem value="all">All Types</MenuItem>
                  {TYPES.map(t => <MenuItem key={t} value={t}>{TYPE_LABELS[t]}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} label="Department" sx={{ borderRadius:'10px' }}>
                  <MenuItem value="all">All Depts</MenuItem>
                  {DEPTS.filter(d=>d!=='ALL').map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth onClick={()=>{setSearch('');setTypeFilter('all');setDeptFilter('all');}} sx={{ textTransform:'none', borderRadius:'10px' }}>Clear</Button>
            </Grid>
          </Grid>
        </Card>

        {/* Stats chips */}
        <Box sx={{ display:'flex', gap:1, mb:3, flexWrap:'wrap' }}>
          {TYPES.map(t => {
            const count = resources.filter(r=>r.resource_type===t).length;
            return count > 0 ? (
              <Chip key={t} label={`${TYPE_LABELS[t]}: ${count}`} size="small" clickable onClick={()=>setTypeFilter(t)}
                sx={{ bgcolor:`${typeChipColor[t]}15`, color:typeChipColor[t], fontWeight:700, border:`1px solid ${typeChipColor[t]}33` }} />
            ) : null;
          })}
        </Box>

        {/* Table */}
        <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden' }}>
          {loading ? (
            <Box sx={{ p:4, textAlign:'center' }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ overflowX:'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                    {['Title','Type','Dept','Sem','Scheme','Source','Downloads','Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.72rem', color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #E5E7EB', py:1.5, whiteSpace:'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {display.map(r => (
                    <TableRow key={r.resource_id} sx={{ '&:hover':{ bgcolor:'#F9FAFB' } }}>
                      <TableCell sx={{ maxWidth:240 }}>
                        <Typography sx={{ fontSize:'0.82rem', fontWeight:700, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</Typography>
                        {r.subject_code && <Typography variant="caption" sx={{ color:'#4F46E5', fontFamily:'monospace', fontWeight:700 }}>{r.subject_code}</Typography>}
                      </TableCell>
                      <TableCell>
                        <Chip label={TYPE_LABELS[r.resource_type]||r.resource_type} size="small"
                          sx={{ bgcolor:`${typeChipColor[r.resource_type]}15`, color:typeChipColor[r.resource_type]||'#374151', fontWeight:700, fontSize:'0.68rem' }} />
                      </TableCell>
                      <TableCell><Typography sx={{ fontSize:'0.8rem', fontWeight:700 }}>{r.department}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize:'0.8rem' }}>Sem {r.semester}</Typography></TableCell>
                      <TableCell><Chip label={r.year_scheme} size="small" sx={{ bgcolor:'#F1F5F9', fontSize:'0.68rem' }} /></TableCell>
                      <TableCell><Typography sx={{ fontSize:'0.75rem', color:'#6B7280' }}>{r.source}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize:'0.8rem', fontWeight:700, color:'#4F46E5' }}>{r.download_count||0}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display:'flex', gap:0.5 }}>
                          <Tooltip title="Preview/Download">
                            <IconButton size="small" href={r.file_url} target="_blank" sx={{ color:'#059669' }} disabled={!r.file_url}>
                              <DownloadIcon sx={{ fontSize:16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Upload file to replace URL">
                            <IconButton size="small" onClick={() => setUploadDialog(r)} sx={{ color:'#7C3AED' }}>
                              <UploadFileIcon sx={{ fontSize:16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(r)} sx={{ color:'#4F46E5' }}>
                              <EditIcon sx={{ fontSize:16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => setConfirmDelete(r)} sx={{ color:'#EF4444' }}>
                              <DeleteIcon sx={{ fontSize:16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {display.length === 0 && (
                    <TableRow><TableCell colSpan={8} sx={{ textAlign:'center', py:6, color:'#9CA3AF' }}>No resources found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:'16px' } }}>
          <DialogTitle fontWeight={800}>{editing ? 'Edit Resource' : 'Add VTU Resource'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt:0.5 }}>
              <Grid item xs={12}><TextField fullWidth size="small" label="Title *" value={form.title} onChange={e=>set('title',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type *</InputLabel>
                  <Select value={form.resource_type} onChange={e=>set('resource_type',e.target.value)} label="Type *" sx={{ borderRadius:'10px' }}>
                    {TYPES.map(t => <MenuItem key={t} value={t}>{TYPE_LABELS[t]}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="Subject Code" value={form.subject_code} onChange={e=>set('subject_code',e.target.value)} placeholder="e.g. 21CS32" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
              <Grid item xs={12}><TextField fullWidth size="small" label="Subject Name *" value={form.subject_name} onChange={e=>set('subject_name',e.target.value)} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department *</InputLabel>
                  <Select value={form.department} onChange={e=>set('department',e.target.value)} label="Department *" sx={{ borderRadius:'10px' }}>
                    {DEPTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semester *</InputLabel>
                  <Select value={form.semester} onChange={e=>set('semester',String(e.target.value))} label="Semester *" sx={{ borderRadius:'10px' }}>
                    {SEMS.map(s => <MenuItem key={s} value={String(s)}>Sem {s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Scheme *</InputLabel>
                  <Select value={form.year_scheme} onChange={e=>set('year_scheme',e.target.value)} label="Scheme *" sx={{ borderRadius:'10px' }}>
                    {SCHEMES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="External URL" value={form.file_url} onChange={e=>set('file_url',e.target.value)}
                  placeholder="https://vtu.ac.in/... or leave blank to upload file after saving"
                  InputProps={{ startAdornment:<InputAdornment position="start"><LinkIcon sx={{ color:'#9CA3AF', fontSize:18 }}/></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
                <Typography variant="caption" color="text.secondary">Provide a URL from VTU Pulse, VTU PDFs etc. OR leave blank and upload a file after saving.</Typography>
              </Grid>
              <Grid item xs={12}><TextField fullWidth size="small" label="Source" value={form.source} onChange={e=>set('source',e.target.value)} placeholder="VTU Official / VTU Pulse / Admin" sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
            <Button onClick={() => setDialog(false)} sx={{ textTransform:'none', borderRadius:'10px' }}>Cancel</Button>
            <Button onClick={save} disabled={saving} variant="contained"
              sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
              {saving ? <CircularProgress size={18} sx={{ color:'white' }}/> : (editing ? 'Update' : 'Add Resource')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* File Upload Dialog */}
        <Dialog open={!!uploadDialog} onClose={() => setUploadDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx:{ borderRadius:'16px' } }}>
          <DialogTitle fontWeight={800}>Upload File</DialogTitle>
          <DialogContent>
            {uploadDialog && (
              <>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Upload a PDF or document for: <strong>{uploadDialog.title}</strong><br/>
                  This will replace the current URL with an uploaded file on our server.
                </Typography>
                <Alert severity="info" sx={{ mb:2, borderRadius:'10px', fontSize:'0.8rem' }}>
                  Accepted: PDF, DOC, PPT, images · Max 50MB
                </Alert>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
                  onChange={e => handleFileUpload(e, uploadDialog.resource_id)}
                  style={{ display:'none' }} />
                <Button fullWidth variant="contained" startIcon={uploading ? null : <UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  sx={{ background:'linear-gradient(135deg,#7C3AED,#4F46E5)', textTransform:'none', fontWeight:700, borderRadius:'12px', boxShadow:'none', py:1.5 }}>
                  {uploading ? <><CircularProgress size={18} sx={{ color:'white', mr:1 }}/> Uploading...</> : 'Select & Upload File'}
                </Button>
                {uploading && <LinearProgress sx={{ mt:1.5, borderRadius:99 }} />}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2.5 }}>
            <Button onClick={() => setUploadDialog(null)} sx={{ textTransform:'none' }}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} PaperProps={{ sx:{ borderRadius:'14px' } }}>
          <DialogTitle fontWeight={800}>Delete Resource?</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ borderRadius:'10px' }}>
              Delete <strong>"{confirmDelete?.title}"</strong>? This cannot be undone.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
            <Button onClick={() => setConfirmDelete(null)} sx={{ textTransform:'none', borderRadius:'10px' }}>Cancel</Button>
            <Button onClick={deleteResource} variant="contained" sx={{ bgcolor:'#EF4444', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none', '&:hover':{ bgcolor:'#DC2626' } }}>Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({...s,open:false}))}
          anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
          <Alert onClose={() => setSnack(s=>({...s,open:false}))} severity={snack.severity} sx={{ borderRadius:'12px' }}>{snack.msg}</Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
}
