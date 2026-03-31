import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, TextField, InputAdornment, CircularProgress, Avatar, Button, Alert,
  Tab, Tabs, Snackbar, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B'];
const CAT_COLORS = { backlog_clearing:'#EF4444', upskill:'#7C3AED', placement:'#10B981' };

export default function AdminCertificates() {
  const [tab, setTab]         = useState(0);
  const [issued, setIssued]   = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [approving, setApproving] = useState(null);
  const [snack, setSnack]     = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [issuedRes, pendingRes] = await Promise.all([
        adminApi.get('/certificates'),
        adminApi.get('/certificates/pending'),
      ]);
      setIssued(issuedRes.data || []);
      setPending(pendingRes.data || []);
    } catch {}
    setLoading(false);
  };

  const approveCert = async (enrollmentId, studentName) => {
    setApproving(enrollmentId);
    try {
      const r = await adminApi.post(`/certificates/approve/${enrollmentId}`);
      setSnack(`✅ Certificate issued to ${studentName}! ID: ${r.data.certificate_id}`);
      await load();
    } catch (e) {
      setSnack('❌ Failed: ' + (e.response?.data?.error || 'Unknown error'));
    }
    setApproving(null);
  };

  const filter = (list) => !search ? list : list.filter(c =>
    (c.full_name||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.username||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.course_title||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.certificate_id||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ mb:3, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Certificates</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">
            Issue and manage student certificates
          </Typography>
        </Box>
        <Box sx={{ display:'flex', gap:1.5 }}>
          <Chip icon={<HourglassEmptyIcon sx={{ fontSize:'14px !important' }}/>} label={`${pending.length} Pending`}
            sx={{ bgcolor:'#FEF9C3', color:'#92400E', fontWeight:700 }} />
          <Chip icon={<EmojiEventsIcon sx={{ fontSize:'14px !important' }}/>} label={`${issued.length} Issued`}
            sx={{ bgcolor:'#D1FAE5', color:'#065F46', fontWeight:700 }} />
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ mb:3, '& .MuiTab-root':{ textTransform:'none', fontWeight:700 }, '& .Mui-selected':{ color:'#4F46E5' }, '& .MuiTabs-indicator':{ bgcolor:'#4F46E5' } }}>
        <Tab label={`Pending Approval (${pending.length})`} />
        <Tab label={`Issued Certificates (${issued.length})`} />
      </Tabs>

      <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'14px', p:2, mb:3 }}>
        <TextField fullWidth size="small" placeholder="Search student, course, certificate ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ color:'#9CA3AF', fontSize:18 }}/></InputAdornment> }}
          sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
      </Card>

      {loading ? (
        <Box sx={{ display:'flex', justifyContent:'center', py:6 }}><CircularProgress /></Box>
      ) : tab === 0 ? (
        // PENDING APPROVAL TAB
        <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden' }}>
          {pending.length === 0 ? (
            <Box sx={{ textAlign:'center', py:8, color:'#9CA3AF' }}>
              <CheckCircleIcon sx={{ fontSize:48, color:'#D1FAE5', mb:2, display:'block', mx:'auto' }} />
              <Typography fontWeight={600}>No pending certificates</Typography>
              <Typography fontSize="0.85rem" mt={0.5}>Students need to complete ≥80% of a course to be eligible</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX:'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                    {['Student','Branch','Course','Progress','Enrolled','Action'].map(h => (
                      <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.7rem', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', py:1.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filter(pending).map((c, i) => (
                    <TableRow key={c.enrollment_id} sx={{ '&:hover':{ bgcolor:'#FAFAFA' } }}>
                      <TableCell sx={{ py:1.5 }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1.25 }}>
                          <Avatar sx={{ width:28, height:28, bgcolor:COLORS[i%COLORS.length], fontSize:'0.7rem', fontWeight:800 }}>
                            {c.full_name?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={700} fontSize="0.82rem">{c.full_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{c.username}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Typography fontSize="0.8rem">{c.branch||'—'}</Typography></TableCell>
                      <TableCell sx={{ maxWidth:200 }}>
                        <Typography fontSize="0.8rem" fontWeight={600} sx={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {c.course_title}
                        </Typography>
                        <Chip label={c.category||'—'} size="small"
                          sx={{ bgcolor:`${CAT_COLORS[c.category]||'#9CA3AF'}18`, color:CAT_COLORS[c.category]||'#9CA3AF', fontWeight:700, fontSize:'0.6rem', mt:0.3 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={`${c.progress}%`} size="small"
                          sx={{ bgcolor: c.progress >= 100 ? '#D1FAE5' : '#FEF9C3', color: c.progress >= 100 ? '#065F46' : '#92400E', fontWeight:700 }} />
                      </TableCell>
                      <TableCell>
                        <Typography fontSize="0.75rem" color="#9CA3AF">
                          {new Date(c.enrolled_at).toLocaleDateString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" startIcon={approving === c.enrollment_id ? <CircularProgress size={12} sx={{ color:'#fff' }} /> : <EmojiEventsIcon sx={{ fontSize:'14px !important' }}/>}
                          onClick={() => approveCert(c.enrollment_id, c.full_name)}
                          disabled={approving === c.enrollment_id}
                          sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, fontSize:'0.75rem', boxShadow:'none', borderRadius:'8px' }}>
                          Issue Certificate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Card>
      ) : (
        // ISSUED CERTIFICATES TAB
        <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden' }}>
          <Box sx={{ overflowX:'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                  {['Student','Branch','Course','Category','Certificate ID','Date','Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.7rem', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', py:1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filter(issued).map((c, i) => (
                  <TableRow key={i} sx={{ '&:hover':{ bgcolor:'#FAFAFA' } }}>
                    <TableCell sx={{ py:1.5 }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1.25 }}>
                        <Avatar sx={{ width:28, height:28, bgcolor:COLORS[i%COLORS.length], fontSize:'0.7rem', fontWeight:800 }}>
                          {c.full_name?.[0]||'U'}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700} fontSize="0.82rem">{c.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography fontSize="0.8rem">{c.branch||'—'}</Typography></TableCell>
                    <TableCell sx={{ maxWidth:200 }}>
                      <Typography fontSize="0.8rem" fontWeight={600} sx={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {c.course_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={c.category||'—'} size="small"
                        sx={{ bgcolor:`${CAT_COLORS[c.category]||'#9CA3AF'}18`, color:CAT_COLORS[c.category]||'#9CA3AF', fontWeight:700, fontSize:'0.65rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography fontFamily="monospace" fontWeight={700} fontSize="0.75rem" color="#4F46E5">{c.certificate_id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize="0.75rem" color="#9CA3AF">
                        {c.completed_at ? new Date(c.completed_at).toLocaleDateString('en-IN') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button size="small" endIcon={<OpenInNewIcon sx={{ fontSize:'13px !important' }}/>}
                        href={`/certificate/${c.certificate_id}`} target="_blank"
                        sx={{ textTransform:'none', fontWeight:700, color:'#4F46E5', fontSize:'0.75rem', p:'4px 10px' }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filter(issued).length === 0 && (
                  <TableRow><TableCell colSpan={7} sx={{ textAlign:'center', py:6, color:'#9CA3AF' }}>
                    No issued certificates
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
    </AdminLayout>
  );
}
