import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, Button, Chip, Stack,
  TextField, InputAdornment, Tab, Tabs, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  Avatar, Divider, LinearProgress, Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const STATUS_CFG = {
  pending:    { label:'Under Review',  color:'#F59E0B', bg:'#FFFBEB', icon:<PendingIcon fontSize="small"/> },
  approved:   { label:'Approved ✓',    color:'#10B981', bg:'#F0FDF4', icon:<CheckCircleIcon fontSize="small"/> },
  rejected:   { label:'Not Selected',  color:'#EF4444', bg:'#FEF2F2', icon:<CancelIcon fontSize="small"/> },
  completed:  { label:'Completed 🎓',  color:'#4F46E5', bg:'#EEF2FF', icon:<EmojiEventsIcon fontSize="small"/> } };

const CAT_COLORS = {
  technical:   { color:'#4F46E5', bg:'#EEF2FF' },
  general:     { color:'#059669', bg:'#F0FDF4' },
  management:  { color:'#7C3AED', bg:'#F5F3FF' } };

const MODE_COLORS = {
  remote:  { label:'Remote',  color:'#0EA5E9' },
  onsite:  { label:'On-site', color:'#F59E0B' },
  hybrid:  { label:'Hybrid',  color:'#7C3AED' } };

function SkillChip({ skill }) {
  return (
    <Chip label={skill} size="small"
      sx={{ fontSize:'0.7rem', height:22, bgcolor:'#F1F5F9', color:'#475569', fontWeight:500 }} />
  );
}

function InternshipCard({ program, myApplication, onApply }) {
  const cat   = CAT_COLORS[program.category] || CAT_COLORS.general;
  const mode  = MODE_COLORS[program.mode] || MODE_COLORS.remote;
  const applied = !!myApplication;
  const status  = myApplication?.status;
  const statusCfg = STATUS_CFG[status] || {};

  const deadline = program.last_date ? new Date(program.last_date) : null;
  const expired  = deadline && deadline < new Date();
  const daysLeft = deadline ? Math.ceil((deadline - new Date()) / 86400000) : null;

  return (
    <Card elevation={0} sx={{
      border:'1.5px solid #E2E8F0', borderRadius:3, overflow:'hidden',
      transition:'all 0.25s ease', height:'100%', display:'flex', flexDirection:'column',
      '&:hover':{ transform:'translateY(-4px)', boxShadow:'0 16px 40px rgba(15,23,42,0.10)', borderColor:'#C7D2FE' }
    }}>
      {/* Header stripe */}
      <Box sx={{ height:5, background: applied ? '#10B981' : `linear-gradient(90deg,${cat.color},${cat.color}66)` }} />

      <Box sx={{ p:{ xs:2, sm:2.5 }, flex:1, display:'flex', flexDirection:'column' }}>
        {/* Top row */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Avatar sx={{ bgcolor: cat.bg, color: cat.color, width:44, height:44, fontSize:'1.3rem' }}>
            {program.logo_url ? <img src={program.logo_url} alt="" style={{ width:'100%' }} /> : '🏢'}
          </Avatar>
          <Stack direction="row" spacing={0.7} flexWrap="wrap" justifyContent="flex-end">
            {program.is_premium && (
              <Chip icon={<StarIcon sx={{ fontSize:'0.75rem !important' }} />} label="Premium"
                size="small" sx={{ bgcolor:'#FEF3C7', color:'#D97706', fontSize:'0.7rem', height:22 }} />
            )}
            <Chip label={mode.label} size="small"
              sx={{ bgcolor:`${mode.color}15`, color: mode.color, fontSize:'0.7rem', height:22, fontWeight:600 }} />
            {applied && (
              <Chip
                icon={statusCfg.icon}
                label={statusCfg.label || status}
                size="small"
                sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontSize:'0.7rem', height:22, fontWeight:600 }}
              />
            )}
          </Stack>
        </Stack>

        {/* Title & company */}
        <Typography variant="h6" fontWeight={700} fontSize={{ xs:'0.95rem', sm:'1.05rem' }} lineHeight={1.3} mb={0.4}>
          {program.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1.5}>
          {program.company}
        </Typography>

        {/* Key details */}
        <Stack spacing={0.8} mb={2}>
          {program.duration && (
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <AccessTimeIcon sx={{ fontSize:'0.9rem', color:'#94A3B8' }} />
              <Typography variant="body2" color="text.secondary" fontSize="0.82rem">{program.duration}</Typography>
            </Stack>
          )}
          {program.stipend && (
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <CurrencyRupeeIcon sx={{ fontSize:'0.9rem', color:'#94A3B8' }} />
              <Typography variant="body2" color="text.secondary" fontSize="0.82rem">{program.stipend}</Typography>
            </Stack>
          )}
          {program.eligibility && (
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <SchoolIcon sx={{ fontSize:'0.9rem', color:'#94A3B8' }} />
              <Typography variant="body2" color="text.secondary" fontSize="0.82rem" noWrap>{program.eligibility}</Typography>
            </Stack>
          )}
          {deadline && (
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <CalendarMonthIcon sx={{ fontSize:'0.9rem', color: expired ? '#EF4444' : daysLeft <= 5 ? '#F59E0B' : '#94A3B8' }} />
              <Typography variant="body2" fontSize="0.82rem"
                color={ expired ? 'error' : daysLeft <= 5 ? '#F59E0B' : 'text.secondary' } fontWeight={daysLeft <= 5 ? 600 : 400}>
                {expired ? 'Deadline passed' : `Apply by ${deadline.toLocaleDateString('en-IN',{ day:'numeric', month:'short' })} (${daysLeft}d left)`}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Description */}
        {program.description && (
          <Typography variant="body2" color="text.secondary" fontSize="0.82rem" mb={1.5}
            sx={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {program.description}
          </Typography>
        )}

        {/* Skills */}
        {program.skills_covered?.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.5} mb={2}>
            {program.skills_covered.slice(0, 4).map(s => <SkillChip key={s} skill={s} />)}
            {program.skills_covered.length > 4 && (
              <Chip label={`+${program.skills_covered.length - 4}`} size="small"
                sx={{ fontSize:'0.7rem', height:22, bgcolor:'#E2E8F0' }} />
            )}
          </Stack>
        )}

        {/* Certificates */}
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
          {program.has_certificate && (
            <Chip icon={<EmojiEventsIcon sx={{ fontSize:'0.8rem !important' }} />}
              label="Internship Certificate" size="small"
              sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontSize:'0.7rem', height:22 }} />
          )}
          {program.has_training_cert && (
            <Chip icon={<SchoolIcon sx={{ fontSize:'0.8rem !important' }} />}
              label="Training Certificate" size="small"
              sx={{ bgcolor:'#F0FDF4', color:'#059669', fontSize:'0.7rem', height:22 }} />
          )}
        </Stack>

        {/* Seats */}
        {program.seats && (
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Seats filled: {parseInt(program.applicants_count||0)} / {program.seats}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (parseInt(program.applicants_count||0) / program.seats) * 100)}
              sx={{ height:5, borderRadius:99, bgcolor:'#E2E8F0', '& .MuiLinearProgress-bar':{ bgcolor: parseInt(program.applicants_count||0) >= program.seats ? '#EF4444' : '#10B981' } }}
            />
          </Box>
        )}

        <Box mt="auto">
          {applied ? (
            <Button fullWidth variant="outlined" disabled size="small"
              sx={{ borderRadius:2, textTransform:'none', fontWeight:600, fontSize:'0.83rem',
                borderColor: statusCfg.color || '#10B981', color: statusCfg.color || '#10B981',
                '&.Mui-disabled':{ borderColor: (statusCfg.color||'#10B981')+'66', color:(statusCfg.color||'#10B981')+'99' } }}>
              {statusCfg.label || 'Applied'}
            </Button>
          ) : (
            <Button fullWidth variant="contained" size="small"
              disabled={expired || parseInt(program.applicants_count||0) >= (program.seats||9999)}
              onClick={() => onApply(program)}
              sx={{ borderRadius:2, textTransform:'none', fontWeight:700, fontSize:'0.83rem',
                bgcolor:'#4F46E5', '&:hover':{ bgcolor:'#4338CA' }, '&.Mui-disabled':{ bgcolor:'#E2E8F0', color:'#94A3B8' } }}>
              {expired ? 'Deadline Passed' : parseInt(program.applicants_count||0) >= (program.seats||9999) ? 'Seats Full' : 'Apply Now'}
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}

export default function InternshipPrograms() {
  const [programs, setPrograms]     = useState([]);
  const [myApps, setMyApps]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [tab, setTab]               = useState('browse');
  const [catFilter, setCatFilter]   = useState('all');
  const [applyDialog, setApplyDialog] = useState(null);
  const [applyMsg, setApplyMsg]     = useState('');
  const [applying, setApplying]     = useState(false);
  const [snack, setSnack]           = useState({ open:false, msg:'', sev:'success' });

  const showSnack = (msg, sev='success') => setSnack({ open:true, msg, sev });

  const load = async () => {
    setLoading(true);
    try {
      const [prog, apps] = await Promise.all([
        api.get('/internship-programs').get('/internship-programs/my/applications'),
      ]);
      setPrograms(prog.data);
      setMyApps(apps.data);
    } catch (e) { showSnack('Failed to load programs', 'error'); }
    finally { setLoading(false); }
  };
   // eslint-disable-next-line react-hooks/exhaustive-deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const appMap = Object.fromEntries(myApps.map(a => [a.program_id, a]));

  const filtered = programs.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.company.toLowerCase().includes(q) || (p.skills_covered||[]).join(' ').toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchQ && matchCat;
  });

  const handleApply = async () => {
    if (!applyDialog) return;
    setApplying(true);
    try {
      await api.post(`/internship-programs/${applyDialog.id}/apply`, { student_message: applyMsg });
      showSnack('Application submitted successfully! 🎉');
      setApplyDialog(null);
      setApplyMsg('');
      load();
    } catch (e) {
      showSnack(e.response?.data?.error || 'Failed to apply', 'error');
    } finally { setApplying(false); }
  };

  const CATS = ['all','technical','general','management'];

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#F6F8FC', display:'flex', flexDirection:'column' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py:{ xs:3, sm:4 }, flex:1 }}>

        {/* Page header */}
        <Box mb={4}>
          <Stack direction={{ xs:'column', sm:'row' }} justifyContent="space-between" alignItems={{ sm:'center' }} spacing={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                <Box sx={{ width:44, height:44, borderRadius:2.5, bgcolor:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <WorkIcon sx={{ color:'#4F46E5', fontSize:'1.4rem' }} />
                </Box>
                <Typography variant="h4" fontWeight={800} fontSize={{ xs:'1.5rem', sm:'1.9rem' }}>
                  Internship Programs
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" ml={{ xs:0, sm:'56px' }}>
                Apply for curated internships, earn certificates and build your career
              </Typography>
            </Box>
            <Badge badgeContent={myApps.length} color="primary">
              <Button variant="outlined" size="small"
                onClick={() => setTab('my')}
                sx={{ borderRadius:2, textTransform:'none', fontWeight:600, whiteSpace:'nowrap', borderColor:'#C7D2FE', color:'#4F46E5', '&:hover':{ bgcolor:'#EEF2FF' } }}>
                My Applications
              </Button>
            </Badge>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb:3,
          '& .MuiTabs-indicator':{ bgcolor:'#4F46E5' },
          '& .Mui-selected':{ color:'#4F46E5 !important', fontWeight:700 } }}>
          <Tab value="browse" label="Browse Programs" sx={{ textTransform:'none', fontWeight:600 }} />
          <Tab value="my" label={`My Applications (${myApps.length})`} sx={{ textTransform:'none', fontWeight:600 }} />
        </Tabs>

        {tab === 'browse' && (
          <>
            {/* Search + filters */}
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2} mb={3}>
              <TextField
                placeholder="Search internships, companies, skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                fullWidth
                InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ color:'#94A3B8' }} /></InputAdornment> }}
                sx={{ bgcolor:'white', borderRadius:2, '& .MuiOutlinedInput-root':{ borderRadius:2 } }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {CATS.map(c => (
                  <Button key={c} size="small" variant={catFilter===c ? 'contained' : 'outlined'}
                    onClick={() => setCatFilter(c)}
                    sx={{ borderRadius:99, textTransform:'none', fontWeight:600, px:2,
                      ...(catFilter===c ? { bgcolor:'#4F46E5', '&:hover':{ bgcolor:'#4338CA' } } : { borderColor:'#E2E8F0', color:'#475569', '&:hover':{ bgcolor:'#F1F5F9' } })
                    }}>
                    {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {loading ? (
              <Box textAlign="center" py={8}><CircularProgress sx={{ color:'#4F46E5' }} /></Box>
            ) : filtered.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography fontSize="2.5rem" mb={1}>🔍</Typography>
                <Typography color="text.secondary">No internships found. Try a different search.</Typography>
              </Box>
            ) : (
              <Grid container spacing={{ xs:2, sm:3 }}>
                {filtered.map(p => (
                  <Grid item xs={12} sm={6} md={4} key={p.id}>
                    <InternshipCard program={p} myApplication={appMap[p.id]} onApply={setApplyDialog} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {tab === 'my' && (
          <>
            {myApps.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography fontSize="3rem" mb={1}>📋</Typography>
                <Typography color="text.secondary" mb={2}>You haven't applied to any internship yet.</Typography>
                <Button variant="contained" onClick={() => setTab('browse')}
                  sx={{ bgcolor:'#4F46E5', borderRadius:2, textTransform:'none', fontWeight:700 }}>
                  Browse Internships
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {myApps.map(app => {
                  const sc = STATUS_CFG[app.status] || {};
                  return (
                    <Grid item xs={12} sm={6} md={4} key={app.id}>
                      <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:2.5, height:'100%' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography fontWeight={700} fontSize="1rem" flex={1} pr={1}>{app.title}</Typography>
                          <Chip size="small" label={sc.label || app.status} icon={sc.icon}
                            sx={{ bgcolor: sc.bg, color: sc.color, fontWeight:600, fontSize:'0.7rem', height:24 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" mb={1} fontWeight={500}>{app.company}</Typography>
                        <Stack spacing={0.7} mb={2}>
                          {app.duration && <Stack direction="row" spacing={0.8} alignItems="center"><AccessTimeIcon sx={{ fontSize:'0.85rem', color:'#94A3B8' }}/><Typography variant="caption" color="text.secondary">{app.duration}</Typography></Stack>}
                          {app.stipend && <Stack direction="row" spacing={0.8} alignItems="center"><CurrencyRupeeIcon sx={{ fontSize:'0.85rem', color:'#94A3B8' }}/><Typography variant="caption" color="text.secondary">{app.stipend}</Typography></Stack>}
                          <Typography variant="caption" color="text.secondary">
                            Applied: {new Date(app.applied_at).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' })}
                          </Typography>
                        </Stack>

                        {/* Certificates */}
                        {app.status === 'completed' && (
                          <Stack spacing={1}>
                            {app.has_certificate && app.certificate_issued && (
                              <Button fullWidth variant="outlined" size="small" startIcon={<EmojiEventsIcon />}
                                sx={{ borderRadius:2, textTransform:'none', fontSize:'0.78rem', borderColor:'#4F46E5', color:'#4F46E5' }}>
                                Download Internship Certificate
                              </Button>
                            )}
                            {app.has_training_cert && app.training_cert_issued && (
                              <Button fullWidth variant="outlined" size="small" startIcon={<SchoolIcon />}
                                sx={{ borderRadius:2, textTransform:'none', fontSize:'0.78rem', borderColor:'#059669', color:'#059669' }}>
                                Download Training Certificate
                              </Button>
                            )}
                          </Stack>
                        )}
                        {app.admin_notes && (
                          <Alert severity="info" sx={{ mt:1.5, fontSize:'0.78rem', py:0.5 }}>{app.admin_notes}</Alert>
                        )}
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        )}
      </Container>

      {/* Apply Dialog */}
      <Dialog open={!!applyDialog} onClose={() => setApplyDialog(null)} fullWidth maxWidth="sm"
        PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle sx={{ fontWeight:700, pb:1 }}>
          Apply — {applyDialog?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            <strong>{applyDialog?.company}</strong> · {applyDialog?.duration} · {applyDialog?.stipend}
          </Typography>
          <Divider sx={{ mb:2 }} />
          <Typography variant="body2" fontWeight={600} mb={1}>
            Why are you interested in this internship? (optional)
          </Typography>
          <TextField
            fullWidth multiline rows={4} size="small"
            placeholder="Briefly describe your interest, relevant skills, or experience..."
            value={applyMsg}
            onChange={e => setApplyMsg(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }}
          />
          <Alert severity="info" sx={{ mt:2, fontSize:'0.8rem' }}>
            Your profile details (name, college, semester) will be shared with the internship coordinator.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={() => setApplyDialog(null)} sx={{ textTransform:'none', color:'#64748B', borderRadius:2 }}>
            Cancel
          </Button>
          <Button onClick={handleApply} variant="contained" disabled={applying}
            sx={{ borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#4F46E5', '&:hover':{ bgcolor:'#4338CA' } }}>
            {applying ? <CircularProgress size={18} color="inherit" /> : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({...s, open:false}))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.sev} onClose={() => setSnack(s => ({...s, open:false}))} sx={{ borderRadius:2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
      <Footer />
    </Box>
  );
}
