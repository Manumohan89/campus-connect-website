import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Avatar, Chip, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';

const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];
const BRANCHES = ['','CSE','ISE','ECE','ME','CV','EEE','AIML','DS'];
const BADGE_COLORS = { 'CGPA 9+':'#4F46E5','Coding Master':'#EF4444','Course Champion':'#10B981','Full Attendance':'#F59E0B','Forum Expert':'#7C3AED' };

const RANK_ICONS = { 1:'🥇', 2:'🥈', 3:'🥉' };


export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const params = branch ? `?branch=${branch}` : '';
    const token = localStorage.getItem('token');
    const myRankFetch = token
      ? api.get('/leaderboard/my-rank').catch(() => ({ data: null }))
      : Promise.resolve({ data: null });
    Promise.all([
      api.get(`/leaderboard${params}`),
      myRankFetch,
    ]).then(([lb, myR]) => {
      setLeaderboard(lb.data || []);
      setMyRank(myR.data);
    }).catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <PublicHeader />
      <Box sx={{ background:'linear-gradient(135deg,#F59E0B,#D97706)', py:5, px:2 }}>
        <Container>
          <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:1 }}>
            <EmojiEventsIcon sx={{ color:'white', fontSize:'2.5rem' }} />
            <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">Leaderboard</Typography>
          </Box>
          <Typography color="rgba(255,255,255,0.85)" mb={2}>Rankings based on CGPA, coding solved, courses completed, attendance and forum contributions</Typography>
          {myRank && (
            <Box sx={{ bgcolor:'rgba(255,255,255,0.15)', borderRadius:2, px:3, py:1.5, display:'inline-flex', alignItems:'center', gap:2 }}>
              <Typography color="white" fontWeight={700}>Your rank: #{myRank.rank || '?'}</Typography>
              <Typography color="rgba(255,255,255,0.8)" fontSize="0.85rem">Score: {Math.round(myRank.score || 0)}</Typography>
              {(myRank.badges||[]).map(b => <Chip key={b} label={b} size="small" sx={{ bgcolor:'rgba(255,255,255,0.2)', color:'white', fontWeight:700, fontSize:'0.65rem' }} />)}
            </Box>
          )}
        </Container>
      </Box>

      <Container sx={{ py:4, flex:1 }} maxWidth="lg">
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:2 }}>
          <Typography fontWeight={700} color="text.secondary">{leaderboard.length} students ranked</Typography>
          <FormControl size="small" sx={{ minWidth:160 }}>
            <InputLabel>Filter by Branch</InputLabel>
            <Select value={branch} onChange={e => setBranch(e.target.value)} label="Filter by Branch" sx={{ borderRadius:2 }}>
              <MenuItem value="">All Branches</MenuItem>
              {BRANCHES.filter(Boolean).map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* Top 3 podium */}
        {leaderboard.length >= 3 && (
          <Grid container spacing={2} sx={{ mb:3 }} justifyContent="center">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((u, podIdx) => {
              const actualRank = podIdx === 1 ? 1 : podIdx === 0 ? 2 : 3;
              const height = podIdx === 1 ? 180 : 140;
              return (
                <Grid item xs={4} md={3} key={u.user_id}>
                  <Card elevation={0} sx={{ border:`2px solid ${podIdx===1?'#F59E0B':'#E2E8F0'}`, borderRadius:3, textAlign:'center', p:2, position:'relative', height }}>
                    <Typography fontSize="2rem">{RANK_ICONS[actualRank]}</Typography>
                    <Avatar sx={{ width:44, height:44, bgcolor:AVATAR_COLORS[u.user_id%6], mx:'auto', mb:0.5, fontSize:'1rem', fontWeight:700 }}>
                      {u.full_name?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Typography fontWeight={700} fontSize="0.78rem" noWrap>{u.username}</Typography>
                    <Typography fontSize="0.68rem" color="text.secondary">{u.branch}</Typography>
                    <Chip label={`${Math.round(u.score)} pts`} size="small"
                      sx={{ bgcolor:podIdx===1?'#FEF9C3':'#F1F5F9', color:podIdx===1?'#92400E':'#374151', fontWeight:700, fontSize:'0.65rem', mt:0.5 }} />
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {loading ? <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box> : (
          <Card elevation={0} sx={{ border:'1px solid #E2E8F0', borderRadius:3, overflow:'hidden' }}>
            {leaderboard.map((u, i) => (
              <Box key={u.user_id}
                onClick={() => setExpanded(expanded === u.user_id ? null : u.user_id)}
                sx={{ display:'flex', alignItems:'center', gap:2, px:2.5, py:1.75, borderBottom:'1px solid #F1F5F9', cursor:'pointer',
                      bgcolor: u.rank<=3 ? ['#FFF7ED','#FFFBEB','#F7FEE7'][u.rank-1] || 'white' : 'white',
                      '&:hover':{ bgcolor:'#F8FAFC' } }}>
                <Typography fontWeight={900} fontSize="1rem" color={u.rank<=3?'#F59E0B':'#9CA3AF'} sx={{ width:28, textAlign:'center', fontFamily:'monospace' }}>
                  {RANK_ICONS[u.rank] || `#${u.rank}`}
                </Typography>
                <Avatar sx={{ width:36, height:36, bgcolor:AVATAR_COLORS[u.user_id%6], fontSize:'0.85rem', fontWeight:700 }}>
                  {u.full_name?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ flex:1, minWidth:0 }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                    <Typography fontWeight={700} fontSize="0.88rem" noWrap>{u.full_name || u.username}</Typography>
                    {(u.badges||[]).slice(0,2).map(b => (
                      <Chip key={b} label={b} size="small" sx={{ bgcolor:(BADGE_COLORS[b]||'#4F46E5')+'18', color:BADGE_COLORS[b]||'#4F46E5', fontSize:'0.6rem', height:18, fontWeight:700 }} />
                    ))}
                  </Box>
                  <Typography fontSize="0.72rem" color="text.secondary">{u.branch || ''} · CGPA {parseFloat(u.cgpa||0).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ textAlign:'right' }}>
                  <Typography fontWeight={900} fontSize="1.1rem" color="#F59E0B" fontFamily="monospace">{Math.round(u.score)}</Typography>
                  <Typography fontSize="0.65rem" color="text.secondary">points</Typography>
                </Box>
              </Box>
            ))}
            {leaderboard.length === 0 && (
              <Box sx={{ textAlign:'center', py:8, color:'#9CA3AF' }}>
                <EmojiEventsIcon sx={{ fontSize:48, opacity:0.3, mb:2 }} />
                <Typography>No rankings yet. Upload marks and solve problems to appear here!</Typography>
              </Box>
            )}
          </Card>
        )}
      </Container>
      <PublicFooter />
    </Box>
  );
}
