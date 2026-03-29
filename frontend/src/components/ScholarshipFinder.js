import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Chip, Grid, Button,
  TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';

const CAT_COLORS = {
  'central-govt': { bg: '#DBEAFE', color: '#1E3A8A', label: 'Central Govt' },
  'state-merit':  { bg: '#D1FAE5', color: '#065F46', label: 'State Merit' },
  'private':      { bg: '#EDE9FE', color: '#4C1D95', label: 'Private' },
  'private-merit':{ bg: '#EDE9FE', color: '#4C1D95', label: 'Merit-Private' },
  'corporate':    { bg: '#FEF9C3', color: '#713F12', label: 'Corporate' },
  'merit':        { bg: '#D1FAE5', color: '#065F46', label: 'Merit' },
};

const FALLBACK = [
  { id:1, name:'NSP Post-Matric', provider:'National Scholarship Portal', amount:'Up to ₹12,000/year', category:'central-govt', apply_link:'https://scholarships.gov.in', description:'For SC/ST/OBC students. Family income below ₹2.5 lakh.', min_cgpa:0, eligible_branches:[] },
  { id:2, name:'AICTE Pragati Scholarship', provider:'AICTE', amount:'₹50,000/year', category:'central-govt', apply_link:'https://www.aicte-india.org', description:'For girl students in AICTE approved institutions.', min_cgpa:0, eligible_branches:[] },
  { id:3, name:'Google Generation Scholarship', provider:'Google India', amount:'Up to ₹75,000', category:'private-merit', apply_link:'https://buildyourfuture.withgoogle.com/scholarships', description:'For female students in CS/IT. Strong academic record required.', min_cgpa:7.0, eligible_branches:['CSE','ISE','AIML','DS'] },
  { id:4, name:'VTU Merit Scholarship', provider:'VTU', amount:'₹10,000–25,000', category:'state-merit', apply_link:'https://vtu.ac.in', description:'For VTU students with CGPA 8.5+ in previous year.', min_cgpa:8.5, eligible_branches:[] },
  { id:5, name:'LIC Golden Jubilee Scholarship', provider:'LIC of India', amount:'₹20,000/year', category:'private', apply_link:'https://licindia.in', description:'For economically weaker students. Family income below ₹1 lakh.', min_cgpa:0, eligible_branches:[] },
  { id:6, name:'Inspire Scholarship (DST)', provider:'Dept of Science & Technology', amount:'₹80,000/year', category:'central-govt', apply_link:'https://online-inspire.gov.in', description:'Top 1% in 10+2 board exams. Strong science background.', min_cgpa:8.0, eligible_branches:[] },
  { id:7, name:'Infosys BPM Scholarship', provider:'Infosys Foundation', amount:'₹30,000/year', category:'corporate', apply_link:'https://www.infosys.com/infosys-foundation', description:'For meritorious students from economically weaker backgrounds.', min_cgpa:7.0, eligible_branches:['CSE','ISE','ECE'] },
  { id:8, name:'AICTE Saksham Scholarship', provider:'AICTE', amount:'₹50,000/year', category:'central-govt', apply_link:'https://www.aicte-india.org', description:'For specially-abled students in AICTE approved programs.', min_cgpa:0, eligible_branches:[] },
  { id:9, name:'Pradhan Mantri Scholarship', provider:'WARB Ministry of Home Affairs', amount:'Up to ₹25,000/year', category:'central-govt', apply_link:'https://ksb.gov.in', description:'For wards of ex-servicemen/women.', min_cgpa:0, eligible_branches:[] },
  { id:10, name:'Karnataka Rajyotsava Scholarship', provider:'Karnataka Govt', amount:'Up to ₹5,000/year', category:'state-merit', apply_link:'https://karunadu.karnataka.gov.in', description:'For students scoring 80%+ in previous exam.', min_cgpa:8.0, eligible_branches:[] },
];

function ScholarshipCard({ s, userCgpa, userBranch }) {
  const eligible = s.min_cgpa === 0 ? true : parseFloat(userCgpa || 0) >= s.min_cgpa;
  const branchOk = !s.eligible_branches?.length || s.eligible_branches.includes(userBranch);
  const canApply = eligible && branchOk;
  const cat = CAT_COLORS[s.category] || CAT_COLORS.merit;
  const deadlineSoon = s.deadline && (new Date(s.deadline) - new Date()) < 7 * 86400000 && new Date(s.deadline) > new Date();

  return (
    <Card elevation={0} sx={{
      border: `1.5px solid ${canApply ? '#10B98133' : '#E2E8F0'}`,
      borderRadius: 3, p: 2.5, height: '100%', display: 'flex', flexDirection: 'column',
      bgcolor: canApply ? '#F0FDF4' : 'white',
      transition: 'all 0.15s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }
    }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip label={cat.label} size="small" sx={{ bgcolor: cat.bg, color: cat.color, fontWeight: 700, fontSize: '0.65rem' }} />
        {canApply && userCgpa && <Chip icon={<CheckCircleIcon sx={{ fontSize: '12px !important' }} />} label="You may be eligible" size="small" sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 700, fontSize: '0.65rem' }} />}
        {deadlineSoon && <Chip label="Deadline soon!" size="small" sx={{ bgcolor: '#FEF2F2', color: '#991B1B', fontWeight: 700, fontSize: '0.65rem' }} />}
      </Box>
      <Typography fontWeight={800} fontSize="0.95rem" mb={0.5}>{s.name}</Typography>
      <Typography fontSize="0.75rem" color="text.secondary" mb={0.5}>{s.provider}</Typography>
      <Typography fontWeight={700} fontSize="0.9rem" color="#10B981" mb={1.5}>{s.amount}</Typography>
      <Typography fontSize="0.78rem" color="text.secondary" mb={1.5} sx={{ flex: 1, lineHeight: 1.6 }}>{s.description}</Typography>
      {(s.min_cgpa > 0 || s.eligible_branches?.length > 0) && (
        <Box sx={{ mb: 1.5 }}>
          {s.min_cgpa > 0 && <Typography fontSize="0.7rem" color="text.secondary">Min CGPA: <strong>{s.min_cgpa}</strong></Typography>}
          {s.eligible_branches?.length > 0 && <Typography fontSize="0.7rem" color="text.secondary">Branches: <strong>{s.eligible_branches.join(', ')}</strong></Typography>}
          {s.deadline && <Typography fontSize="0.7rem" color={deadlineSoon ? '#EF4444' : 'text.secondary'}>Deadline: <strong>{new Date(s.deadline).toLocaleDateString('en-IN')}</strong></Typography>}
        </Box>
      )}
      <Button variant={canApply ? 'contained' : 'outlined'} endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
        href={s.apply_link} target="_blank" rel="noopener noreferrer" fullWidth size="small"
        sx={{
          textTransform: 'none', fontWeight: 700, borderRadius: 2, mt: 'auto',
          ...(canApply ? { background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: 'none' } : { borderColor: '#E2E8F0', color: '#6B7280' })
        }}>
        Apply Now
      </Button>
    </Card>
  );
}

export default function ScholarshipFinder() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [userCgpa, setUserCgpa] = useState('');
  const [userBranch, setUserBranch] = useState('');

  useEffect(() => {
    // Try to load user profile for eligibility matching — only if logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/users/profile').then(r => {
        setUserCgpa(r.data.cgpa || '');
        setUserBranch(r.data.branch || '');
      }).catch(() => {});
    }
    // Load scholarships (public endpoint — no token needed)
    api.get('/scholarships').then(r => setScholarships(r.data?.length > 0 ? r.data : FALLBACK))
      .catch(() => setScholarships(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = scholarships.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.provider.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || s.category === category;
    return matchSearch && matchCat;
  });

  const eligibleCount = filtered.filter(s => {
    const cgpaOk = s.min_cgpa === 0 || parseFloat(userCgpa || 0) >= s.min_cgpa;
    const branchOk = !s.eligible_branches?.length || s.eligible_branches.includes(userBranch);
    return cgpaOk && branchOk;
  }).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <PublicHeader />
      <Box sx={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', py: 5, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <EmojiEventsIcon sx={{ color: 'white', fontSize: '2.5rem' }} />
            <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">Scholarship Finder</Typography>
          </Box>
          <Typography color="rgba(255,255,255,0.85)" mb={3}>Central govt, Karnataka state, corporate, and merit scholarships for VTU students. Updated for 2024–25.</Typography>
          {userCgpa && (
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 3, py: 1.5, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ color: 'white', fontSize: 18 }} />
              <Typography color="white" fontWeight={700} fontSize="0.875rem">
                Based on your CGPA {parseFloat(userCgpa).toFixed(2)} and {userBranch} branch — {eligibleCount} scholarships you may be eligible for
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      <Container sx={{ py: 4, flex: 1 }} maxWidth="xl">
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Search scholarships..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} /></InputAdornment> }}
            sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} onChange={e => setCategory(e.target.value)} label="Category" sx={{ borderRadius: 2 }}>
              <MenuItem value="">All Categories</MenuItem>
              {Object.entries(CAT_COLORS).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
            </Select>
          </FormControl>
          {!userCgpa && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ml: { md: 'auto' } }}>
              <TextField size="small" label="Your CGPA" type="number" value={userCgpa} onChange={e => setUserCgpa(e.target.value)}
                inputProps={{ min: 0, max: 10, step: 0.1 }} sx={{ width: 110, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Branch</InputLabel>
                <Select value={userBranch} onChange={e => setUserBranch(e.target.value)} label="Branch" sx={{ borderRadius: 2 }}>
                  {['CSE','ISE','ECE','ME','CV','EEE','AIML','DS'].map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          )}
          <Typography fontSize="0.82rem" color="text.secondary">{filtered.length} scholarships</Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontSize: '0.82rem' }}>
          Always verify eligibility and deadlines on the official scholarship portal. Amounts and criteria may change each year.
        </Alert>

        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : (
          <Grid container spacing={2.5}>
            {filtered.map(s => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={s.id}>
                <ScholarshipCard s={s} userCgpa={userCgpa} userBranch={userBranch} />
              </Grid>
            ))}
            {filtered.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography fontSize="3rem">🔍</Typography>
                  <Typography fontWeight={700} mt={2}>No scholarships found</Typography>
                  <Button onClick={() => { setSearch(''); setCategory(''); }} sx={{ mt: 1, textTransform: 'none' }}>Clear filters</Button>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
      <PublicFooter />
    </Box>
  );
}
