import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, CircularProgress, TextField, InputAdornment,
  IconButton, Snackbar, Alert, Tabs, Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import ForumIcon from '@mui/icons-material/Forum';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AdminLayout from './AdminLayout';
import api from '../utils/api';
import adminApi from './adminApi';

export default function AdminForum() {
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [snack, setSnack] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/forum/posts', { params: { limit: 100 } }),
      api.get('/forum/stats'),
    ]).then(([p, s]) => {
      setPosts(p.data.posts || []);
      setStats(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deletePost = async (id, title) => {
    if (!window.confirm(`Delete post: "${title}"?`)) return;
    try {
      await adminApi.delete(`/forum/posts/${id}`);
      setPosts(p => p.filter(x => x.id !== id));
      setSnack('Post deleted');
    } catch { setSnack('Failed to delete'); }
  };

  const filtered = posts.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Peer Forum</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">Moderate student Q&A forum</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {[['📝', stats.total_posts, 'Questions'], ['💡', stats.total_answers, 'Answers'], ['✅', stats.solved, 'Solved']].map(([icon, val, label]) => (
            <Chip key={label} label={`${icon} ${val || 0} ${label}`} sx={{ bgcolor: '#F1F5F9', fontWeight: 700, fontSize: '0.75rem' }} />
          ))}
        </Box>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '14px', p: 2, mb: 3 }}>
        <TextField fullWidth size="small" placeholder="Search by title or author..."
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
                  {['Author', 'Title', 'Subject', 'Answers', 'Votes', 'Status', 'Posted', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                    <TableCell sx={{ py: 1.2 }}><Typography fontSize="0.8rem" fontWeight={600}>{p.username}</Typography></TableCell>
                    <TableCell sx={{ maxWidth: 240, py: 1.2 }}>
                      <Typography fontSize="0.8rem" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</Typography>
                    </TableCell>
                    <TableCell><Typography fontSize="0.75rem" color="text.secondary">{p.subject_code || '—'}</Typography></TableCell>
                    <TableCell><Typography fontSize="0.78rem">{p.answer_count}</Typography></TableCell>
                    <TableCell><Typography fontSize="0.78rem">{p.upvotes}</Typography></TableCell>
                    <TableCell>
                      <Chip label={p.is_solved ? '✓ Solved' : 'Open'} size="small"
                        sx={{ bgcolor: p.is_solved ? '#D1FAE5' : '#FEF9C3', color: p.is_solved ? '#065F46' : '#92400E', fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell><Typography fontSize="0.72rem" color="text.secondary">{new Date(p.created_at).toLocaleDateString('en-IN')}</Typography></TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => deletePost(p.id, p.title)} sx={{ color: '#EF4444' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>No posts found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </AdminLayout>
  );
}
