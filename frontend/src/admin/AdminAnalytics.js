import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Card, Grid, CircularProgress, Alert,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, Avatar
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cgpaRef  = useRef(null); const cgpaChart  = useRef(null);
  const signupRef = useRef(null); const signupChart = useRef(null);

  useEffect(() => {
    adminApi.get('/analytics')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    // CGPA distribution chart
    if (cgpaRef.current) {
      if (cgpaChart.current) cgpaChart.current.destroy();
      const labels = data.cgpa_distribution.map(d => d.range);
      const values = data.cgpa_distribution.map(d => parseInt(d.count));
      cgpaChart.current = new Chart(cgpaRef.current, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Students', data: values,
          backgroundColor: ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'],
          borderRadius: 8, borderSkipped: false }] },
        options: { responsive: true, plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
            x: { grid: { display: false } } } }
      });
    }
    // Monthly signups chart
    if (signupRef.current) {
      if (signupChart.current) signupChart.current.destroy();
      const labels = data.monthly_signups.map(d => d.month);
      const values = data.monthly_signups.map(d => parseInt(d.signups));
      signupChart.current = new Chart(signupRef.current, {
        type: 'line',
        data: { labels, datasets: [{ label: 'New Signups', data: values,
          borderColor: '#4F46E5', backgroundColor: '#4F46E522', fill: true,
          tension: 0.4, pointBackgroundColor: '#4F46E5', pointRadius: 4 }] },
        options: { responsive: true, plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
            x: { grid: { display: false } } } }
      });
    }
    return () => { cgpaChart.current?.destroy(); signupChart.current?.destroy(); };
  }, [data]);

  if (loading) return <AdminLayout><Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box></AdminLayout>;

  return (
    <AdminLayout>
      <Box sx={{ mb:3 }}>
        <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Analytics</Typography>
        <Typography color="text.secondary" fontSize="0.875rem">Platform-wide insights and performance metrics</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb:3, borderRadius:'12px' }}>{error}</Alert>}

      {data && (
        <>
          {/* KPI cards */}
          <Grid container spacing={2.5} mb={3}>
            {[
              { label:'Active This Week', value:data.active_users_week, icon:<PeopleIcon />, color:'#4F46E5' },
              { label:'Top Performers', value:data.top_performers?.length || 0, icon:<EmojiEventsIcon />, color:'#F59E0B' },
              { label:'Branches Tracked', value:data.branch_stats?.length || 0, icon:<SchoolIcon />, color:'#10B981' },
              { label:'Monthly Growth', value: data.monthly_signups?.length > 1
                ? `+${Math.max(0, (data.monthly_signups.at(-1)?.signups - data.monthly_signups.at(-2)?.signups) || 0)}`
                : '—', icon:<TrendingUpIcon />, color:'#7C3AED' },
            ].map((k,i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card elevation={0} sx={{ border:`1px solid ${k.color}22`, borderRadius:'16px', p:2.5 }}>
                  <Box sx={{ width:40, height:40, borderRadius:'10px', bgcolor:`${k.color}18`, display:'flex', alignItems:'center', justifyContent:'center', mb:1.5 }}>
                    {React.cloneElement(k.icon, { sx:{ color:k.color, fontSize:20 } })}
                  </Box>
                  <Typography fontWeight={900} fontSize="1.75rem" color={k.color} fontFamily="'Space Grotesk',sans-serif" lineHeight={1}>{k.value}</Typography>
                  <Typography fontWeight={600} fontSize="0.8rem" color="#374151" mt={0.5}>{k.label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3 }}>
                <Typography fontWeight={700} mb={2}>CGPA Distribution</Typography>
                <canvas ref={cgpaRef} height={200} />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3 }}>
                <Typography fontWeight={700} mb={2}>Monthly Signups (12 months)</Typography>
                <canvas ref={signupRef} height={200} />
              </Card>
            </Grid>
          </Grid>

          {/* Top performers */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden' }}>
                <Box sx={{ px:3, py:2, borderBottom:'1px solid #F3F4F6', bgcolor:'#FFFBEB' }}>
                  <Typography fontWeight={700} fontSize="0.9rem">🏆 Top 10 Performers by CGPA</Typography>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                      {['#','Student','Branch','Sem','CGPA'].map(h => (
                        <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.7rem', color:'#9CA3AF', textTransform:'uppercase', py:1.25 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.top_performers || []).map((u, i) => {
                      const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                      return (
                        <TableRow key={i} sx={{ '&:hover':{ bgcolor:'#F9FAFB' } }}>
                          <TableCell sx={{ width:36 }}>
                            <Typography fontSize="0.8rem" fontWeight={700} color={i<3?'#F59E0B':'#9CA3AF'}>
                              {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                              <Avatar sx={{ width:26, height:26, bgcolor:color, fontSize:'0.65rem', fontWeight:800 }}>
                                {u.full_name?.[0] || u.username?.[0] || 'U'}
                              </Avatar>
                              <Typography fontSize="0.8rem" fontWeight={600}>{u.full_name || u.username}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Typography fontSize="0.78rem">{u.branch||'—'}</Typography></TableCell>
                          <TableCell><Typography fontSize="0.78rem">{u.semester||'—'}</Typography></TableCell>
                          <TableCell>
                            <Chip label={parseFloat(u.cgpa).toFixed(2)} size="small"
                              sx={{ bgcolor: parseFloat(u.cgpa)>=9?'#FEF9C3':parseFloat(u.cgpa)>=8?'#D1FAE5':'#EEF2FF',
                                color: parseFloat(u.cgpa)>=9?'#92400E':parseFloat(u.cgpa)>=8?'#065F46':'#1E40AF',
                                fontWeight:800, fontSize:'0.75rem' }} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </Grid>

            {/* Branch stats */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden' }}>
                <Box sx={{ px:3, py:2, borderBottom:'1px solid #F3F4F6', bgcolor:'#EFF6FF' }}>
                  <Typography fontWeight={700} fontSize="0.9rem">🏫 Students by Branch</Typography>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                      {['Branch','Students','Avg CGPA','Share'].map(h => (
                        <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.7rem', color:'#9CA3AF', textTransform:'uppercase', py:1.25 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.branch_stats || []).map((b, i) => {
                      const total = data.branch_stats.reduce((s,x)=>s+parseInt(x.count),0);
                      const pct = Math.round((parseInt(b.count)/total)*100);
                      return (
                        <TableRow key={i} sx={{ '&:hover':{ bgcolor:'#F9FAFB' } }}>
                          <TableCell><Chip label={b.branch} size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontWeight:700, fontSize:'0.7rem' }} /></TableCell>
                          <TableCell><Typography fontWeight={700} fontSize="0.82rem">{b.count}</Typography></TableCell>
                          <TableCell>
                            <Typography fontWeight={700} fontSize="0.82rem" color={parseFloat(b.avg_cgpa)>=8?'#10B981':parseFloat(b.avg_cgpa)>=6?'#F59E0B':'#EF4444'}>
                              {b.avg_cgpa ? parseFloat(b.avg_cgpa).toFixed(2) : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                              <Box sx={{ flex:1, height:6, bgcolor:'#E5E7EB', borderRadius:99 }}>
                                <Box sx={{ width:`${pct}%`, height:'100%', bgcolor:'#4F46E5', borderRadius:99 }} />
                              </Box>
                              <Typography variant="caption" fontWeight={700} color="#6B7280">{pct}%</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </Grid>
          </Grid>

          {/* Course popularity */}
          <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', overflow:'hidden' }}>
            <Box sx={{ px:3, py:2, borderBottom:'1px solid #F3F4F6', bgcolor:'#F0FDF4' }}>
              <Typography fontWeight={700} fontSize="0.9rem">📚 Course Popularity</Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                  {['Course','Enrollments','Avg Progress','Popularity'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:700, fontSize:'0.7rem', color:'#9CA3AF', textTransform:'uppercase', py:1.25 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(data.course_popularity || []).map((c, i) => {
                  const maxEnroll = Math.max(...data.course_popularity.map(x=>parseInt(x.enrollments)));
                  const pct = maxEnroll > 0 ? Math.round((parseInt(c.enrollments)/maxEnroll)*100) : 0;
                  return (
                    <TableRow key={i} sx={{ '&:hover':{ bgcolor:'#F9FAFB' } }}>
                      <TableCell sx={{ maxWidth:220 }}>
                        <Typography fontWeight={600} fontSize="0.82rem" sx={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</Typography>
                      </TableCell>
                      <TableCell><Typography fontWeight={700} fontSize="0.82rem" color="#4F46E5">{c.enrollments || 0}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1, minWidth:100 }}>
                          <Box sx={{ flex:1, height:5, bgcolor:'#E5E7EB', borderRadius:99 }}>
                            <Box sx={{ width:`${Math.round(parseFloat(c.avg_progress||0))}%`, height:'100%', bgcolor:'#10B981', borderRadius:99 }} />
                          </Box>
                          <Typography variant="caption" fontWeight={700}>{Math.round(parseFloat(c.avg_progress||0))}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          <Box sx={{ flex:1, height:6, bgcolor:'#E5E7EB', borderRadius:99 }}>
                            <Box sx={{ width:`${pct}%`, height:'100%', bgcolor:'#7C3AED', borderRadius:99 }} />
                          </Box>
                          <Typography variant="caption" fontWeight={700} color="#6B7280">{pct}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
