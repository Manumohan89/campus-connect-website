import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, Alert, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, Rating, Snackbar, Paper, LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const DEPTS = ['CSE', 'ISE', 'ECE', 'ME', 'CV', 'EEE', 'AIML', 'DS', 'CH', 'BT'];
const SCHEMES = ['2021', '2018', '2015'];
const SEMS = [1, 2, 3, 4, 5, 6, 7, 8];

const TYPE_CFG = {
  notes: { bg: '#EEF2FF', color: '#4F46E5', icon: <MenuBookIcon fontSize="small" /> },
  pyq: { bg: '#FEF9C3', color: '#92400E', icon: <QuizIcon fontSize="small" /> },
  assignment: { bg: '#D1FAE5', color: '#065F46', icon: <AssignmentIcon fontSize="small" /> },
  other: { bg: '#F1F5F9', color: '#64748B', icon: <MenuBookIcon fontSize="small" /> },
};

const TYPES = [
  { value: 'all',        label: 'All',        icon: '📚' },
  { value: 'notes',      label: 'Notes',      icon: '📝' },
  { value: 'pyq',        label: 'Q Papers',   icon: '📄' },
  { value: 'assignment', label: 'Assignment', icon: '✏️' },
  { value: 'other',      label: 'Other',      icon: '📎' },
];

function ResourceCard({ r, onDownload, onRate }) {
  const cfg = TYPE_CFG[r.resource_type] || TYPE_CFG.other;
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  const handleRate = async (val) => {
    setRating(val);
    setRated(true);
    onRate(r.id, val);
  };

  return (
    <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 25px rgba(79,70,229,0.12)' } }}>
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip icon={cfg.icon} label={TYPES.find(t => t.value === r.resource_type)?.label || r.resource_type}
            size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.65rem' }} />
          {r.semester && <Chip label={`Sem ${r.semester}`} size="small" sx={{ fontSize: '0.65rem' }} />}
          {r.year_scheme && <Chip label={r.year_scheme} size="small" sx={{ fontSize: '0.65rem' }} />}
          {r.department && <Chip label={r.department} size="small" sx={{ fontSize: '0.65rem' }} />}
        </Box>

        <Typography fontWeight={700} fontFamily="'Space Grotesk', sans-serif" mb={0.5} fontSize="0.9rem">{r.title}</Typography>
        {r.subject_name && <Typography variant="body2" color="text.secondary" mb={0.5}>{r.subject_name}</Typography>}
        {r.subject_code && <Chip label={r.subject_code} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.65rem', mb: 1 }} />}
        {r.description && <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>{r.description}</Typography>}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
            <Typography fontWeight={700} fontSize="0.8rem">{parseFloat(r.rating_avg || 0).toFixed(1)}</Typography>
            <Typography variant="caption" color="text.secondary">({r.rating_count})</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">{r.download_count} downloads</Typography>
        </Box>

        {r.uploader_name && (
          <Typography variant="caption" color="text.secondary">Uploaded by {r.uploader_name}</Typography>
        )}
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 0, flexDirection: 'column', gap: 1, alignItems: 'stretch' }}>
        {!rated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">Rate:</Typography>
            <Rating size="small" value={rating} onChange={(_, v) => handleRate(v)} />
          </Box>
        ) : (
          <Typography variant="caption" color="#10B981" fontWeight={600}>✓ Rated {rating}/5</Typography>
        )}
        <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={() => onDownload(r)}
          sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', fontWeight: 600, borderRadius: 2, textTransform: 'none', boxShadow: 'none', fontSize: '0.8rem' }}>
          Download
        </Button>
      </CardActions>
    </Card>
  );
}

function CommunityNotes() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [scheme, setScheme] = useState('');
  const [sem, setSem] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', resource_type: 'notes', subject_code: '', subject_name: '', department: '', semester: '', year_scheme: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snack, setSnack] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dept) params.department = dept;
      if (scheme) params.year_scheme = scheme;
      if (sem) params.semester = sem;
      if (tab !== 'all') params.resource_type = tab;
      if (search) params.search = search;
      const res = await api.get('/features/community', { params });
      setResources(res.data);
    } catch { setError('Failed to load resources.'); }
    finally { setLoading(false); }
  };
   // eslint-disable-next-line react-hooks/exhaustive-deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, [dept, scheme, sem, tab]);

  const handleDownload = async (r) => {
    await api.post(`/features/community/${r.id}/download`).catch(() => {});
    window.open(r.file_url, '_blank');
    setSnack('Download started!');
  };

  const handleRate = async (id, rating) => {
    await api.post(`/features/community/${id}/rate`, { rating }).catch(() => {});
    setSnack('Rating submitted!');
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadForm.title) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', uploadFile);
    Object.entries(uploadForm).forEach(([k, v]) => fd.append(k, v));
    try {
      await api.post('/features/community', fd);
      setSnack('Resource uploaded! 🎉');
      setUploadDialog(false);
      setUploadFile(null);
      setUploadForm({ title: '', description: '', resource_type: 'notes', subject_code: '', subject_name: '', department: '', semester: '', year_scheme: '' });
      fetch();
    } catch { setSnack('Upload failed. Try again.'); }
    finally { setUploading(false); }
  };

  const filtered = resources.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.title.toLowerCase().includes(s) || (r.subject_name || '').toLowerCase().includes(s) || (r.subject_code || '').toLowerCase().includes(s);
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
      <Header />

      <Box sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', py: 5, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="white" mb={1}>
                📚 Community Notes & PYQs
              </Typography>
              <Typography color="rgba(255,255,255,0.85)" fontSize="1.05rem">
                Student-uploaded notes, PYQs & assignments — rate and download scheme-wise
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setUploadDialog(true)}
              sx={{ bgcolor: 'white', color: '#7C3AED', fontWeight: 700, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#F5F3FF' } }}>
              Upload Resource
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Filters */}
        <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" placeholder="Search title, subject, code..." value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetch()}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            {[
              { label: 'Department', val: dept, set: setDept, items: DEPTS },
              { label: 'Scheme', val: scheme, set: setScheme, items: SCHEMES },
            ].map(f => (
              <Grid item xs={6} md={2} key={f.label}>
                <FormControl fullWidth size="small">
                  <InputLabel>{f.label}</InputLabel>
                  <Select value={f.val} onChange={e => f.set(e.target.value)} label={f.label} sx={{ borderRadius: 2 }}>
                    <MenuItem value="">All</MenuItem>
                    {f.items.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select value={sem} onChange={e => setSem(e.target.value)} label="Semester" sx={{ borderRadius: 2 }}>
                  <MenuItem value="">All</MenuItem>
                  {SEMS.map(s => <MenuItem key={s} value={s}>Sem {s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button fullWidth variant="outlined" onClick={() => { setDept(''); setScheme(''); setSem(''); setSearch(''); }}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#E2E8F0' }}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, '& .Mui-selected': { color: '#7C3AED' }, '& .MuiTabs-indicator': { bgcolor: '#7C3AED' }, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
          {TYPES.map(t => <Tab key={t.value} value={t.value} label={`${t.icon} ${t.label}`} />)}
        </Tabs>

        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography fontSize="3rem">📭</Typography>
            <Typography variant="h6" fontWeight={600} mt={2}>No resources found</Typography>
            <Typography color="text.secondary" mt={1} mb={3}>Be the first to upload for this filter!</Typography>
            <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setUploadDialog(true)}
              sx={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', textTransform: 'none', borderRadius: 2, boxShadow: 'none', fontWeight: 700 }}>
              Upload Resource
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map(r => (
              <Grid item xs={12} sm={6} md={4} key={r.id}>
                <ResourceCard r={r} onDownload={handleDownload} onRate={handleRate} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontFamily="'Space Grotesk', sans-serif">Upload Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Title *" value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type *</InputLabel>
                <Select value={uploadForm.resource_type} onChange={e => setUploadForm(f => ({ ...f, resource_type: e.target.value }))} label="Type *">
                  {TYPES.filter(t => t.value !== 'all').map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={uploadForm.department} onChange={e => setUploadForm(f => ({ ...f, department: e.target.value }))} label="Department">
                  <MenuItem value="">—</MenuItem>
                  {DEPTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth size="small" label="Subject Code" value={uploadForm.subject_code} onChange={e => setUploadForm(f => ({ ...f, subject_code: e.target.value }))} placeholder="e.g. 21CS32" />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select value={uploadForm.semester} onChange={e => setUploadForm(f => ({ ...f, semester: e.target.value }))} label="Semester">
                  <MenuItem value="">—</MenuItem>
                  {SEMS.map(s => <MenuItem key={s} value={s}>Sem {s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Scheme</InputLabel>
                <Select value={uploadForm.year_scheme} onChange={e => setUploadForm(f => ({ ...f, year_scheme: e.target.value }))} label="Scheme">
                  <MenuItem value="">—</MenuItem>
                  {SCHEMES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Subject Name" value={uploadForm.subject_name} onChange={e => setUploadForm(f => ({ ...f, subject_name: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" multiline rows={2} label="Description (optional)" value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <Paper component="label" sx={{ p: 3, textAlign: 'center', border: `2px dashed ${uploadFile ? '#4F46E5' : '#CBD5E1'}`, bgcolor: uploadFile ? '#EEF2FF' : '#F8FAFC', borderRadius: 2, cursor: 'pointer', display: 'block', transition: 'all 0.2s' }}>
                <input hidden type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" onChange={e => setUploadFile(e.target.files[0])} />
                <UploadIcon sx={{ color: uploadFile ? '#4F46E5' : '#94A3B8', mb: 0.5 }} />
                <Typography variant="body2" color={uploadFile ? '#4F46E5' : 'text.secondary'} fontWeight={uploadFile ? 600 : 400}>
                  {uploadFile ? uploadFile.name : 'Click to select file (PDF, DOC, PPT, Image)'}
                </Typography>
              </Paper>
            </Grid>
            {uploading && <Grid item xs={12}><LinearProgress sx={{ borderRadius: 99 }} /></Grid>}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUploadDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleUpload} disabled={uploading || !uploadFile || !uploadForm.title} variant="contained"
            sx={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', textTransform: 'none', boxShadow: 'none' }}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
      <Footer />
    </Box>
  );
}

export default CommunityNotes;
