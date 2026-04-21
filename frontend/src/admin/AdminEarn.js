import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Chip, Stack, Table, TableHead,
  TableRow, TableCell, TableBody, CircularProgress, Alert, Snackbar, Tooltip
} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const STATUS_CHIP = {
  pending:  { label: 'Pending',  sx: { bgcolor: '#FFFBEB', color: '#D97706' } },
  approved: { label: 'Approved', sx: { bgcolor: '#F0FDF4', color: '#059669' } },
  rejected: { label: 'Rejected', sx: { bgcolor: '#FEF2F2', color: '#DC2626' } } };

const TYPE_CHIP = {
  voice: { label: '🎙️ Voice', sx: { bgcolor: '#F5F3FF', color: '#7C3AED' } },
  image: { label: '🖼️ Image', sx: { bgcolor: '#EFF6FF', color: '#2563EB' } },
  text:  { label: '📝 Text',  sx: { bgcolor: '#F0FDF4', color: '#059669' } } };

export default function AdminEarn() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState({});
  const [filter, setFilter]         = useState('pending');
  const [snack, setSnack]           = useState({ open: false, msg: '', sev: 'success' });

  const show = (msg, sev = 'success') => setSnack({ open: true, msg, sev });

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminApi.get('/earn-submissions');
      setSubmissions(r.data || []);
    } catch (e) {
      show('Failed to load submissions', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (id, action) => {
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      await adminApi.post(`/earn-approve/${id}`, { action });
      show(`Submission ${action}d successfully`);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: action === 'approve' ? 'approved' : 'rejected' } : s));
    } catch (e) {
      show(e.response?.data?.error || 'Action failed', 'error');
    } finally {
      setProcessing(p => ({ ...p, [id]: false }));
    }
  };

  const handleExport = async (type) => {
    try {
      const r = await adminApi.get(`/earn-export?format=json${type ? `&type=${type}` : ''}`);
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `earn_dataset_${type || 'all'}.json`; a.click();
      URL.revokeObjectURL(url);
      show('Dataset exported');
    } catch { show('Export failed', 'error'); }
  };

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);

  const stats = {
    total:    submissions.length,
    pending:  submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    payout:   submissions.filter(s => s.status === 'approved').reduce((a, s) => a + parseFloat(s.reward || 0), 0) };

  return (
    <AdminLayout>
      {/* Header */}
      <Box mb={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>AI Data Earn — Submissions</Typography>
            <Typography variant="body2" color="text.secondary">Review and approve student task submissions</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('')}
              variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Export All
            </Button>
            {['voice', 'image', 'text'].map(t => (
              <Button key={t} size="small" onClick={() => handleExport(t)}
                variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}>
                {t}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 2, mb: 3 }}>
        {[
          { label: 'Total',    value: stats.total,    color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Pending',  value: stats.pending,  color: '#D97706', bg: '#FFFBEB' },
          { label: 'Approved', value: stats.approved, color: '#059669', bg: '#F0FDF4' },
          { label: 'Rejected', value: stats.rejected, color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Total Payout', value: `₹${stats.payout.toFixed(2)}`, color: '#10B981', bg: '#F0FDF4' },
        ].map(s => (
          <Card key={s.label} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: s.bg }}>
            <Typography fontWeight={800} fontSize="1.4rem" color={s.color}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
          </Card>
        ))}
      </Box>

      {/* Filter */}
      <Stack direction="row" spacing={1} mb={2}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <Button key={f} size="small" variant={filter === f ? 'contained' : 'outlined'}
            onClick={() => setFilter(f)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              ...(filter === f ? { bgcolor: '#4F46E5' } : { borderColor: 'divider', color: 'text.secondary' }) }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && <Chip label={stats[f] || 0} size="small" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.3)' }} />}
          </Button>
        ))}
      </Stack>

      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress /></Box>
      ) : (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['#', 'Student', 'Type', 'Label / Content', 'Reward', 'Status', 'Submitted', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.disabled' }}>No submissions</TableCell></TableRow>
              ) : filtered.map(s => {
                const sc = STATUS_CHIP[s.status] || STATUS_CHIP.pending;
                const tc = TYPE_CHIP[s.task_type] || TYPE_CHIP.text;
                return (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{s.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600} fontSize="0.82rem">{s.username}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={tc.label} size="small" sx={{ ...tc.sx, fontSize: '0.7rem', height: 22 }} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      {s.label ? (
                        <Typography fontSize="0.78rem" noWrap>{s.label}</Typography>
                      ) : s.data_url ? (
                        <Button size="small" href={s.data_url} target="_blank" sx={{ textTransform: 'none', fontSize: '0.72rem', p: 0 }}>
                          📁 View File
                        </Button>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700} fontSize="0.82rem" color="#10B981">₹{s.reward}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={sc.label} size="small" sx={{ ...sc.sx, fontSize: '0.7rem', height: 22, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {new Date(s.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </TableCell>
                    <TableCell>
                      {s.status === 'pending' ? (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Approve — add ₹ to wallet">
                            <Button size="small" variant="contained" onClick={() => handleAction(s.id, 'approve')}
                              disabled={processing[s.id]}
                              sx={{ bgcolor: '#059669', minWidth: 32, px: 1, py: 0.5, fontSize: '0.7rem', borderRadius: 1.5,
                                '&:hover': { bgcolor: '#047857' } }}>
                              {processing[s.id] ? <CircularProgress size={12} color="inherit" /> : '✓'}
                            </Button>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <Button size="small" variant="outlined" color="error" onClick={() => handleAction(s.id, 'reject')}
                              disabled={processing[s.id]}
                              sx={{ minWidth: 32, px: 1, py: 0.5, fontSize: '0.7rem', borderRadius: 1.5 }}>
                              ✗
                            </Button>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Typography fontSize="0.72rem" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
