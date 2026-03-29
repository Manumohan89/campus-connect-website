import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, CircularProgress, TextField, InputAdornment, Alert, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const STATUS_COLORS = {
  active:    { bg: '#D1FAE5', color: '#065F46' },
  expired:   { bg: '#F1F5F9', color: '#6B7280' },
  cancelled: { bg: '#FEF2F2', color: '#991B1B' },
  pending:   { bg: '#FEF9C3', color: '#92400E' },
};

export default function AdminPayments() {
  const [subs, setSubs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.get('/payments/subscriptions').then(r => {
      const data = r.data || [];
      setSubs(data);
      const active = data.filter(s => s.status === 'active').length;
      const revenue = data.reduce((sum, s) => sum + (s.amount_paise || 0), 0) / 100;
      setStats({ total: data.length, active, revenue });
    }).catch(() => {}).finally(() => setLoading(false));
    adminApi.get('/payments/logs').then(r => setLogs(r.data || [])).catch(() => {});
  }, []);

  const filtered = subs.filter(s =>
    !search || s.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Payments & Subscriptions</Typography>
        <Typography color="text.secondary" fontSize="0.875rem">Revenue tracking and subscription management</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ['Total Subscriptions', stats.total, '#4F46E5'],
          ['Active Subscriptions', stats.active, '#10B981'],
          [`Revenue (₹)`, `₹${stats.revenue.toLocaleString('en-IN')}`, '#F59E0B'],
        ].map(([label, val, color]) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '14px', p: 2.5, textAlign: 'center' }}>
              <Typography fontWeight={900} fontSize="2rem" color={color} fontFamily="monospace">{val}</Typography>
              <Typography fontSize="0.8rem" color="text.secondary" mt={0.5}>{label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Alert severity="info" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.82rem' }}>
        To enable live payments, add <strong>RAZORPAY_KEY_ID</strong> and <strong>RAZORPAY_KEY_SECRET</strong> to your environment variables on Render.
        Get them free at <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer">razorpay.com</a>
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '14px', p: 2, mb: 3 }}>
        <TextField fullWidth size="small" placeholder="Search by username or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
      </Card>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  {['User', 'Plan', 'Status', 'Amount', 'Payment ID', 'Started', 'Expires'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((s, i) => {
                  const sc = STATUS_COLORS[s.status] || STATUS_COLORS.pending;
                  return (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography fontWeight={700} fontSize="0.82rem">{s.username || s.email || '—'}</Typography>
                      </TableCell>
                      <TableCell><Chip label={s.plan?.replace('_', ' ')} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.65rem' }} /></TableCell>
                      <TableCell><Chip label={s.status} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.65rem' }} /></TableCell>
                      <TableCell><Typography fontSize="0.8rem" fontWeight={700} color="#10B981">₹{((s.amount_paise || 0) / 100).toLocaleString('en-IN')}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.7rem" fontFamily="monospace" color="#9CA3AF">{s.razorpay_payment_id?.substring(0, 16) || '—'}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.72rem" color="text.secondary">{s.started_at ? new Date(s.started_at).toLocaleDateString('en-IN') : '—'}</Typography></TableCell>
                      <TableCell><Typography fontSize="0.72rem" color={new Date(s.expires_at) < new Date() ? '#EF4444' : 'text.secondary'}>{s.expires_at ? new Date(s.expires_at).toLocaleDateString('en-IN') : '—'}</Typography></TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
                    No subscriptions yet. Share the Premium page with students!
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </AdminLayout>
  );
}
