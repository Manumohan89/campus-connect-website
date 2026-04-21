import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, Card, Button, Chip, Stack,
  TextField, InputAdornment, Tab, Tabs, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import BuildIcon from '@mui/icons-material/Build';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const LEVEL_CFG = {
  beginner:     { label:'Beginner',     color:'#059669', bg:'#F0FDF4' },
  intermediate: { label:'Intermediate', color:'#F59E0B', bg:'#FFFBEB' },
  advanced:     { label:'Advanced',     color:'#EF4444', bg:'#FEF2F2' } };

const CUSTOM_STATUS = {
  pending:         { label:'Submitted',       color:'#6366F1', bg:'#EEF2FF', icon:<PendingIcon sx={{ fontSize:'0.9rem' }}/> },
  reviewing:       { label:'Under Review',    color:'#F59E0B', bg:'#FFFBEB', icon:<PendingIcon sx={{ fontSize:'0.9rem' }}/> },
  quoted:          { label:'Price Quoted',    color:'#0EA5E9', bg:'#F0F9FF', icon:<CurrencyRupeeIcon sx={{ fontSize:'0.9rem' }}/> },
  payment_pending: { label:'Pay to Start',    color:'#7C3AED', bg:'#F5F3FF', icon:<LockIcon sx={{ fontSize:'0.9rem' }}/> },
  in_progress:     { label:'In Progress',     color:'#10B981', bg:'#F0FDF4', icon:<BuildIcon sx={{ fontSize:'0.9rem' }}/> },
  delivered:       { label:'Delivered ✓',     color:'#059669', bg:'#DCFCE7', icon:<LocalShippingIcon sx={{ fontSize:'0.9rem' }}/> },
  cancelled:       { label:'Cancelled',       color:'#94A3B8', bg:'#F9FAFB', icon:null } };

const CATEGORIES = ['all','Web App','Machine Learning','Android','IoT','Desktop','Data Science'];

function ProjectCard({ project, purchased, onBuy }) {
  const lv = LEVEL_CFG[project.level] || LEVEL_CFG.intermediate;
  const isFree = !project.price_paise || project.price_paise === 0;
  const price = isFree ? 'FREE' : `₹${(project.price_paise / 100).toLocaleString('en-IN')}`;

  return (
    <Card elevation={0} sx={{
      border:'1.5px solid #E2E8F0', borderRadius:3, overflow:'hidden', height:'100%',
      display:'flex', flexDirection:'column',
      transition:'all 0.25s', '&:hover':{ transform:'translateY(-4px)', boxShadow:'0 16px 40px rgba(15,23,42,0.10)', borderColor:'#C7D2FE' }
    }}>
      {/* Color header */}
      <Box sx={{ height:4, bgcolor: isFree ? '#10B981' : '#4F46E5' }} />

      <Box sx={{ p:{ xs:2, sm:2.5 }, flex:1, display:'flex', flexDirection:'column' }}>
        {/* Title row */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5} spacing={1}>
          <Typography fontWeight={700} fontSize={{ xs:'0.95rem', sm:'1rem' }} lineHeight={1.3} flex={1}>
            {project.title}
          </Typography>
          <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
            <Chip label={price} size="small"
              sx={{ bgcolor: isFree ? '#F0FDF4' : '#EEF2FF', color: isFree ? '#059669' : '#4F46E5',
                fontWeight:800, fontSize:'0.75rem', height:24 }} />
            <Chip label={lv.label} size="small"
              sx={{ bgcolor: lv.bg, color: lv.color, fontSize:'0.68rem', height:20 }} />
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" fontSize="0.82rem" mb={1.5}
          sx={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {project.description}
        </Typography>

        {/* Tech stack */}
        <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1.5}>
          <Chip label={project.category} size="small"
            sx={{ fontSize:'0.7rem', height:22, bgcolor:'#F1F5F9', color:'#64748B', fontWeight:600 }} />
          {(project.tech_stack||[]).slice(0,3).map(t => (
            <Chip key={t} label={t} size="small" sx={{ fontSize:'0.68rem', height:22, bgcolor:'#F8FAFC', color:'#475569' }} />
          ))}
          {(project.tech_stack||[]).length > 3 && (
            <Chip label={`+${project.tech_stack.length - 3}`} size="small" sx={{ fontSize:'0.68rem', height:22, bgcolor:'#E2E8F0' }} />
          )}
        </Stack>

        {project.downloads_count > 0 && (
          <Typography variant="caption" color="text.secondary" mb={1.5} display="block">
            {project.downloads_count} download{project.downloads_count !== 1 ? 's' : ''}
          </Typography>
        )}

        <Box mt="auto" pt={1}>
          {purchased ? (
            <Stack spacing={1}>
              <Button fullWidth variant="contained" size="small" startIcon={<DownloadIcon />}
                href={project.download_url || '#'} target="_blank"
                sx={{ borderRadius:2, textTransform:'none', fontWeight:700, fontSize:'0.83rem',
                  bgcolor:'#059669', '&:hover':{ bgcolor:'#047857' } }}>
                Download Project
              </Button>
              {project.preview_url && (
                <Button fullWidth variant="outlined" size="small" startIcon={<OpenInNewIcon />}
                  href={project.preview_url} target="_blank"
                  sx={{ borderRadius:2, textTransform:'none', fontSize:'0.78rem', borderColor:'#E2E8F0', color:'#64748B' }}>
                  View Demo
                </Button>
              )}
            </Stack>
          ) : (
            <Stack spacing={1}>
              <Button fullWidth variant="contained" size="small"
                startIcon={isFree ? <DownloadIcon /> : <LockIcon />}
                onClick={() => onBuy(project)}
                sx={{ borderRadius:2, textTransform:'none', fontWeight:700, fontSize:'0.83rem',
                  bgcolor: isFree ? '#10B981' : '#4F46E5',
                  '&:hover':{ bgcolor: isFree ? '#047857' : '#4338CA' } }}>
                {isFree ? 'Get for Free' : `Buy for ${price}`}
              </Button>
              {project.preview_url && (
                <Button fullWidth variant="outlined" size="small" startIcon={<OpenInNewIcon />}
                  href={project.preview_url} target="_blank"
                  sx={{ borderRadius:2, textTransform:'none', fontSize:'0.78rem', borderColor:'#E2E8F0', color:'#64748B' }}>
                  Preview
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Card>
  );
}

const EMPTY_CUSTOM = { title:'', description:'', tech_preferences:'', deadline:'', budget_paise:'' };

export default function ProjectsMarketplace() {
  const [projects, setProjects]       = useState([]);
  const [purchases, setPurchases]     = useState([]);
  const [customReqs, setCustomReqs]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [tab, setTab]                 = useState('browse');
  const [catFilter, setCatFilter]     = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [buyDialog, setBuyDialog]     = useState(null);
  const [customDialog, setCustomDialog] = useState(false);
  const [customForm, setCustomForm]   = useState(EMPTY_CUSTOM);
  const [submitting, setSubmitting]   = useState(false);
  const [snack, setSnack]             = useState({ open:false, msg:'', sev:'success' });
  const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || '';

  const showSnack = (msg, sev='success') => setSnack({ open:true, msg, sev });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, pu, cu] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/my-purchases'),
        api.get('/projects/custom'),
      ]);
      setProjects(pr.data);
      setPurchases(pu.data);
      setCustomReqs(cu.data);
    } catch (e) { showSnack('Failed to load projects', 'error'); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const purchasedIds = new Set(purchases.map(p => p.project_id));

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || (p.tech_stack||[]).join(' ').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const matchLv  = levelFilter === 'all' || p.level === levelFilter;
    return matchQ && matchCat && matchLv;
  });

  const handleBuy = async (project) => {
    try {
      const res = await api.post(`/projects/${project.id}/create-order`, {});
      if (res.data.free) {
        showSnack('Project unlocked! You can download it now. 🎉');
        load();
        setBuyDialog(null);
        return;
      }
      // Razorpay flow
      if (!window.Razorpay) {
        showSnack('Payment gateway not loaded. Please refresh the page.', 'error');
        return;
      }
      const rzp = new window.Razorpay({
        key: razorpayKey,
        order_id: res.data.order_id,
        amount: res.data.amount,
        currency: 'INR',
        name: 'Campus Connect',
        description: `Project: ${project.title}`,
        theme: { color: '#4F46E5' },
        handler: async (payment) => {
          try {
            await api.post('/projects/verify-payment', {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
              project_id: project.id });
            showSnack('Payment successful! Project unlocked. 🎉');
            load();
            setBuyDialog(null);
          } catch { showSnack('Payment verification failed. Contact support.', 'error'); }
        },
        modal: { ondismiss: () => {} } });
      rzp.open();
    } catch (e) { showSnack(e.response?.data?.error || 'Payment failed', 'error'); }
  };

  const handleCustomSubmit = async () => {
    if (!customForm.title || !customForm.description) {
      showSnack('Title and description are required', 'error'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/projects/custom', {
        ...customForm,
        budget_paise: customForm.budget_paise ? parseInt(customForm.budget_paise) * 100 : null });
      showSnack('Custom project request submitted! We\'ll review and get back to you. 🚀');
      setCustomDialog(false);
      setCustomForm(EMPTY_CUSTOM);
      load();
    } catch (e) { showSnack(e.response?.data?.error || 'Submission failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const setField = (k, v) => setCustomForm(f => ({ ...f, [k]: v }));

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
                  <CodeIcon sx={{ color:'#4F46E5', fontSize:'1.4rem' }} />
                </Box>
                <Typography variant="h4" fontWeight={800} fontSize={{ xs:'1.5rem', sm:'1.9rem' }}>
                  Final Year Projects
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" ml={{ xs:0, sm:'56px' }}>
                Browse ready-made projects or request a custom project solution
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => setCustomDialog(true)}
              sx={{ borderRadius:2, textTransform:'none', fontWeight:700, whiteSpace:'nowrap',
                bgcolor:'#4F46E5', '&:hover':{ bgcolor:'#4338CA' } }}>
              Request Custom Project
            </Button>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb:3,
          '& .MuiTabs-indicator':{ bgcolor:'#4F46E5' },
          '& .Mui-selected':{ color:'#4F46E5 !important', fontWeight:700 } }}>
          <Tab value="browse" label="Browse Projects" sx={{ textTransform:'none', fontWeight:600 }} />
          <Tab value="purchased" label={`My Projects (${purchases.length})`} sx={{ textTransform:'none', fontWeight:600 }} />
          <Tab value="custom" label={`Custom Requests (${customReqs.length})`} sx={{ textTransform:'none', fontWeight:600 }} />
        </Tabs>

        {tab === 'browse' && (
          <>
            {/* Filters */}
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2} mb={3} flexWrap="wrap">
              <TextField
                placeholder="Search by title, tech stack, description..."
                value={search} onChange={e => setSearch(e.target.value)}
                size="small" sx={{ flex:1, minWidth:200, bgcolor:'white', borderRadius:2, '& .MuiOutlinedInput-root':{ borderRadius:2 } }}
                InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ color:'#94A3B8' }} /></InputAdornment> }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['all','beginner','intermediate','advanced'].map(l => (
                  <Button key={l} size="small" variant={levelFilter===l ? 'contained' : 'outlined'}
                    onClick={() => setLevelFilter(l)}
                    sx={{ borderRadius:99, textTransform:'none', fontWeight:600, px:1.5, fontSize:'0.78rem',
                      ...(levelFilter===l ? { bgcolor:'#4F46E5', '&:hover':{ bgcolor:'#4338CA' } } : { borderColor:'#E2E8F0', color:'#64748B' }) }}>
                    {l === 'all' ? 'All Levels' : l.charAt(0).toUpperCase()+l.slice(1)}
                  </Button>
                ))}
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
              {CATEGORIES.map(c => (
                <Button key={c} size="small" variant={catFilter===c ? 'contained' : 'outlined'}
                  onClick={() => setCatFilter(c)}
                  sx={{ borderRadius:99, textTransform:'none', fontWeight:600, px:2, mb:1, fontSize:'0.78rem',
                    ...(catFilter===c ? { bgcolor:'#7C3AED', '&:hover':{ bgcolor:'#6D28D9' } } : { borderColor:'#E2E8F0', color:'#64748B' }) }}>
                  {c === 'all' ? 'All Categories' : c}
                </Button>
              ))}
            </Stack>

            {loading ? (
              <Box textAlign="center" py={8}><CircularProgress sx={{ color:'#4F46E5' }} /></Box>
            ) : filtered.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography fontSize="2.5rem" mb={1}>📦</Typography>
                <Typography color="text.secondary">No projects found.</Typography>
              </Box>
            ) : (
              <Grid container spacing={{ xs:2, sm:3 }}>
                {filtered.map(p => (
                  <Grid item xs={12} sm={6} md={4} key={p.id}>
                    <ProjectCard project={p} purchased={purchasedIds.has(p.id)} onBuy={setBuyDialog} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {tab === 'purchased' && (
          purchases.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography fontSize="3rem" mb={1}>💼</Typography>
              <Typography color="text.secondary" mb={2}>You haven't purchased any project yet.</Typography>
              <Button variant="contained" onClick={() => setTab('browse')}
                sx={{ bgcolor:'#4F46E5', borderRadius:2, textTransform:'none', fontWeight:700 }}>Browse Projects</Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {purchases.map(p => (
                <Grid item xs={12} sm={6} md={4} key={p.id}>
                  <Card elevation={0} sx={{ border:'1.5px solid #BBF7D0', borderRadius:3, p:2.5, bgcolor:'#F0FDF4', height:'100%' }}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography fontWeight={700} flex={1}>{p.title}</Typography>
                      <CheckCircleIcon sx={{ color:'#059669', fontSize:'1.1rem' }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" fontSize="0.82rem" mb={1.5}
                      sx={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {p.description}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mb={2}>
                      {(p.tech_stack||[]).map(t => (
                        <Chip key={t} label={t} size="small" sx={{ fontSize:'0.7rem', height:22, bgcolor:'white' }} />
                      ))}
                    </Stack>
                    <Button fullWidth variant="contained" size="small" startIcon={<DownloadIcon />}
                      href={p.download_url || '#'} target="_blank"
                      sx={{ borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#059669', '&:hover':{ bgcolor:'#047857' } }}>
                      Download Project
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        )}

        {tab === 'custom' && (
          <>
            <Box mb={3}>
              <Alert severity="info" sx={{ borderRadius:2 }}>
                Submit your project idea and our team will review it. Once approved and priced, you can pay and receive a custom-built solution.
              </Alert>
            </Box>
            {customReqs.length === 0 ? (
              <Box textAlign="center" py={6}>
                <EmojiObjectsIcon sx={{ fontSize:'3rem', color:'#94A3B8', mb:1 }} />
                <Typography color="text.secondary" mb={2}>No custom requests yet.</Typography>
                <Button variant="contained" onClick={() => setCustomDialog(true)}
                  sx={{ bgcolor:'#4F46E5', borderRadius:2, textTransform:'none', fontWeight:700 }}>
                  Submit Request
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {customReqs.map(r => {
                  const sc = CUSTOM_STATUS[r.status] || CUSTOM_STATUS.pending;
                  return (
                    <Card key={r.id} elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:2.5 }}>
                      <Stack direction={{ xs:'column', sm:'row' }} justifyContent="space-between" alignItems={{ sm:'center' }} spacing={1} mb={1.5}>
                        <Typography fontWeight={700} fontSize="1rem">{r.title}</Typography>
                        <Chip size="small" label={sc.label} icon={sc.icon}
                          sx={{ bgcolor:sc.bg, color:sc.color, fontWeight:600, fontSize:'0.75rem' }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" fontSize="0.82rem" mb={1.5}>
                        {r.description}
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        {r.tech_preferences && <Typography variant="caption" color="text.secondary">Tech: {r.tech_preferences}</Typography>}
                        {r.deadline && <Typography variant="caption" color="text.secondary">Deadline: {new Date(r.deadline).toLocaleDateString('en-IN')}</Typography>}
                        {r.budget_paise && <Typography variant="caption" color="text.secondary">Budget: ₹{(r.budget_paise/100).toLocaleString('en-IN')}</Typography>}
                        {r.final_price_paise && <Typography variant="caption" fontWeight={700} color="#4F46E5">Admin Price: ₹{(r.final_price_paise/100).toLocaleString('en-IN')}</Typography>}
                      </Stack>
                      {r.admin_notes && <Alert severity="info" sx={{ mt:1.5, fontSize:'0.78rem', py:0.5 }}>{r.admin_notes}</Alert>}
                      {r.status === 'quoted' && r.final_price_paise && (
                        <Button variant="contained" size="small" sx={{ mt:2, borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#4F46E5' }}>
                          Pay ₹{(r.final_price_paise/100).toLocaleString('en-IN')} to Start
                        </Button>
                      )}
                      {r.status === 'delivered' && r.delivery_url && (
                        <Button variant="contained" size="small" startIcon={<DownloadIcon />}
                          href={r.delivery_url} target="_blank"
                          sx={{ mt:2, borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#059669' }}>
                          Download Delivered Project
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            )}
          </>
        )}
      </Container>

      {/* Buy Confirmation Dialog */}
      <Dialog open={!!buyDialog} onClose={() => setBuyDialog(null)} fullWidth maxWidth="xs"
        PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={700}>Confirm Purchase</DialogTitle>
        <DialogContent>
          <Typography fontWeight={600} mb={0.5}>{buyDialog?.title}</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>{buyDialog?.description}</Typography>
          <Divider sx={{ mb:2 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={600}>Amount to pay:</Typography>
            <Typography fontWeight={800} color="#4F46E5">
              {buyDialog?.price_paise ? `₹${(buyDialog.price_paise/100).toLocaleString('en-IN')}` : 'FREE'}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={() => setBuyDialog(null)} sx={{ textTransform:'none', borderRadius:2, color:'#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={() => handleBuy(buyDialog)}
            sx={{ borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#4F46E5', '&:hover':{ bgcolor:'#4338CA' } }}>
            {buyDialog?.price_paise ? 'Proceed to Pay' : 'Get Free Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Request Dialog */}
      <Dialog open={customDialog} onClose={() => setCustomDialog(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={700} pb={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmojiObjectsIcon sx={{ color:'#F59E0B' }} />
            <span>Submit Custom Project Request</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField label="Project Title *" size="small" fullWidth value={customForm.title}
              onChange={e => setField('title', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
            <TextField label="Project Description *" size="small" fullWidth multiline rows={4}
              value={customForm.description} onChange={e => setField('description', e.target.value)}
              placeholder="Describe what you need — features, modules, purpose..."
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
            <TextField label="Preferred Technologies" size="small" fullWidth value={customForm.tech_preferences}
              onChange={e => setField('tech_preferences', e.target.value)}
              placeholder="e.g. React, Node.js, MySQL"
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField label="Deadline (optional)" size="small" type="date" fullWidth
                value={customForm.deadline} onChange={e => setField('deadline', e.target.value)}
                InputLabelProps={{ shrink:true }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
              <TextField label="Budget (₹)" size="small" type="number" fullWidth
                value={customForm.budget_paise} onChange={e => setField('budget_paise', e.target.value)}
                placeholder="Your expected budget in ₹"
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
            </Stack>
            <Alert severity="warning" sx={{ fontSize:'0.78rem' }}>
              Final price will be set by our team after reviewing your request. Payment is required before work begins.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={() => setCustomDialog(false)} sx={{ textTransform:'none', borderRadius:2, color:'#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCustomSubmit} disabled={submitting}
            sx={{ borderRadius:2, textTransform:'none', fontWeight:700, bgcolor:'#4F46E5', '&:hover':{ bgcolor:'#4338CA' } }}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s=>({...s,open:false}))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.sev} onClose={() => setSnack(s=>({...s,open:false}))} sx={{ borderRadius:2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
      <Footer />
    </Box>
  );
}
