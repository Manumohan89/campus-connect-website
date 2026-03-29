import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Avatar, TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

export default function AdminCommunity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const load = async () => {
    setLoading(true);
    try { const res = await adminApi.get('/community'); setItems(res.data); }
    catch { showSnack('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (item) => {
    try {
      const res = await adminApi.patch(`/community/${item.id}/approve`);
      showSnack(res.data.message); load();
    } catch { showSnack('Failed', 'error'); }
  };

  const handleDelete = async (id) => {
    try { await adminApi.delete(`/community/${id}`); showSnack('Deleted'); setConfirmDelete(null); load(); }
    catch { showSnack('Failed', 'error'); }
  };

  const filtered = items.filter(i => {
    if (filter === 'approved' && !i.is_approved) return false;
    if (filter === 'pending' && i.is_approved) return false;
    if (search && !i.title?.toLowerCase().includes(search.toLowerCase()) && !i.uploader_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const TYPE_COLOR = { notes: '#4F46E5', question_paper: '#F59E0B', syllabus: '#10B981', other: '#9CA3AF' };

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="#111827">Community Resources</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">
            {items.length} uploads · {items.filter(i => !i.is_approved).length} pending approval
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[['all','All'], ['pending','Pending'], ['approved','Approved']].map(([val, label]) => (
            <Chip key={val} label={`${label} (${val==='all'?items.length:items.filter(i=>val==='pending'?!i.is_approved:i.is_approved).length})`}
              onClick={() => setFilter(val)} clickable size="small"
              sx={{ bgcolor: filter===val ? '#EF4444' : '#F1F5F9', color: filter===val ? 'white' : '#374151', fontWeight: 700, fontSize: '0.72rem' }} />
          ))}
        </Box>
        <TextField size="small" placeholder="Search title or uploader..." value={search} onChange={e => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
      </Card>

      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['Title', 'Uploader', 'Type', 'Dept / Sem', 'Scheme', 'Ratings', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(item => (
                  <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell sx={{ py: 1.25, maxWidth: 200 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</Typography>
                      {item.file_url && (
                        <a href={item.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.68rem', color: '#4F46E5' }}>View file ↗</a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#EEF2FF', color: '#4F46E5', fontSize: '0.65rem', fontWeight: 800 }}>
                          {(item.uploader_name || item.username || '?')[0].toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>{item.uploader_name || item.username}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.resource_type || 'other'} size="small" sx={{ bgcolor: (TYPE_COLOR[item.resource_type]||'#9CA3AF')+'18', color: TYPE_COLOR[item.resource_type]||'#9CA3AF', fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>{item.department || '—'}</Typography>
                      {item.semester && <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Sem {item.semester}</Typography>}
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>{item.year_scheme || '—'}</Typography></TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#F59E0B' }}>
                        ★ {item.average_rating ? parseFloat(item.average_rating).toFixed(1) : '—'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{item.rating_count || 0} ratings</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.is_approved ? 'Approved' : 'Pending'} size="small"
                        sx={{ bgcolor: item.is_approved ? '#D1FAE5' : '#FEF9C3', color: item.is_approved ? '#065F46' : '#92400E', fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={item.is_approved ? 'Unapprove' : 'Approve'}>
                          <IconButton size="small" onClick={() => handleApprove(item)} sx={{ color: item.is_approved ? '#F59E0B' : '#10B981' }}>
                            {item.is_approved ? <UnpublishedIcon sx={{ fontSize: 15 }} /> : <CheckCircleIcon sx={{ fontSize: 15 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setConfirmDelete(item)} sx={{ color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}><Typography>No community resources found</Typography></Box>}
          </Box>
        )}
      </Card>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>Delete Resource?</DialogTitle>
        <DialogContent><Alert severity="error" sx={{ borderRadius: '10px' }}>Delete <strong>{confirmDelete?.title}</strong> uploaded by {confirmDelete?.uploader_name}? This cannot be undone.</Alert></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => handleDelete(confirmDelete.id)} sx={{ bgcolor: '#EF4444', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '10px' }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
