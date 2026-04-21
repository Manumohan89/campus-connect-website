import React, { useEffect, useState } from 'react';
import { Grid, Card, Typography, Box, CircularProgress, Alert, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import BlockIcon from '@mui/icons-material/Block';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

function StatCard({ label, value, sub, color, icon, bg }) {
  return (
    <Card elevation={0} sx={{ border: `1px solid ${color}22`, borderRadius: '16px', p: 3, bgcolor: bg || 'white', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${color}20` } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
        </Box>
      </Box>
      <Typography sx={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{value ?? '—'}</Typography>
      <Typography sx={{ fontWeight: 700, color: '#374151', mt: 0.5, fontSize: '0.875rem' }}>{label}</Typography>
      {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.get('/stats')
      .then(r => setStats(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load stats'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="#111827">
          Dashboard Overview
        </Typography>
        <Typography color="text.secondary" fontSize="0.875rem">Campus Connect — full control view</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Total Users" value={stats?.users?.total} sub={`${stats?.users?.new_this_week} new this week`} color="#4F46E5" icon={<PeopleIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Admins" value={stats?.users?.admins} sub="With admin role" color="#7C3AED" icon={<EmojiEventsIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Blocked Users" value={stats?.users?.blocked} sub="Accounts blocked" color="#EF4444" icon={<BlockIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Courses" value={stats?.courses?.total} sub={`${stats?.courses?.backlog} backlog clearing`} color="#10B981" icon={<PlayCircleIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="VTU Resources" value={stats?.resources?.total} sub="Notes, PYQs, Syllabus" color="#0EA5E9" icon={<MenuBookIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Placement Drives" value={stats?.placements?.total} sub={`${stats?.placements?.open} open now`} color="#F59E0B" icon={<WorkIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Community Resources" value={stats?.community?.total} sub="Student uploads" color="#EC4899" icon={<GroupIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Enrollments" value={stats?.enrollments?.total} sub="Total course enrollments" color="#06B6D4" icon={<SchoolIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Internship Programs" value={stats?.internships || '—'} sub="Active programs" color="#7C3AED" icon={<SchoolIcon />} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard label="Projects Listed" value={stats?.projects || '—'} sub="Ready-made projects" color="#0EA5E9" icon={<WorkIcon />} />
            </Grid>
          </Grid>

          {/* Quick Summary */}
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', p: 3 }}>
            <Typography fontWeight={800} fontSize="0.95rem" color="#111827" mb={2}>System Health</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {[
                { label: `${stats?.users?.total} students registered`, color: '#4F46E5' },
                { label: `${stats?.courses?.total} courses available`, color: '#10B981' },
                { label: `${stats?.resources?.total} VTU resources`, color: '#0EA5E9' },
                { label: `${stats?.placements?.open} drives open`, color: '#F59E0B' },
                { label: `${stats?.users?.blocked > 0 ? stats.users.blocked + ' blocked' : 'No blocked users'}`, color: stats?.users?.blocked > 0 ? '#EF4444' : '#10B981' },
              ].map((item, i) => (
                <Chip key={i} label={item.label} size="small" sx={{ bgcolor: item.color + '14', color: item.color, fontWeight: 700, fontSize: '0.75rem' }} />
              ))}
            </Box>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
