import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, TextField, Button, Alert, Stack,
  CircularProgress, Snackbar, LinearProgress, Switch, IconButton, InputAdornment,
  Divider, Grid, Chip
} from '@mui/material';
import Lock from '@mui/icons-material/Lock';
import Security from '@mui/icons-material/Security';
import DeleteForever from '@mui/icons-material/DeleteForever';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import PrivacyIcon from '@mui/icons-material/PrivacyTip';
import GetAppIcon from '@mui/icons-material/GetApp';
import InfoIcon from '@mui/icons-material/Info';
import EmailIcon from '@mui/icons-material/Email';
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

function SectionCard({ title, subtitle, icon, children, isDark }) {
  return (
    <Card elevation={0} sx={{
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
      borderRadius:'16px',
      p:3,
      mb:2,
      background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
      backdropFilter:'blur(8px)'
    }}>
      <Box sx={{ display:'flex', gap:2, alignItems:'flex-start', mb:3 }}>
        <Box sx={{ width:44, height:44, borderRadius:'12px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {React.cloneElement(icon, { sx:{ color:'white', fontSize:22 } })}
        </Box>
        <Box sx={{ flex:1 }}>
          <Typography fontWeight={800} fontFamily="'Syne',sans-serif" fontSize="1rem" color={isDark ? '#F8FAFC' : '#111827'}>{title}</Typography>
          <Typography fontSize="0.78rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} mt={0.3}>{subtitle}</Typography>
        </Box>
      </Box>
      {children}
    </Card>
  );
}

const SETTINGS_MENU = [
  { id:'account', label:'Account', icon:<InfoIcon fontSize="small" />, color:'#4F46E5' },
  { id:'appearance', label:'Appearance', icon:<DarkModeIcon fontSize="small" />, color:'#7C3AED' },
  { id:'notifications', label:'Notifications', icon:<NotificationsIcon fontSize="small" />, color:'#0EA5E9' },
  { id:'privacy', label:'Privacy & Security', icon:<PrivacyIcon fontSize="small" />, color:'#10B981' },
  { id:'email', label:'Email Preferences', icon:<EmailIcon fontSize="small" />, color:'#F59E0B' },
  { id:'password', label:'Change Password', icon:<Lock fontSize="small" />, color:'#EF4444' },
  { id:'data', label:'Data & Export', icon:<GetAppIcon fontSize="small" />, color:'#059669' },
  { id:'danger', label:'Danger Zone', icon:<DeleteForever fontSize="small" />, color:'#DC2626' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';
  const [activeTab, setActiveTab] = useState('account');
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
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [userData, setUserData] = useState({ email:'', username:'', joinedDate:'', totalStudyTime:0 });
  const [emailPrefs, setEmailPrefs] = useState({ newsletter:true, drives:true, deadlines:true, updates:true });
  const [privacySettings, setPrivacySettings] = useState({ profilePublic:false, showStats:true, allowMessages:true });

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub));
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      setSettingsLoading(true);
      try {
        const { data } = await api.get('/users/settings');
        setUserData({
          email: data?.account?.email || '',
          username: data?.account?.username || '',
          joinedDate: data?.account?.createdAt || '',
          totalStudyTime: 0
        });
        setEmailPrefs(data?.emailPrefs || { newsletter:true, drives:true, deadlines:true, updates:true });
        setPrivacySettings(data?.privacySettings || { profilePublic:false, showStats:true, allowMessages:true });
      } catch (error) {
        setSnack(error.response?.data?.error || 'Could not load settings. Please refresh and try again.');
      } finally {
        setSettingsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const savePreferences = async (section) => {
    setSettingsSaving(true);
    try {
      await api.put('/users/settings', { emailPrefs, privacySettings });
      setSnack(section === 'email' ? 'Email preferences saved with cinematic precision.' : 'Privacy settings updated successfully.');
    } catch (error) {
      setSnack(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

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
        setSnack('Push notifications enabled!');
      }
    } catch (e) { setSnack('Could not toggle notifications: ' + e.message); }
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

  const exportData = () => {
    const data = { userData, emailPrefs, privacySettings, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-connect-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setSnack('Data exported successfully!');
  };

  const s = strength(pw.newPw);

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor: isDark ? '#0F172A' : '#F8FAFC' }}>
      <Header />
      
      {/* Hero Banner */}
      <Box sx={{ background: isDark ? 'linear-gradient(135deg,#1E293B,#0F172A)' : 'linear-gradient(135deg,#1E1B4B,#4F46E5)', py:5, px:2, borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
        <Container>
          <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
            <SettingsIcon sx={{ fontSize:32, color:'white' }} />
            <Box>
              <Typography variant="h4" fontWeight={900} color="white" fontFamily="'Syne',sans-serif">Settings</Typography>
              <Typography color="rgba(255,255,255,0.7)" mt={0.5}>Manage your account, preferences & security</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py:4, flex:1 }}>
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Card elevation={0} sx={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden', position:{ md:'sticky' }, top:{ md:100 } }}>
              {SETTINGS_MENU.map((item, i) => (
                <Box key={item.id}>
                  <Box onClick={() => setActiveTab(item.id)} sx={{
                    display:'flex', alignItems:'center', gap:2, px:3, py:2.5,
                    cursor:'pointer',
                    bgcolor: activeTab === item.id ? isDark ? 'rgba(79,70,229,0.15)' : 'rgba(79,70,229,0.08)' : 'transparent',
                    borderLeft: activeTab === item.id ? `4px solid ${item.color}` : '4px solid transparent',
                    transition:'all 0.2s',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)' }
                  }}>
                    <Box sx={{ color: activeTab === item.id ? item.color : isDark ? '#94A3B8' : '#9CA3AF', display:'flex' }}>{item.icon}</Box>
                    <Typography sx={{ fontWeight: activeTab === item.id ? 700 : 500, color: activeTab === item.id ? isDark ? '#F1F5F9' : '#111827' : isDark ? '#CBD5E1' : '#6B7280', fontSize:'0.9rem' }}>{item.label}</Typography>
                  </Box>
                  {i < SETTINGS_MENU.length - 1 && <Divider sx={{ my:0 }} />}
                </Box>
              ))}
            </Card>
          </Grid>

          {/* Content */}
          <Grid item xs={12} md={9}>
            {settingsLoading && (
              <Card elevation={0} sx={{ border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', p:2, mb:2, background:'rgba(255,255,255,0.03)', backdropFilter:'blur(8px)' }}>
                <LinearProgress sx={{ borderRadius: 999, height: 6 }} />
                <Typography mt={1.5} fontSize="0.82rem" color={isDark ? '#CBD5E1' : '#6B7280'}>
                  Loading your settings...
                </Typography>
              </Card>
            )}
            {/* Account Section */}
            {activeTab === 'account' && (
              <>
                <SectionCard title="Account Information" subtitle="Your profile details" icon={<InfoIcon />} isDark={isDark}>
                  <Stack spacing={2}>
                    <Box sx={{ p:2, background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius:'12px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB' }}>
                      <Typography fontSize="0.75rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} textTransform="uppercase" fontWeight={700} letterSpacing={0.5} mb={0.5}>Email</Typography>
                      <Typography fontWeight={600} color={isDark ? '#F1F5F9' : '#111827'}>
                        {userData.email || 'Not available'}
                      </Typography>
                    </Box>
                    <Box sx={{ p:2, background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius:'12px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB' }}>
                      <Typography fontSize="0.75rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} textTransform="uppercase" fontWeight={700} letterSpacing={0.5} mb={0.5}>Member Since</Typography>
                      <Typography fontWeight={600} color={isDark ? '#F1F5F9' : '#111827'}>
                        {userData.joinedDate ? new Date(userData.joinedDate).toLocaleDateString() : 'Not available'}
                      </Typography>
                    </Box>
                    <Box sx={{ p:2, background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius:'12px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB' }}>
                      <Typography fontSize="0.75rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} textTransform="uppercase" fontWeight={700} letterSpacing={0.5} mb={0.5}>Account Status</Typography>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <Chip label="Active" size="small" sx={{ bgcolor:'#10B98122', color:'#10B981', fontWeight:700 }} />
                        <Chip label="Verified" size="small" sx={{ bgcolor:'#0EA5E922', color:'#0EA5E9', fontWeight:700 }} />
                      </Box>
                    </Box>
                  </Stack>
                </SectionCard>
              </>
            )}

            {/* Appearance Section */}
            {activeTab === 'appearance' && (
              <SectionCard title="Appearance" subtitle="Customize how Campus Connect looks" icon={<DarkModeIcon />} isDark={isDark}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:2, background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius:'12px' }}>
                  <Box>
                    <Typography fontSize="0.9rem" fontWeight={600} color={isDark ? '#F1F5F9' : '#111827'}>Dark Mode</Typography>
                    <Typography fontSize="0.78rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} mt={0.3}>
                      {mode === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                    </Typography>
                  </Box>
                  <Switch checked={mode === 'dark'} onChange={toggleMode} color="primary" />
                </Box>
              </SectionCard>
            )}

            {/* Notifications Section */}
            {activeTab === 'notifications' && (
              <>
                <SectionCard title="Push Notifications" subtitle="Get instant alerts"   icon={<NotificationsIcon />} isDark={isDark}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:2, background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius:'12px' }}>
                    <Box>
                      <Typography fontSize="0.9rem" fontWeight={600} color={isDark ? '#F1F5F9' : '#111827'}>Browser Push Notifications</Typography>
                      <Typography fontSize="0.78rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} mt={0.3}>
                        {pushEnabled ? 'Enabled — you will receive alerts' : 'Disabled — enable for alerts'}
                      </Typography>
                    </Box>
                    {pushLoading ? <CircularProgress size={24} /> : <Switch checked={pushEnabled} onChange={togglePushNotifications} color="primary" />}
                  </Box>
                </SectionCard>
              </>
            )}

            {/* Email Preferences */}
            {activeTab === 'email' && (
              <SectionCard title="Email Preferences" subtitle="Choose what emails you receive" icon={<EmailIcon />} isDark={isDark}>
                <Stack spacing={2}>
                  {Object.entries(emailPrefs).map(([key, val]) => (
                    <Box key={key} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:2, background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius:'12px' }}>
                      <Typography fontSize="0.9rem" fontWeight={600} color={isDark ? '#F1F5F9' : '#111827'} sx={{ textTransform:'capitalize' }}>
                        {key === 'newsletter' ? 'Newsletters' : key === 'drives' ? 'Placement Drives' : key === 'deadlines' ? 'Important Deadlines' : 'Product Updates'}
                      </Typography>
                      <Switch checked={val} onChange={() => setEmailPrefs(e => ({ ...e, [key]: !val }))} color="primary" />
                    </Box>
                  ))}
                  <Button
                    variant="contained"
                    disabled={settingsSaving}
                    onClick={() => savePreferences('email')}
                    sx={{ alignSelf:'flex-start', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:'10px' }}
                  >
                    {settingsSaving ? 'Saving...' : 'Save Email Preferences'}
                  </Button>
                </Stack>
              </SectionCard>
            )}

            {/* Privacy Section */}
            {activeTab === 'privacy' && (
              <SectionCard title="Privacy & Security" subtitle="Control your account privacy" icon={<PrivacyIcon />} isDark={isDark}>
                <Stack spacing={2}>
                  {Object.entries(privacySettings).map(([key, val]) => (
                    <Box key={key} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:2, background: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius:'12px' }}>
                      <Box>
                        <Typography fontSize="0.9rem" fontWeight={600} color={isDark ? '#F1F5F9' : '#111827'} sx={{ textTransform:'capitalize' }}>
                          {key === 'profilePublic' ? 'Public Profile' : key === 'showStats' ? 'Show Statistics' : 'Allow Messages'}
                        </Typography>
                        <Typography fontSize="0.75rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} mt={0.3}>
                          {key === 'profilePublic' ? 'Let others see your profile' : key === 'showStats' ? 'Display your stats on leaderboard' : 'Allow others to message you'}
                        </Typography>
                      </Box>
                      <Switch checked={val} onChange={() => setPrivacySettings(p => ({ ...p, [key]: !val }))} color="primary" />
                    </Box>
                  ))}
                  <Button
                    variant="contained"
                    disabled={settingsSaving}
                    onClick={() => savePreferences('privacy')}
                    sx={{ alignSelf:'flex-start', background:'linear-gradient(135deg,#10B981,#059669)', textTransform:'none', fontWeight:700, borderRadius:'10px' }}
                  >
                    {settingsSaving ? 'Saving...' : 'Save Privacy Settings'}
                  </Button>
                </Stack>
              </SectionCard>
            )}

            {/* Password Section */}
            {activeTab === 'password' && (
              <SectionCard title="Change Password" subtitle="Update your login password" icon={<Lock />} isDark={isDark}>
                <form onSubmit={handleChangePw}>
                  <Stack spacing={2}>
                    {pwError && <Alert severity="error" sx={{ borderRadius:'10px' }}>{pwError}</Alert>}
                    <TextField size="small" fullWidth label="Current Password" type={showCur ? 'text' : 'password'}
                      value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                      InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowCur(s => !s)}>{showCur ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                      sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
                    <TextField size="small" fullWidth label="New Password" type={showNew ? 'text' : 'password'}
                      value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))}
                      InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowNew(s => !s)}>{showNew ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                      sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px' } }} />
                    {pw.newPw.length > 0 && (
                      <Box>
                        <LinearProgress variant="determinate" value={(s / 5) * 100}
                          sx={{ height:4, borderRadius:2, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9', '& .MuiLinearProgress-bar':{ bgcolor: S_COLOR[s] } }} />
                        <Typography fontSize="0.72rem" color={S_COLOR[s]} mt={0.5}>{S_LABEL[s]}</Typography>
                      </Box>
                    )}
                    <TextField size="small" fullWidth label="Confirm New Password" type="password"
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
            )}

            {/* Data Export */}
            {activeTab === 'data' && (
              <SectionCard title="Data & Export" subtitle="Download your personal data" icon={<GetAppIcon />} isDark={isDark}>
                <Box sx={{ p:3, background: isDark ? 'rgba(79,70,229,0.1)' : 'rgba(79,70,229,0.05)', borderRadius:'12px', border: isDark ? '1px solid rgba(79,70,229,0.2)' : '1px solid rgba(79,70,229,0.1)' }}>
                  <Typography fontSize="0.9rem" fontWeight={600} mb={1} color={isDark ? '#F1F5F9' : '#111827'}>Export Your Data</Typography>
                  <Typography fontSize="0.8rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} mb={2}>
                    Download a copy of all your personal data in JSON format.
                  </Typography>
                  <Button variant="contained" startIcon={<GetAppIcon />} onClick={exportData}
                    sx={{ background:'linear-gradient(135deg,#059669,#10B981)', textTransform:'none', fontWeight:700, borderRadius:'10px' }}>
                    Download My Data
                  </Button>
                </Box>
              </SectionCard>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
              <SectionCard title="Account" subtitle="Manage your account data" icon={<Security />} isDark={isDark}>
                <Box sx={{ p:3, background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)', borderRadius:'12px', border: isDark ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(239,68,68,0.1)' }}>
                  <Typography fontSize="0.9rem" fontWeight={600} mb={0.5} color="#EF4444">Delete Account</Typography>
                  <Typography fontSize="0.78rem" color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} mb={2}>
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
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
    </Box>
  );
}
