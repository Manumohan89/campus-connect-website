import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, TextField, InputAdornment, Chip,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, Tooltip, CircularProgress, Avatar, Select,
  MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import AdminLayout from './AdminLayout';
import adminApi from './adminApi';

const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [viewUser, setViewUser] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: rowsPerPage, search, role: roleFilter || undefined };
      const res = await adminApi.get('/users', { params });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (e) {
      showSnack(e.response?.data?.error || 'Failed to load users', 'error');
    } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleBlock = async (user) => {
    try {
      const res = await adminApi.patch(`/users/${user.user_id}/block`);
      showSnack(res.data.message);
      load();
    } catch (e) { showSnack(e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.patch(`/users/${user.user_id}/role`, { role: newRole });
      showSnack(`Role changed to ${newRole}`);
      load();
    } catch (e) { showSnack(e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleDelete = async (userId) => {
    try {
      await adminApi.delete(`/users/${userId}`);
      showSnack('User deleted');
      setConfirmDelete(null);
      load();
    } catch (e) { showSnack(e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleView = async (user) => {
    setViewUser(user); setViewLoading(true);
    try {
      const res = await adminApi.get(`/users/${user.user_id}`);
      setViewData(res.data);
    } catch { setViewData(null); }
    finally { setViewLoading(false); }
  };

  const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" color="#111827">Users</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">{total} total registered users</Typography>
        </Box>
        <Chip label={`${total} users`} sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
      </Box>

      {/* Filters */}
      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search username, email, name..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0); }} label="Role" sx={{ borderRadius: '10px' }}>
            <MenuItem value="">All roles</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Card>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
                    {['User', 'Branch / Sem', 'CGPA', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', py: 1.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => {
                    const color = AVATAR_COLORS[u.user_id % AVATAR_COLORS.length];
                    return (
                      <TableRow key={u.user_id} sx={{ '&:hover': { bgcolor: 'var(--bg-card2,#F8FAFC)' }, opacity: u.is_blocked ? 0.6 : 1 }}>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: color, fontSize: '0.75rem', fontWeight: 800 }}>{initials(u.full_name)}</Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-1,#111827)' }}>{u.full_name || u.username}</Typography>
                              <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{u.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.8rem', color: '#374151' }}>{u.branch || '—'}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>Sem {u.semester || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: parseFloat(u.cgpa) >= 8 ? '#10B981' : parseFloat(u.cgpa) >= 6 ? '#F59E0B' : '#9CA3AF' }}>
                            {u.cgpa ? parseFloat(u.cgpa).toFixed(2) : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={u.role} size="small"
                            sx={{ bgcolor: u.role === 'admin' ? '#EEF2FF' : '#F1F5F9', color: u.role === 'admin' ? '#4F46E5' : '#475569', fontWeight: 700, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={u.is_blocked ? 'Blocked' : 'Active'} size="small"
                            sx={{ bgcolor: u.is_blocked ? '#FEE2E2' : '#D1FAE5', color: u.is_blocked ? '#991B1B' : '#065F46', fontWeight: 700, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                            {new Date(u.created_at).toLocaleDateString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View details">
                              <IconButton size="small" onClick={() => handleView(u)} sx={{ color: '#4F46E5' }}>
                                <VisibilityIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={u.is_blocked ? 'Unblock' : 'Block'}>
                              <IconButton size="small" onClick={() => handleBlock(u)}
                                sx={{ color: u.is_blocked ? '#10B981' : '#F59E0B' }}>
                                {u.is_blocked ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <BlockIcon sx={{ fontSize: 16 }} />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}>
                              <IconButton size="small" onClick={() => handleRoleToggle(u)}
                                sx={{ color: u.role === 'admin' ? '#7C3AED' : '#9CA3AF' }}>
                                {u.role === 'admin' ? <AdminPanelSettingsIcon sx={{ fontSize: 16 }} /> : <PersonIcon sx={{ fontSize: 16 }} />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete user">
                              <IconButton size="small" onClick={() => setConfirmDelete(u)} sx={{ color: '#EF4444' }}>
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div" count={total} page={page} rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50]}
              sx={{ borderTop: '1px solid #E2E8F0' }}
            />
          </>
        )}
      </Card>

      {/* View User Dialog */}
      <Dialog open={!!viewUser} onClose={() => { setViewUser(null); setViewData(null); }} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
          {viewUser?.full_name || viewUser?.username}
        </DialogTitle>
        <DialogContent>
          {viewLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          : viewData && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  ['Email', viewData.user.email],
                  ['Branch', viewData.user.branch || '—'],
                  ['College', viewData.user.college || '—'],
                  ['Semester', viewData.user.semester || '—'],
                  ['CGPA', viewData.user.cgpa ? parseFloat(viewData.user.cgpa).toFixed(2) : '—'],
                  ['SGPA', viewData.user.sgpa ? parseFloat(viewData.user.sgpa).toFixed(2) : '—'],
                  ['Role', viewData.user.role],
                  ['Status', viewData.user.is_blocked ? 'Blocked' : 'Active'],
                ].map(([label, val]) => (
                  <Grid item xs={6} sm={3} key={label}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>{label}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1,#111827)' }}>{val}</Typography>
                  </Grid>
                ))}
              </Grid>
              {viewData.marks.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography fontWeight={700} fontSize="0.875rem" mb={1}>Marks ({viewData.marks.length} subjects)</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {viewData.marks.map((m, i) => (
                      <Chip key={i} label={`${m.subject_code}: ${m.total}`} size="small"
                        sx={{ bgcolor: m.total < 40 ? '#FEE2E2' : '#D1FAE5', color: m.total < 40 ? '#991B1B' : '#065F46', fontWeight: 700, fontSize: '0.7rem' }} />
                    ))}
                  </Box>
                </Box>
              )}
              {viewData.enrollments.length > 0 && (
                <Box>
                  <Typography fontWeight={700} fontSize="0.875rem" mb={1}>Enrollments ({viewData.enrollments.length} courses)</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {viewData.enrollments.map((e, i) => (
                      <Chip key={i} label={`${e.title} — ${e.progress}%`} size="small"
                        sx={{ bgcolor: e.certificate_issued ? '#D1FAE5' : '#EEF2FF', color: e.certificate_issued ? '#065F46' : '#4F46E5', fontWeight: 600, fontSize: '0.7rem' }} />
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setViewUser(null); setViewData(null); }} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle fontWeight={800}>Delete User?</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ borderRadius: '10px' }}>
            This will permanently delete <strong>{confirmDelete?.full_name || confirmDelete?.username}</strong> and ALL their data (marks, enrollments, etc.). This cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => handleDelete(confirmDelete.user_id)}
            sx={{ bgcolor: '#EF4444', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '10px' }}>{snack.msg}</Alert>
      </Snackbar>
    </AdminLayout>
  );
}
