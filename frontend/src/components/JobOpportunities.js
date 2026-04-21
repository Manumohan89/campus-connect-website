import React, { useState, useEffect } from 'react';
import {
  Container, Box, Grid, Card, CardContent, CardActions,
  Typography, Button, Chip, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Skeleton, Alert
} from '@mui/material';
import { OpenInNew, BusinessCenter } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const BRANCHES = ['All Branches','CSE','ISE','ECE','ME','CV','EEE','AIML','DS'];
const TYPES = ['All Types','Internship','Full-time','Contract','Remote'];
const TYPE_STYLE = {
  'Internship':{ bg:'#EDE9FE', color:'#5B21B6' },
  'Full-time': { bg:'#D1FAE5', color:'#065F46' },
  'Contract':  { bg:'#FEF9C3', color:'#92400E' },
  'Remote':    { bg:'#DBEAFE', color:'#1E3A8A' } };
const COMPANY_COLORS = {
  'Infosys':'#1B4D9B','TCS':'#CC0000','Wipro':'#341C6B','Accenture':'#A100FF',
  'Google':'#4285F4','Microsoft':'#00A4EF','Zepto':'#FF6B35','CRED':'#1C1C1C',
  'Juspay':'#4F46E5','Bosch':'#C0392B','Intel':'#0071C5','Razorpay':'#2D9CDB',
  'Siemens':'#009999','Myntra':'#FF3F6C','Swiggy':'#FC8019','Sarvam AI':'#7C3AED' };

function CompanyAvatar({ company }) {
  const color = COMPANY_COLORS[company] || '#4F46E5';
  return (
    <Box sx={{ width:44, height:44, borderRadius:'12px', bgcolor:color+'15', border:`1.5px solid ${color}33`,
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Typography fontWeight={900} fontSize="0.85rem" color={color}>{company?.substring(0,2).toUpperCase()}</Typography>
    </Box>
  );
}

function JobCard({ job }) {
  const tc = TYPE_STYLE[job.type] || TYPE_STYLE['Full-time'];
  const tags = job.tags || [];
  const isNew = job.created_at && (Date.now() - new Date(job.created_at)) < 7*86400000;
  return (
    <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:'16px', height:'100%',
      display:'flex', flexDirection:'column', transition:'all 0.18s',
      '&:hover':{ borderColor:'#4F46E5', transform:'translateY(-3px)', boxShadow:'0 10px 30px rgba(79,70,229,0.12)' } }}>
      <CardContent sx={{ flex:1, p:2.5 }}>
        <Box sx={{ display:'flex', gap:1.5, alignItems:'flex-start', mb:1.5 }}>
          <CompanyAvatar company={job.company} />
          <Box sx={{ flex:1, minWidth:0 }}>
            <Box sx={{ display:'flex', gap:0.75, alignItems:'center', mb:0.3, flexWrap:'wrap' }}>
              <Chip label={job.type||'Full-time'} size="small" sx={{ bgcolor:tc.bg, color:tc.color, fontWeight:700, fontSize:'0.6rem', height:18 }} />
              {isNew && <Chip label="NEW" size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontWeight:800, fontSize:'0.6rem', height:18 }} />}
            </Box>
            <Typography fontWeight={800} fontSize="0.88rem" lineHeight={1.3}
              sx={{ overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
              {job.title}
            </Typography>
          </Box>
        </Box>
        <Typography fontSize="0.8rem" fontWeight={700} color="#374151" mb={0.5}>{job.company}</Typography>
        {job.location && (
          <Box sx={{ display:'flex', alignItems:'center', gap:0.4, mb:1 }}>
            <LocationOnIcon sx={{ fontSize:13, color:'#9CA3AF' }} />
            <Typography fontSize="0.72rem" color="text.secondary">{job.location}</Typography>
          </Box>
        )}
        <Typography fontSize="0.78rem" color="text.secondary" mb={1.5} lineHeight={1.6}
          sx={{ overflow:'hidden', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' }}>
          {job.description}
        </Typography>
        {job.min_cgpa > 0 && (
          <Box sx={{ mb:1 }}>
            <Chip label={`Min CGPA: ${job.min_cgpa}`} size="small"
              sx={{ bgcolor:'#FEF9C3', color:'#92400E', fontSize:'0.65rem', height:18, fontWeight:600 }} />
          </Box>
        )}
        <Box sx={{ display:'flex', gap:0.5, flexWrap:'wrap' }}>
          {tags.slice(0,4).map(t => (
            <Chip key={t} label={t} size="small" sx={{ bgcolor:'#F1F5F9', fontSize:'0.62rem', height:18, color:'#374151' }} />
          ))}
          {tags.length > 4 && <Chip label={`+${tags.length-4}`} size="small" sx={{ bgcolor:'#F1F5F9', fontSize:'0.62rem', height:18, color:'#9CA3AF' }} />}
        </Box>
      </CardContent>
      <CardActions sx={{ p:2.5, pt:0 }}>
        {job.deadline && new Date(job.deadline) > new Date() && (
          <Typography fontSize="0.65rem" color="text.secondary" sx={{ flex:1 }}>
            Deadline: {new Date(job.deadline).toLocaleDateString('en-IN')}
          </Typography>
        )}
        <Button variant="contained" endIcon={<OpenInNew sx={{ fontSize:'13px !important' }} />}
          href={job.link} target="_blank" rel="noopener noreferrer" size="small"
          sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:'10px',
            textTransform:'none', fontWeight:700, fontSize:'0.78rem', boxShadow:'none',
            '&:hover':{ boxShadow:'0 4px 12px rgba(79,70,229,0.4)' } }}>
          Apply Now
        </Button>
      </CardActions>
    </Card>
  );
}

export default function JobOpportunities() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('All Branches');
  const [type, setType] = useState('All Types');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (type !== 'All Types') params.type = type;
    api.get('/users/job-opportunities', { params })
      .then(r => {
        let data = r.data || [];
        if (branch !== 'All Branches') {
          data = data.filter(j => !j.eligible_branches?.length || j.eligible_branches.includes(branch));
        }
        setJobs(data);
        setError('');
      })
      .catch(() => setError('Failed to load jobs. Check your connection.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, branch]);

  const stats = [
    { val:jobs.length, label:'Positions' },
    { val:jobs.filter(j=>j.type==='Internship').length, label:'Internships' },
    { val:jobs.filter(j=>j.type==='Full-time').length, label:'Full-time' },
    { val:new Set(jobs.map(j=>j.company)).size, label:'Companies' },
  ];

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#064E3B 0%,#059669 60%,#10B981 100%)', py:5, px:2 }}>
        <Container>
          <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:2 }}>
            <BusinessCenter sx={{ color:'white', fontSize:32 }} />
            <Box>
              <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">Job Opportunities</Typography>
              <Typography color="rgba(255,255,255,0.8)">Curated VTU-relevant openings — internships, full-time, core and IT roles</Typography>
            </Box>
          </Box>
          <Box sx={{ display:'flex', gap:2.5, flexWrap:'wrap' }}>
            {stats.map(s => (
              <Box key={s.label} sx={{ textAlign:'center', bgcolor:'rgba(255,255,255,0.12)', borderRadius:2, px:2.5, py:1.2 }}>
                <Typography fontWeight={900} fontSize="1.4rem" color="white">{s.val}</Typography>
                <Typography fontSize="0.68rem" color="rgba(255,255,255,0.7)" textTransform="uppercase" letterSpacing="0.06em">{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py:4, flex:1 }} maxWidth="xl">
        <Box sx={{ display:'flex', gap:1.5, mb:3, flexWrap:'wrap', alignItems:'center' }}>
          <TextField size="small" placeholder="Search jobs, companies, skills..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ color:'#9CA3AF', fontSize:18 }} /></InputAdornment> }}
            sx={{ flex:1, minWidth:200, '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
          <FormControl size="small" sx={{ minWidth:140 }}>
            <InputLabel>Branch</InputLabel>
            <Select value={branch} onChange={e => setBranch(e.target.value)} label="Branch" sx={{ borderRadius:'10px' }}>
              {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth:130 }}>
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={e => setType(e.target.value)} label="Type" sx={{ borderRadius:'10px' }}>
              {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          {(search || branch !== 'All Branches' || type !== 'All Types') && (
            <Button size="small" onClick={() => { setSearch(''); setBranch('All Branches'); setType('All Types'); }}
              sx={{ textTransform:'none', color:'#EF4444', fontWeight:600 }}>Clear</Button>
          )}
        </Box>

        <Alert severity="info" sx={{ mb:3, borderRadius:'12px', fontSize:'0.8rem' }}>
          Always apply directly on the official company website. Campus Connect does not charge any fees.
        </Alert>

        {error && <Alert severity="error" sx={{ mb:3, borderRadius:'12px' }}>{error}</Alert>}

        {loading ? (
          <Grid container spacing={2.5}>
            {[...Array(9)].map((_,i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:'16px', p:2.5 }}>
                  {[80,60,100,40,60].map((w,j) => <Skeleton key={j} height={j===0?20:14} width={`${w}%`} sx={{ mb:0.5, borderRadius:6 }} />)}
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : jobs.length === 0 ? (
          <Box sx={{ textAlign:'center', py:10 }}>
            <Typography fontSize="3rem">🔍</Typography>
            <Typography fontWeight={700} fontSize="1.1rem" mt={2} mb={0.5}>No jobs found</Typography>
            <Typography color="text.secondary" fontSize="0.875rem">Try adjusting your filters</Typography>
            <Button onClick={() => { setSearch(''); setBranch('All Branches'); setType('All Types'); }}
              sx={{ mt:2, textTransform:'none', color:'#4F46E5', fontWeight:700 }}>Show all jobs</Button>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {jobs.map((job, i) => (
              <Grid item xs={12} sm={6} md={4} xl={3} key={job.id || i}>
                <JobCard job={job} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
