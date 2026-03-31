import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, Alert, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Paper, Divider, LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const STATUS_COLOR = {
  upcoming: { label:'Upcoming', bg:'#DBEAFE', color:'#1E3A8A' },
  open: { label:'Apply Now', bg:'#D1FAE5', color:'#065F46' },
  closed: { label:'Closed', bg:'#F1F5F9', color:'#64748B' },
};
const TYPE_COLOR = {
  campus: { label:'Campus Drive', bg:'#EEF2FF', color:'#4F46E5' },
  off_campus: { label:'Off Campus', bg:'#FEF9C3', color:'#92400E' },
  pool: { label:'Pool Drive', bg:'#D1FAE5', color:'#065F46' },
};

function DriveCard({ drive, onApply, appliedIds, profile }) {
  const [eligDialog, setEligDialog] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const isApplied = appliedIds.includes(drive.drive_id);
  const statusCfg = STATUS_COLOR[drive.status] || STATUS_COLOR.upcoming;
  const typeCfg = TYPE_COLOR[drive.drive_type] || TYPE_COLOR.campus;

  const checkEligibility = async () => {
    try {
      const res = await api.get(`/features/placements/${drive.drive_id}/eligible`);
      setEligibility(res.data);
      setEligDialog(true);
    } catch { setEligibility(null); setEligDialog(true); }
  };

  const daysLeft = drive.registration_deadline ? Math.max(0, Math.floor((new Date(drive.registration_deadline) - new Date()) / 86400000)) : null;

  return (
    <Card elevation={0} sx={{ border:'1px solid #E2E8F0', borderRadius:3, height:'100%', display:'flex', flexDirection:'column', transition:'all 0.2s', '&:hover': { transform:'translateY(-4px)', boxShadow:'0 12px 30px rgba(79,70,229,0.12)' } }}>
      <Box sx={{ p:2.5, bgcolor:'#F8FAFC', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          <Box sx={{ width:44, height:44, borderRadius:2, bgcolor:'white', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BusinessIcon sx={{ color:'#4F46E5' }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontFamily="'Space Grotesk', sans-serif">{drive.company_name}</Typography>
            <Typography variant="caption" color="text.secondary">{drive.role}</Typography>
          </Box>
        </Box>
        <Chip label={statusCfg.label} size="small" sx={{ bgcolor:statusCfg.bg, color:statusCfg.color, fontWeight:700, fontSize:'0.65rem' }} />
      </Box>

      <CardContent sx={{ flex:1, p:2.5 }}>
        <Box sx={{ display:'flex', gap:1, mb:2, flexWrap:'wrap' }}>
          <Chip label={typeCfg.label} size="small" sx={{ bgcolor:typeCfg.bg, color:typeCfg.color, fontSize:'0.65rem', fontWeight:600 }} />
          {drive.package_lpa && (
            <Chip label={`₹${drive.package_lpa}${drive.package_max_lpa > drive.package_lpa ? `–${drive.package_max_lpa}` : ''} LPA`}
              size="small" sx={{ bgcolor:'#D1FAE5', color:'#065F46', fontWeight:700, fontSize:'0.65rem' }} />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2} sx={{ lineHeight:1.6 }}>
          {drive.description}
        </Typography>

        <Grid container spacing={1.5} mb={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" display="block">Min CGPA</Typography>
            <Typography fontWeight={700} color={parseFloat(profile?.cgpa||0) >= drive.min_cgpa ? '#10B981' : '#EF4444'}>
              {drive.min_cgpa} {parseFloat(profile?.cgpa||0) >= drive.min_cgpa ? '✓' : '✗'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" display="block">Backlogs Allowed</Typography>
            <Typography fontWeight={700}>{drive.eligible_backlogs}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" display="block">Eligible Branches</Typography>
            <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.5, mt:0.5 }}>
              {(drive.eligible_branches || []).map(b => (
                <Chip key={b} label={b} size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontSize:'0.65rem', height:20 }} />
              ))}
            </Box>
          </Grid>
        </Grid>

        {drive.drive_date && (
          <Box sx={{ display:'flex', alignItems:'center', gap:0.5, color:'#64748B' }}>
            <CalendarMonthIcon fontSize="small" />
            <Typography variant="caption">Drive: {new Date(drive.drive_date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</Typography>
          </Box>
        )}
        {daysLeft !== null && daysLeft <= 5 && (
          <Chip label={daysLeft === 0 ? 'Last day to register!' : `${daysLeft} days left`} size="small"
            sx={{ mt:1, bgcolor:'#FEE2E2', color:'#991B1B', fontWeight:700, fontSize:'0.65rem' }} />
        )}
      </CardContent>

      <CardActions sx={{ p:2.5, pt:0, gap:1 }}>
        <Button size="small" variant="outlined" onClick={checkEligibility} fullWidth
          sx={{ textTransform:'none', borderRadius:2, borderColor:'#E2E8F0', color:'#64748B', fontWeight:600 }}>
          Check Eligibility
        </Button>
        {isApplied ? (
          <Button size="small" variant="contained" disabled fullWidth startIcon={<CheckCircleIcon />}
            sx={{ textTransform:'none', borderRadius:2, bgcolor:'#D1FAE5', color:'#065F46', boxShadow:'none' }}>
            Applied
          </Button>
        ) : (
          <Button size="small" variant="contained" onClick={() => onApply(drive)} fullWidth
            sx={{ textTransform:'none', borderRadius:2, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'none', fontWeight:700 }}>
            Apply
          </Button>
        )}
      </CardActions>

      {/* Eligibility Dialog */}
      <Dialog open={eligDialog} onClose={() => setEligDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontFamily="'Space Grotesk', sans-serif">Eligibility for {drive.company_name}</DialogTitle>
        <DialogContent>
          {eligibility ? (
            <Box>
              <Alert severity={eligibility.eligible ? 'success' : 'error'} sx={{ mb:2 }}>
                {eligibility.eligible ? '✅ You are ELIGIBLE for this drive!' : '❌ You do not meet the eligibility criteria'}
              </Alert>
              {[
                { label:'Your CGPA', value:eligibility.cgpa, required:`≥ ${eligibility.required_cgpa}`, ok: eligibility.cgpa >= eligibility.required_cgpa },
                { label:'Your Backlogs', value:eligibility.backlogs, required:`≤ ${eligibility.allowed_backlogs}`, ok: eligibility.backlogs <= eligibility.allowed_backlogs },
              ].map((row,i) => (
                <Box key={i} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', py:1.5, borderBottom:'1px solid #F1F5F9' }}>
                  <Box>
                    <Typography fontWeight={600}>{row.label}</Typography>
                    <Typography variant="caption" color="text.secondary">Required: {row.required}</Typography>
                  </Box>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                    <Typography fontWeight={700}>{row.value}</Typography>
                    {row.ok ? <CheckCircleIcon sx={{ color:'#10B981', fontSize:20 }} /> : <CancelIcon sx={{ color:'#EF4444', fontSize:20 }} />}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : <Typography>Unable to check eligibility. Please ensure your profile is complete.</Typography>}
        </DialogContent>
        <DialogActions>
          {eligibility?.eligible && drive.apply_link && (
            <Button href={drive.apply_link} target="_blank" endIcon={<OpenInNewIcon />} sx={{ textTransform:'none' }}>Apply on Company Portal</Button>
          )}
          <Button onClick={() => setEligDialog(false)} sx={{ textTransform:'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [snack, setSnack] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/features/placements'),
      api.get('/features/my-applications'),
      api.get('/users/profile'),
    ]).then(([d, a, p]) => {
      setDrives(d.data);
      setMyApps(a.data);
      setProfile(p.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleApply = async (drive) => {
    try {
      await api.post(`/features/placements/${drive.drive_id}/apply`);
      setSnack(`Applied to ${drive.company_name}! 🎉`);
      const a = await api.get('/features/my-applications');
      setMyApps(a.data);
    } catch { setSnack('Application failed'); }
  };

  const appliedIds = myApps.map(a => a.drive_id);

  let display = tab === 'applied' ? myApps : drives;
  if (tab !== 'applied') {
    display = display.filter(d => tab === 'all' || d.status === tab);
  }
  if (branch) display = display.filter(d => !d.eligible_branches?.length || d.eligible_branches.includes(branch));
  if (search) display = display.filter(d => d.company_name.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase()));

  const BRANCHES = ['CSE','ISE','ECE','ME','CV','EEE','AIML','DS'];

  if (loading) return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Header /><Box sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><CircularProgress /></Box>
    </Box>
  );

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background:'linear-gradient(135deg,#059669 0%,#0EA5E9 100%)', py:5, px:2 }}>
        <Container>
          <Typography variant="h3" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="white" mb={1}>💼 Placement Drives</Typography>
          <Typography color="rgba(255,255,255,0.85)" fontSize="1.05rem">Company-wise drives with eligibility checker and one-click application</Typography>
          <Box sx={{ display:'flex', gap:3, mt:3 }}>
            {[['Open Drives', drives.filter(d=>d.status==='open').length], ['Upcoming', drives.filter(d=>d.status==='upcoming').length], ['Applied', myApps.length]].map(([l,v]) => (
              <Box key={l} sx={{ bgcolor:'rgba(255,255,255,0.12)', borderRadius:2, px:3, py:1.5, backdropFilter:'blur(10px)' }}>
                <Typography fontWeight={800} fontSize="1.5rem" color="white">{v}</Typography>
                <Typography color="rgba(255,255,255,0.75)" fontSize="0.8rem">{l}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py:4 }}>
        {/* Filters */}
        <Paper elevation={0} sx={{ border:'1px solid #E2E8F0', borderRadius:3, p:2.5, mb:3, display:'flex', gap:2, flexWrap:'wrap', alignItems:'center' }}>
          <TextField size="small" placeholder="Search company or role..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ flex:1, minWidth:200, '& .MuiOutlinedInput-root': { borderRadius:2 } }} />
          <FormControl size="small" sx={{ minWidth:130 }}>
            <InputLabel>Branch</InputLabel>
            <Select value={branch} onChange={e => setBranch(e.target.value)} label="Branch" sx={{ borderRadius:2 }}>
              <MenuItem value="">All Branches</MenuItem>
              {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </Select>
          </FormControl>
          {(search || branch) && <Button onClick={() => { setSearch(''); setBranch(''); }} sx={{ textTransform:'none' }}>Clear</Button>}
        </Paper>

        <Tabs value={tab} onChange={(_,v) => setTab(v)} sx={{ mb:3, '& .Mui-selected': { color:'#4F46E5' }, '& .MuiTabs-indicator': { bgcolor:'#4F46E5' }, '& .MuiTab-root': { textTransform:'none', fontWeight:600 } }}>
          {[['all','All Drives'],['open','🟢 Open Now'],['upcoming','📅 Upcoming'],['applied','📋 Applied']].map(([v,l]) => <Tab key={v} value={v} label={l} />)}
        </Tabs>

        {loading ? <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>
        : display.length === 0 ? (
          <Box sx={{ textAlign:'center', py:8 }}>
            <Typography fontSize="3rem">🔍</Typography>
            <Typography variant="h6" fontWeight={600} mt={2}>{tab==='applied' ? "You haven't applied to any drives yet" : 'No drives found'}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {display.map(d => <Grid item xs={12} md={6} key={d.drive_id}><DriveCard drive={d} onApply={handleApply} appliedIds={appliedIds} profile={profile} /></Grid>)}
          </Grid>
        )}
      </Container>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
      <Footer />
    </Box>
  );
}

export default PlacementDrives;
