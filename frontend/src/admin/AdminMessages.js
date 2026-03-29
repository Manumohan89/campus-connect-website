import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Alert, Snackbar, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Tooltip, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMsg, setViewMsg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [search, setSearch] = useState('');

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const load = async () => {
    setLoading(true);
    try { const res = await adminApi.get('/contacts'); setMessages(res.data); }
    catch { showSnack('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await adminApi.delete(`/contacts/${id}`); showSnack('Message deleted'); setConfirmDelete(null); load(); }
    catch { showSnack('Failed', 'error'); }
  };

  const filtered = messages.filter(m => !search ||
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="#111827">Contact Messages</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">{messages.length} total messages from students</Typography>
        </Box>
        <Chip label={`${messages.length} messages`} sx={{ bgcolor: '#EFF6FF', color: '#06B6D4', fontWeight: 700 }} />
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', p: 2, mb: 2 }}>
        <TextField size="small" fullWidth placeholder="Search name, email or message content..." value={search} onChange={e => setSearch(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
      </Card>

      {messages.length === 0 && !loading ? (
        <Card elevation={0} sx={{ border: '2px dashed #E2E8F0', borderRadius: '16px', p: 8, textAlign: 'center' }}>
          <EmailIcon sx={{ fontSize: 52, color: '#E2E8F0', mb: 2 }} />
          <Typography fontWeight={700} color="#374151">No messages yet</Typography>
          <Typography fontSize="0.875rem" color="text.secondary">Messages from the Contact page will appear here</Typography>
        </Card>
      ) : (
        <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
          {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    {['Name', 'Email', 'Message Preview', 'Date', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', py: 1.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(m => (
                    <TableRow key={m.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' }, cursor: 'pointer' }} onClick={() => setViewMsg(m)}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{m.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.8rem', color: '#4F46E5' }}>{m.email}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                          {m.submitted_at ? new Date(m.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View full message">
                            <IconButton size="small" onClick={() => setViewMsg(m)} sx={{ color: '#06B6D4' }}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton>
                          </Tooltip>
                          <Tooltip title="Reply via email">
                            <IconButton size="small" component="a" href={`mailto:${m.email}?subject=Re: Your Campus Connect Message`} sx={{ color: '#4F46E5' }}><EmailIcon sx={{ fontSize: 15 }} /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => setConfirmDelete(m)} sx={{ color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}><Typography>No messages match your search</Typography></Box>}
            </Box>
          )}
        </Card>
      )}

      {/* View Full Message Dialog */}
      <Dialog open={!!viewMsg} onClose={() => setViewMsg(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
          Message from {viewMsg?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#1D4ED8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>From</Typography>
              <Typography fontWeight={700} color="#111827">{viewMsg?.name}</Typography>
              <Typography fontSize="0.875rem" color="#1D4ED8">{viewMsg?.email}</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Message</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{viewMsg?.message}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              Sent {viewMsg?.submitted_at ? new Date(viewMsg.submitted_at).toLocaleString('en-IN') : ''}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setViewMsg(null)} sx={{ textTransform: 'none' }}>Close</Button>
          <Button component="a" href={`mailto:${viewMsg?.email}?subject=Re: Your Campus Connect Message`} variant="contained"
            sx={{ bgcolor: '#4F46E5', textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}>
            Reply via Email
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>Delete Message?</DialogTitle>
        <DialogContent><Alert severity="warning" sx={{ borderRadius: '10px' }}>Delete message from <strong>{confirmDelete?.name}</strong>?</Alert></DialogContent>
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
