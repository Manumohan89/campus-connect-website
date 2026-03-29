import React, { useState } from 'react';
import {
  Box, Typography, Card, Grid, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Alert, Snackbar, Chip, CircularProgress,
  RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CampaignIcon from '@mui/icons-material/Campaign';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const TYPES = [
  { value:'announcement', label:'📢 Announcement', color:'#4F46E5' },
  { value:'placement',    label:'💼 Placement',    color:'#10B981' },
  { value:'backlog',      label:'⚠️ Backlog Alert',color:'#EF4444' },
  { value:'marks',        label:'📊 Marks',        color:'#F59E0B' },
  { value:'resource',     label:'📚 New Resource', color:'#0EA5E9' },
];
const BRANCHES = ['CSE','ISE','ECE','ME','CV','EEE','AIML','DS'];

const TEMPLATES = [
  { label:'New Placement Drive', type:'placement',
    title:'🏢 New Placement Drive — {Company}',
    body:'A new placement drive has been posted. Check your eligibility and apply before the deadline. Visit Placement Drives to learn more.' },
  { label:'New VTU Resource', type:'resource',
    title:'📚 New Study Resource Added',
    body:'New notes and question papers have been added to VTU Resources. Visit the Resources section to download.' },
  { label:'Exam Reminder', type:'announcement',
    title:'📅 Upcoming Exam Reminder',
    body:'Don\'t forget to check your exam timetable! Make sure you are registered and prepared for your upcoming semester exams.' },
  { label:'Backlog Clear Drive', type:'backlog',
    title:'⚠️ Clear Your Backlogs — Free Courses Available',
    body:'Free backlog clearing courses are now available for all subjects. Enroll in Training Courses to access them.' },
];

export default function AdminNotifications() {
  const [form, setForm] = useState({ title:'', body:'', link:'', type:'announcement', target:'all', branch:'' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [snack, setSnack] = useState({ open:false, msg:'', severity:'success' });
  const [history, setHistory] = useState([]);

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleSend = async () => {
    if (!form.title || !form.body) { setSnack({ open:true, msg:'Title and body required', severity:'error' }); return; }
    setSending(true); setResult(null);
    try {
      const res = await adminApi.post('/notify', form);
      setResult(res.data);
      setHistory(h => [{ ...form, sent: res.data.sent, time: new Date().toLocaleTimeString() }, ...h.slice(0,9)]);
      setSnack({ open:true, msg:`✅ Sent to ${res.data.sent} users`, severity:'success' });
      setForm(f => ({ ...f, title:'', body:'', link:'' }));
    } catch (e) {
      setSnack({ open:true, msg:e.response?.data?.error || 'Failed to send', severity:'error' });
    } finally { setSending(false); }
  };

  const applyTemplate = (t) => {
    setForm(f => ({ ...f, title: t.title, body: t.body, type: t.type }));
  };

  return (
    <AdminLayout>
      <Box sx={{ mb:3 }}>
        <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Broadcast Notifications</Typography>
        <Typography color="text.secondary" fontSize="0.875rem">Send notifications to all users or specific branches</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Compose */}
          <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3, mb:3 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
              <Box sx={{ width:40, height:40, borderRadius:'10px', bgcolor:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CampaignIcon sx={{ color:'#4F46E5', fontSize:22 }} />
              </Box>
              <Typography fontWeight={800} fontSize="1rem">Compose Notification</Typography>
            </Box>

            {/* Type */}
            <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:2.5 }}>
              {TYPES.map(t => (
                <Chip key={t.value} label={t.label} onClick={() => set('type', t.value)} clickable
                  sx={{ bgcolor: form.type===t.value ? t.color : '#F1F5F9',
                    color: form.type===t.value ? 'white' : '#374151', fontWeight:700, fontSize:'0.78rem' }} />
              ))}
            </Box>

            <TextField fullWidth label="Notification Title *" value={form.title} onChange={e=>set('title',e.target.value)}
              sx={{ mb:2, '& .MuiOutlinedInput-root':{ borderRadius:'12px' } }} />
            <TextField fullWidth multiline rows={4} label="Message Body *" value={form.body} onChange={e=>set('body',e.target.value)}
              sx={{ mb:2, '& .MuiOutlinedInput-root':{ borderRadius:'12px' } }} />
            <TextField fullWidth label="Link (optional)" value={form.link} onChange={e=>set('link',e.target.value)}
              placeholder="/placement-drives" sx={{ mb:2.5, '& .MuiOutlinedInput-root':{ borderRadius:'12px' } }} />

            {/* Target */}
            <Typography fontWeight={700} fontSize="0.875rem" mb={1}>Target Audience</Typography>
            <RadioGroup row value={form.target} onChange={e=>set('target',e.target.value)} sx={{ mb: form.target==='branch' ? 1.5 : 2.5 }}>
              <FormControlLabel value="all" control={<Radio sx={{ color:'#4F46E5', '&.Mui-checked':{ color:'#4F46E5' } }} />} label="All users" />
              <FormControlLabel value="branch" control={<Radio sx={{ color:'#4F46E5', '&.Mui-checked':{ color:'#4F46E5' } }} />} label="Specific branch" />
            </RadioGroup>

            {form.target === 'branch' && (
              <FormControl fullWidth size="small" sx={{ mb:2.5 }}>
                <InputLabel>Select Branch</InputLabel>
                <Select value={form.branch} onChange={e=>set('branch',e.target.value)} label="Select Branch" sx={{ borderRadius:'12px' }}>
                  {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            )}

            <Button fullWidth variant="contained" size="large" onClick={handleSend} disabled={sending}
              startIcon={sending ? null : <SendIcon />}
              sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', fontWeight:700, borderRadius:'12px', textTransform:'none', py:1.5, boxShadow:'none' }}>
              {sending ? <><CircularProgress size={18} sx={{ color:'white', mr:1 }}/> Sending...</> : `Send to ${form.target==='all' ? 'All Users' : form.branch || 'Branch'}`}
            </Button>

            {result && (
              <Alert severity="success" sx={{ mt:2, borderRadius:'12px' }}>
                ✅ Notification sent to <strong>{result.sent}</strong> users successfully
              </Alert>
            )}
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3 }}>
              <Typography fontWeight={700} mb={2}>Recent Broadcasts (this session)</Typography>
              {history.map((h, i) => (
                <Box key={i} sx={{ py:1.5, borderBottom:i<history.length-1?'1px solid #F3F4F6':'none', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <Box>
                    <Typography fontWeight={700} fontSize="0.875rem">{h.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {h.target==='all' ? 'All users' : `Branch: ${h.branch}`} · Sent at {h.time}
                    </Typography>
                  </Box>
                  <Chip label={`${h.sent} sent`} size="small" sx={{ bgcolor:'#D1FAE5', color:'#065F46', fontWeight:700 }} />
                </Box>
              ))}
            </Card>
          )}
        </Grid>

        {/* Templates */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3 }}>
            <Typography fontWeight={800} fontSize="0.95rem" mb={2}>Quick Templates</Typography>
            {TEMPLATES.map((t, i) => (
              <Box key={i} onClick={() => applyTemplate(t)}
                sx={{ p:2, border:'1.5px solid #E5E7EB', borderRadius:'12px', mb:1.5, cursor:'pointer', transition:'all 0.15s',
                  '&:hover':{ borderColor:'#4F46E5', bgcolor:'#EEF2FF' } }}>
                <Typography fontWeight={700} fontSize="0.85rem">{t.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt:0.25 }}>
                  {t.title.slice(0,50)}...
                </Typography>
                <Chip label={t.type} size="small" sx={{ mt:0.75, bgcolor:'#F1F5F9', fontSize:'0.65rem', height:18 }} />
              </Box>
            ))}
            <Alert severity="info" sx={{ mt:2, borderRadius:'10px', fontSize:'0.78rem' }}>
              Click any template to prefill the form. Customize before sending.
            </Alert>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s=>({...s,open:false}))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius:'12px' }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
