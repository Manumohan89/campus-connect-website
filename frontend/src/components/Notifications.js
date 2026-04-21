import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Chip, IconButton, Button,
  Stack, Tooltip
, CircularProgress } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const TYPE_CONFIG = {
  marks:      { icon:<BarChartIcon/>,   color:'#4F46E5', bg:'#EEF2FF', label:'Marks' },
  backlog:    { icon:<WarningIcon/>,    color:'#EF4444', bg:'#FEF2F2', label:'Backlog' },
  placement:  { icon:<WorkIcon/>,       color:'#10B981', bg:'#F0FDF4', label:'Placement' },
  resource:   { icon:<MenuBookIcon/>,   color:'#0EA5E9', bg:'#EFF6FF', label:'Resource' },
  attendance: { icon:<SchoolIcon/>,     color:'#F59E0B', bg:'#FFFBEB', label:'Attendance' },
  announcement:{ icon:<NotificationsActiveIcon/>, color:'#7C3AED', bg:'#EDE9FE', label:'Announcement' } };

function timeAgo(dateStr) {
  const diff = (new Date() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN');
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const load = useCallback(() => {
    api.get('/users/notifications')
      .then(r => setNotifications(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await api.patch(`/users/notifications/${id}/read`).catch(() => {});
    setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  const markAllRead = async () => {
    await api.patch('/users/notifications/read-all').catch(() => {});
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/users/notifications/${id}`).catch(() => {});
    setNotifications(n => n.filter(x => x.id !== id));
  };

  const handleClick = (notif) => {
    if (!notif.is_read) markRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const types = [...new Set(notifications.map(n => n.type))];

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#1E1B4B 0%,#4F46E5 100%)', py:5, px:2 }}>
        <Container>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:2 }}>
            <Box>
              <Box sx={{ display:'flex', gap:1.5, alignItems:'center', mb:1 }}>
                <NotificationsActiveIcon sx={{ color:'#A5B4FC', fontSize:20 }} />
                <Typography sx={{ color:'#A5B4FC', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em' }}>Alerts</Typography>
              </Box>
              <Typography sx={{ fontSize:{xs:'2rem',md:'2.5rem'}, fontWeight:900, color:'white' }}>Notifications</Typography>
              <Typography sx={{ color:'rgba(255,255,255,0.6)', mt:0.5 }}>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </Typography>
            </Box>
            {unreadCount > 0 && (
              <Button startIcon={<DoneAllIcon />} onClick={markAllRead} variant="outlined"
                sx={{ borderColor:'rgba(255,255,255,0.3)', color:'white', textTransform:'none', borderRadius:'10px', fontWeight:600, '&:hover':{borderColor:'white',bgcolor:'rgba(255,255,255,0.08)'} }}>
                Mark all read
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py:4 }} maxWidth="md">
        {/* Filter chips */}
        <Box sx={{ display:'flex', gap:1, mb:3, flexWrap:'wrap' }}>
          {[['all','All'], ['unread','Unread'], ...types.map(t => [t, TYPE_CONFIG[t]?.label || t])].map(([val, label]) => {
            const count = val === 'all' ? notifications.length : val === 'unread' ? unreadCount : notifications.filter(n => n.type === val).length;
            return (
              <Chip key={val} label={`${label} (${count})`} onClick={() => setFilter(val)} clickable
                sx={{ bgcolor: filter === val ? '#4F46E5' : '#F1F5F9', color: filter === val ? 'white' : '#374151', fontWeight:700, fontSize:'0.78rem' }} />
            );
          })}
        </Box>

        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Card elevation={0} sx={{ border:'2px dashed #E5E7EB', borderRadius:'20px', p:8, textAlign:'center' }}>
            <CheckCircleIcon sx={{ fontSize:56, color:'#D1FAE5', mb:2 }} />
            <Typography fontWeight={700} color="#374151" mb={1}>
              {filter === 'all' ? 'No notifications yet' : 'No matching notifications'}
            </Typography>
            <Typography color="text.secondary" fontSize="0.875rem">
              Upload your marks card to get personalized academic alerts.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.announcement;
              return (
                <Card key={n.id} elevation={0}
                  onClick={() => handleClick(n)}
                  sx={{ border:`1.5px solid ${n.is_read ? '#E5E7EB' : cfg.color+'44'}`, borderRadius:'14px', bgcolor: n.is_read ? 'white' : cfg.bg, cursor: n.link ? 'pointer' : 'default', transition:'all 0.15s', '&:hover': n.link ? { boxShadow:`0 4px 16px ${cfg.color}22`, transform:'translateY(-1px)' } : {} }}>
                  <Box sx={{ display:'flex', gap:2, p:2.5, alignItems:'flex-start' }}>
                    <Box sx={{ width:42, height:42, borderRadius:'12px', bgcolor:`${cfg.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {React.cloneElement(cfg.icon, { sx:{ color:cfg.color, fontSize:20 } })}
                    </Box>
                    <Box sx={{ flex:1, minWidth:0 }}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:1 }}>
                        <Box sx={{ display:'flex', gap:1, alignItems:'center', flexWrap:'wrap' }}>
                          <Typography fontWeight={n.is_read ? 600 : 800} fontSize="0.9rem" color="#111827">{n.title}</Typography>
                          {!n.is_read && <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:cfg.color, flexShrink:0 }} />}
                        </Box>
                        <Box sx={{ display:'flex', gap:0.5, flexShrink:0 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace:'nowrap' }}>{timeAgo(n.created_at)}</Typography>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={e => deleteNotif(n.id, e)} sx={{ color:'#CBD5E1', '&:hover':{color:'#EF4444'}, ml:0.5 }}>
                              <DeleteIcon sx={{ fontSize:15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Typography fontSize="0.82rem" color={n.is_read ? '#64748B' : '#374151'} mt={0.25} lineHeight={1.5}>{n.body}</Typography>
                      {n.link && <Typography variant="caption" sx={{ color:cfg.color, fontWeight:700, mt:0.5, display:'block' }}>Tap to view →</Typography>}
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
