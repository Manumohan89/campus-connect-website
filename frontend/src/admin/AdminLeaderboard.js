import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, CircularProgress, Avatar, Alert, Snackbar
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import AdminLayout from './AdminLayout';
import api from '../utils/api';

const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];
const BADGE_COLORS = { 'CGPA 9+':'#4F46E5','Coding Master':'#EF4444','Course Champion':'#10B981','Full Attendance':'#F59E0B','Forum Expert':'#7C3AED' };

export default function AdminLeaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    api.get('/leaderboard?limit=100').then(r => setBoard(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const rebuild = async () => {
    setRebuilding(true);
    try {
      await api.post('/leaderboard/rebuild');
      setSnack('✅ Leaderboard rebuilt successfully!');
      await load();
    } catch (e) { setSnack('❌ Failed: ' + (e.response?.data?.error || e.message)); }
    setRebuilding(false);
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily="'Space Grotesk',sans-serif">Leaderboard</Typography>
          <Typography color="text.secondary" fontSize="0.875rem">{board.length} students ranked · Auto-rebuilds every 6 hours</Typography>
        </Box>
        <Button variant="outlined" startIcon={rebuilding ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={rebuild} disabled={rebuilding}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', borderColor: '#4F46E5', color: '#4F46E5' }}>
          {rebuilding ? 'Rebuilding...' : 'Rebuild Now'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.82rem' }}>
        Score formula: CGPA (max 30pts) + Coding solved ×2 (max 30pts) + Courses done ×5 (max 20pts) + Attendance avg (max 10pts) + Forum answers ×3 (max 10pts) = <strong>100 points max</strong>
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  {['Rank', 'Student', 'Branch', 'Score', 'CGPA', 'Coding', 'Courses', 'Badges'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {board.map((u, i) => (
                  <TableRow key={u.user_id} sx={{ '&:hover': { bgcolor: '#FAFAFA' }, bgcolor: i < 3 ? ['#FFFBEB','#F9FAFB','#F7FEE7'][i] : 'white' }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography fontWeight={900} fontSize="1rem" color={i < 3 ? '#F59E0B' : '#9CA3AF'} fontFamily="monospace">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${u.rank}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: AVATAR_COLORS[u.user_id % 6], fontSize: '0.7rem', fontWeight: 800 }}>
                          {u.full_name?.[0] || u.username?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700} fontSize="0.82rem">{u.full_name || u.username}</Typography>
                          <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography fontSize="0.78rem">{u.branch || '—'}</Typography></TableCell>
                    <TableCell><Typography fontWeight={900} fontSize="0.9rem" color="#F59E0B" fontFamily="monospace">{Math.round(u.score)}</Typography></TableCell>
                    <TableCell><Typography fontSize="0.78rem">{parseFloat(u.cgpa || 0).toFixed(2)}</Typography></TableCell>
                    <TableCell><Typography fontSize="0.78rem" color="#10B981" fontWeight={700}>{Math.round(u.coding_score / 2)}</Typography></TableCell>
                    <TableCell><Typography fontSize="0.78rem" color="#7C3AED" fontWeight={700}>{Math.round(u.course_score / 5)}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(u.badges || []).map(b => (
                          <Chip key={b} label={b} size="small" sx={{ bgcolor: (BADGE_COLORS[b] || '#4F46E5') + '18', color: BADGE_COLORS[b] || '#4F46E5', fontSize: '0.6rem', height: 18, fontWeight: 700 }} />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {board.length === 0 && (
                  <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
                    No leaderboard data yet. Click "Rebuild Now" to generate rankings.
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </AdminLayout>
  );
}
