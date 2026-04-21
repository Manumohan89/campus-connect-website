import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, TextField, Button, Alert, Stack,
  CircularProgress, Snackbar, LinearProgress, Switch, IconButton, InputAdornment
} from '@mui/material';
import { Lock, Security, DeleteForever, Visibility, VisibilityOff, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useThemeMode } from '../ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Footer from './Footer';
import api from '../utils/api';

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const S_LABEL = ['','Weak','Fair','Good','Strong','Very Strong'];
const S_COLOR = ['','#EF4444','#F59E0B','#F59E0B','#10B981','#059669'];

function SectionCard({ title, subtitle, icon, children }) {
  return (
    <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'20px', p:3, mb:3 }}>
      <Box sx={{ display:'flex', gap:2, alignItems:'flex-start', mb:3 }}>
        <Box sx={{ width:44, height:44, borderRadius:'12px', bgcolor:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {React.cloneElement(icon, { sx:{ color:'#4F46E5', fontSize:22 } })}
        </Box>
        <Box>
          <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif">{title}</Typography>
          <Typography fontSize="0.8rem" color="text.secondary">{subtitle}</Typography>
        </Box>
      </Box>
      {children}
    </Card>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const [pw, setPw] = useState({ current:'', newPw:'', confirm:'' });
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [snack, setSnack] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub));
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) { setPwError("New passwords don't match"); return; }
    if (pw.newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    setPwError(''); setPwLoading(true);
    try {
      await api.post('/users/change-password', { currentPassword: pw.current, newPassword: pw.newPw });
      setSnack('Password changed successfully!');
      setPw({ current:'', newPw:'', confirm:'' });
    } catch (e) {
      setPwError(e.response?.data?.error || 'Failed to change password');
    }
    setPwLoading(false);
  };

  const togglePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSnack('Push notifications are not supported in this browser'); return;
    }
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) { await sub.unsubscribe(); await api.delete('/users/push-subscribe').catch(() => {}); }
        setPushEnabled(false);
        setSnack('Push notifications disabled');
      } else {
        const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBrqLDBRNTvgXXc7c';
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
        await api.post('/users/push-subscribe', {
          endpoint: sub.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth'))))
        }).catch(() => {});
        setPushEnabled(true);
        setSnack('Push notifications enabled! You will get alerts for drives and exam dates.');
      }
    } catch (e) { setSnack('Could not enable push notifications: ' + e.message); }
    setPushLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setDeleteConfirmText('');
      return;
    }
    if (deleteConfirmText !== 'DELETE') {
      setSnack('Type DELETE to confirm'); return;
    }
    setDeleteLoading(true);
    try {
      await api.delete('/users/account');
      localStorage.clear();
      navigate('/');
    } catch (e) {
      setSnack(e.response?.data?.error || 'Failed to delete account');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const s = strength(pw.newPw);

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#1E1B4B,#4F46E5)', py:5, px:2 }}>
        <Container>
          <Typography variant="h4" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">Settings</Typography>
          <Typography color="rgba(255,255,255,0.7)" mt={0.5}>Manage your account, security, and preferences</Typography>
        </Container>
      </Box>

      <Container sx={{ py:4, flex:1 }} maxWidth="md">

        {/* Dark Mode */}
        <SectionCard title="Appearance" subtitle="Customize how Campus Connect looks" icon={<DarkModeIcon />}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Box>
              <Typography fontSize="0.875rem" fontWeight={600}>Dark Mode</Typography>
              <Typography fontSize="0.78rem" color="text.secondary" mt={0.3}>
                {mode === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
              </Typography>
            </Box>
            <Switch checked={mode === 'dark'} onChange={toggleMode} color="primary" />
          </Box>
        </SectionCard>

        {/* Push Notifications */}
        <SectionCard title="Push Notifications" subtitle="Get alerts for placement drives, exam dates and more" icon={<NotificationsIcon />}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Box>
              <Typography fontSize="0.875rem" fontWeight={600}>Browser Push Notifications</Typography>
              <Typography fontSize="0.78rem" color="text.secondary" mt={0.3}>
                {pushEnabled ? 'Enabled — you will receive push alerts' : 'Disabled — enable to get alerts even when app is closed'}
              </Typography>
            </Box>
            {pushLoading ? <CircularProgress size={24} /> : (
              <Switch checked={pushEnabled} onChange={togglePushNotifications} color="primary" />
            )}
          </Box>
          {'Notification' in window && Notification.permission === 'denied' && (
            <Alert severity="warning" sx={{ mt:1.5, borderRadius:'10px', fontSize:'0.78rem' }}>
              Notifications blocked. Go to Site Settings → Notifications → Allow.
            </Alert>
          )}
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password" subtitle="Update your login password" icon={<Lock />}>
          <form onSubmit={handleChangePw}>
            <Stack spacing={2}>
              {pwError && <Alert severity="error" sx={{ borderRadius:'10px' }}>{pwError}</Alert>}
              <TextField size="small" label="Current Password" type={showCur ? 'text' : 'password'}
                value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowCur(s => !s)}>{showCur ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
              <TextField size="small" label="New Password" type={showNew ? 'text' : 'password'}
                value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))}
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowNew(s => !s)}>{showNew ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
              {pw.newPw.length > 0 && (
                <Box>
                  <LinearProgress variant="determinate" value={(s / 5) * 100}
                    sx={{ height:4, borderRadius:2, bgcolor:'#F1F5F9', '& .MuiLinearProgress-bar':{ bgcolor: S_COLOR[s] } }} />
                  <Typography fontSize="0.72rem" color={S_COLOR[s]} mt={0.5}>{S_LABEL[s]}</Typography>
                </Box>
              )}
              <TextField size="small" label="Confirm New Password" type="password"
                value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
              <Button type="submit" variant="contained" disabled={pwLoading || !pw.current || !pw.newPw || !pw.confirm}
                startIcon={pwLoading && <CircularProgress size={16} sx={{ color:'#fff' }} />}
                sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
                {pwLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </Stack>
          </form>
        </SectionCard>

        {/* Account Deletion */}
        <SectionCard title="Account" subtitle="Manage your account data" icon={<Security />}>
          <Box>
            <Typography fontSize="0.875rem" fontWeight={600} mb={0.5} color="#EF4444">Delete Account</Typography>
            <Typography fontSize="0.78rem" color="text.secondary" mb={2}>
              Permanently delete your account and all data. This cannot be undone.
            </Typography>
            {showDeleteConfirm && (
              <Box mb={2}>
                <Alert severity="error" sx={{ mb:1.5, borderRadius:'10px' }}>
                  Type <strong>DELETE</strong> below to confirm permanent account deletion.
                </Alert>
                <TextField size="small" fullWidth placeholder='Type DELETE to confirm'
                  value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
              </Box>
            )}
            <Button variant="outlined" color="error" onClick={handleDeleteAccount} disabled={deleteLoading}
              startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteForever />}
              sx={{ textTransform:'none', fontWeight:700, borderRadius:'10px' }}>
              {deleteLoading ? 'Deleting...' : showDeleteConfirm ? 'Confirm Delete' : 'Delete My Account'}
            </Button>
            {showDeleteConfirm && (
              <Button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                sx={{ ml:1, textTransform:'none', color:'#6B7280' }}>
                Cancel
              </Button>
            )}
          </Box>
        </SectionCard>

      </Container>
      <Footer />
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
    </Box>
  );
}
