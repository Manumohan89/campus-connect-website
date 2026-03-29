import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Paper, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const DEPTS = ['CSE', 'ISE', 'ECE', 'ME', 'CV', 'EEE', 'AIML', 'DS'];
const AVATAR_COLORS = ['#4F46E5', '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

function AlumniCard({ alumni, onConnect }) {
  const bgColor = AVATAR_COLORS[(alumni.id - 1) % AVATAR_COLORS.length];
  const initials = alumni.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(79,70,229,0.12)' } }}>
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'flex-start' }}>
          <Avatar sx={{ width: 52, height: 52, bgcolor: bgColor, fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>{initials}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700} fontFamily="'Space Grotesk', sans-serif" fontSize="0.95rem" noWrap>{alumni.full_name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>{alumni.current_role}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <WorkIcon sx={{ fontSize: 14, color: '#64748B' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{alumni.current_company}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={alumni.branch} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.65rem' }} />
          <Chip label={`Class of ${alumni.graduation_year}`} size="small" sx={{ bgcolor: '#F1F5F9', fontSize: '0.65rem' }} />
          {alumni.is_available && <Chip label="Available to Mentor" size="small" sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 700, fontSize: '0.65rem' }} />}
        </Box>

        {/* Bio */}
        {alumni.bio && (
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {alumni.bio}
          </Typography>
        )}

        {/* Skills */}
        {alumni.skills?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {alumni.skills.slice(0, 4).map((s, i) => (
              <Chip key={i} label={s} size="small" sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.65rem' }} />
            ))}
            {alumni.skills.length > 4 && <Chip label={`+${alumni.skills.length - 4}`} size="small" sx={{ fontSize: '0.65rem', bgcolor: '#EEF2FF', color: '#4F46E5' }} />}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
        {alumni.linkedin_url && (
          <Button size="small" variant="outlined" startIcon={<LinkedInIcon />} href={alumni.linkedin_url} target="_blank"
            sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#0077B5', color: '#0077B5', fontWeight: 600, flex: 1, '&:hover': { bgcolor: '#EFF8FF', borderColor: '#0077B5' } }}>
            LinkedIn
          </Button>
        )}
        <Button size="small" variant="contained" startIcon={<ConnectWithoutContactIcon />} onClick={() => onConnect(alumni)} fullWidth={!alumni.linkedin_url}
          sx={{ textTransform: 'none', borderRadius: 2, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: 'none', fontWeight: 700, flex: alumni.linkedin_url ? 1 : undefined }}>
          Connect
        </Button>
      </CardActions>
    </Card>
  );
}

function AlumniMentorship() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [company, setCompany] = useState('');
  const [connectDialog, setConnectDialog] = useState(null);
  const [message, setMessage] = useState('');
  const [snack, setSnack] = useState('');

  useEffect(() => {
    const params = {};
    if (branch) params.branch = branch;
    if (company) params.company = company;
    api.get('/features/alumni', { params })
      .then(r => setAlumni(r.data))
      .catch(() => setError('Failed to load alumni.'))
      .finally(() => setLoading(false));
  }, [branch, company]);

  const handleConnect = async () => {
    if (!message.trim()) return;
    try {
      await api.post(`/features/alumni/${connectDialog.id}/connect`, { message });
      setSnack(`Connection request sent to ${connectDialog.full_name}! 🎉`);
      setConnectDialog(null);
      setMessage('');
    } catch { setSnack('Failed to send request.'); }
  };

  const filtered = alumni.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return a.full_name.toLowerCase().includes(s) || (a.current_company || '').toLowerCase().includes(s) || (a.current_role || '').toLowerCase().includes(s) || (a.skills || []).some(sk => sk.toLowerCase().includes(s));
  });

  const companies = [...new Set(alumni.map(a => a.current_company).filter(Boolean))].slice(0, 10);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />

      <Box sx={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%)', py: 5, px: 2 }}>
        <Container>
          <Typography variant="h3" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="white" mb={1}>
            🤝 Alumni Mentorship
          </Typography>
          <Typography color="rgba(255,255,255,0.85)" fontSize="1.05rem" mb={3}>
            Connect with VTU alumni at top companies for guidance, referrals, and career advice
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {[['Total Mentors', alumni.length], ['Companies', companies.length], ['Branches', [...new Set(alumni.map(a => a.branch))].length]].map(([l, v]) => (
              <Box key={l} sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, px: 3, py: 1.5, backdropFilter: 'blur(10px)' }}>
                <Typography fontWeight={800} fontSize="1.5rem" color="white">{v}</Typography>
                <Typography color="rgba(255,255,255,0.75)" fontSize="0.8rem">{l}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Filters */}
        <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 2.5, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Search by name, company, or skill..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Branch</InputLabel>
            <Select value={branch} onChange={e => setBranch(e.target.value)} label="Branch" sx={{ borderRadius: 2 }}>
              <MenuItem value="">All Branches</MenuItem>
              {DEPTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Company</InputLabel>
            <Select value={company} onChange={e => setCompany(e.target.value)} label="Company" sx={{ borderRadius: 2 }}>
              <MenuItem value="">All Companies</MenuItem>
              {companies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          {(search || branch || company) && (
            <Button onClick={() => { setSearch(''); setBranch(''); setCompany(''); }} sx={{ textTransform: 'none' }}>Clear</Button>
          )}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography color="text.secondary" fontSize="0.875rem">{filtered.length} mentor{filtered.length !== 1 ? 's' : ''} available</Typography>
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography fontSize="3rem">👥</Typography>
            <Typography variant="h6" fontWeight={600} mt={2}>No alumni found</Typography>
            <Typography color="text.secondary" mt={1}>Try adjusting your filters</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map(a => (
              <Grid item xs={12} sm={6} md={4} key={a.id}>
                <AlumniCard alumni={a} onConnect={setConnectDialog} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Connect Dialog */}
      {connectDialog && (
        <Dialog open onClose={() => setConnectDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle fontFamily="'Space Grotesk', sans-serif">
            Connect with {connectDialog.full_name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
              <WorkIcon sx={{ color: '#4F46E5', mt: 0.5 }} />
              <Box>
                <Typography fontWeight={600}>{connectDialog.current_role} at {connectDialog.current_company}</Typography>
                <Typography variant="caption" color="text.secondary">{connectDialog.branch} • Class of {connectDialog.graduation_year}</Typography>
              </Box>
            </Box>
            <TextField fullWidth multiline rows={4} label="Your message *" value={message} onChange={e => setMessage(e.target.value)}
              placeholder={`Hi ${connectDialog.full_name.split(' ')[0]}, I'm a VTU student from ${connectDialog.branch}. I would love to get your guidance on...`} />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              💡 Be specific about what guidance you need. Mentors appreciate focused questions.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConnectDialog(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button onClick={handleConnect} disabled={!message.trim()} variant="contained"
              sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', textTransform: 'none', boxShadow: 'none', fontWeight: 700 }}>
              Send Request
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
      <Footer />
    </Box>
  );
}

export default AlumniMentorship;
