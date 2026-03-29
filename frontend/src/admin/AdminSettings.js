import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Grid, CircularProgress, Alert, Chip,
  Button, TextField, Snackbar, Divider, List, ListItem, ListItemText
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

export default function AdminSettings() {
  const [sysInfo, setSysInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open:false, msg:'', severity:'success' });
  const [testNotif, setTestNotif] = useState({ title:'', body:'' });

  const loadSysInfo = () => {
    setLoading(true);
    adminApi.get('/system-info')
      .then(r => setSysInfo(r.data))
      .catch(() => setSysInfo(null))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadSysInfo(); }, []);

  const sendTest = async () => {
    if (!testNotif.title) return;
    try {
      const res = await adminApi.post('/notify', { ...testNotif, target:'all', type:'announcement' });
      setSnack({ open:true, msg:`Test sent to ${res.data.sent} users`, severity:'success' });
    } catch (e) {
      setSnack({ open:true, msg:e.response?.data?.error || 'Failed', severity:'error' });
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb:3 }}>
        <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">System Settings</Typography>
        <Typography color="text.secondary" fontSize="0.875rem">Server health, database info, and platform configuration</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* System info */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3 }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2.5 }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                <Box sx={{ width:38, height:38, borderRadius:'10px', bgcolor:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <StorageIcon sx={{ color:'#4F46E5', fontSize:20 }} />
                </Box>
                <Typography fontWeight={800}>System Health</Typography>
              </Box>
              <Button size="small" startIcon={<RefreshIcon />} onClick={loadSysInfo} sx={{ textTransform:'none', borderRadius:'8px' }}>Refresh</Button>
            </Box>

            {loading ? <CircularProgress size={24} /> : sysInfo ? (
              <List disablePadding>
                {[
                  ['Database Size', sysInfo.db_size || '—'],
                  ['Tables', sysInfo.table_count],
                  ['Node.js Version', sysInfo.node_version],
                  ['Server Uptime', `${sysInfo.uptime_hours}h`],
                  ['Checked At', new Date(sysInfo.checked_at).toLocaleString('en-IN')],
                ].map(([label, val]) => (
                  <ListItem key={label} sx={{ px:0, py:1.25, borderBottom:'1px solid #F3F4F6' }}>
                    <ListItemText
                      primary={<Typography fontSize="0.8rem" color="text.secondary" fontWeight={600}>{label}</Typography>}
                      secondary={<Typography fontSize="0.9rem" fontWeight={700} color="#111827">{val}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="error" sx={{ borderRadius:'10px' }}>Could not load system info</Alert>
            )}

            <Divider sx={{ my:2.5 }} />
            <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
              <Chip label="🟢 API Running" sx={{ bgcolor:'#D1FAE5', color:'#065F46', fontWeight:700 }} />
              <Chip label="🔒 JWT Auth Active" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontWeight:700 }} />
              <Chip label="📧 Email Enabled" sx={{ bgcolor:'#FEF9C3', color:'#92400E', fontWeight:700 }} />
            </Box>
          </Card>
        </Grid>

        {/* Admin info */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3, mb:3 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2.5 }}>
              <Box sx={{ width:38, height:38, borderRadius:'10px', bgcolor:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <SecurityIcon sx={{ color:'#10B981', fontSize:20 }} />
              </Box>
              <Typography fontWeight={800}>Security Info</Typography>
            </Box>
            <List disablePadding>
              {[
                ['Admin Route', '/admin-portal-9823 (hidden)'],
                ['Auth', 'JWT (7 day expiry + auto-refresh)'],
                ['Password', 'bcrypt hashed'],
                ['File Uploads', 'multer + disk storage'],
                ['Rate Limiting', 'express-rate-limit active'],
              ].map(([label, val]) => (
                <ListItem key={label} sx={{ px:0, py:1, borderBottom:'1px solid #F3F4F6' }}>
                  <ListItemText
                    primary={<Typography fontSize="0.78rem" color="text.secondary" fontWeight={600}>{label}</Typography>}
                    secondary={<Typography fontSize="0.85rem" fontWeight={600} color="#374151">{val}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Quick Notification Test */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2.5 }}>
              <Box sx={{ width:38, height:38, borderRadius:'10px', bgcolor:'#FFF7ED', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CodeIcon sx={{ color:'#F97316', fontSize:20 }} />
              </Box>
              <Typography fontWeight={800}>Quick Notification Test</Typography>
            </Box>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" label="Title" value={testNotif.title}
                  onChange={e=>setTestNotif(n=>({...n,title:e.target.value}))}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField fullWidth size="small" label="Body" value={testNotif.body}
                  onChange={e=>setTestNotif(n=>({...n,body:e.target.value}))}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button fullWidth variant="contained" onClick={sendTest} disabled={!testNotif.title}
                  sx={{ background:'linear-gradient(135deg,#F97316,#EA580C)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
                  Send Test
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s=>({...s,open:false}))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius:'12px' }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
