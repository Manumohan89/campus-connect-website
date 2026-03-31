import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, Card, Alert, CircularProgress, Chip, Paper, LinearProgress, Button } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import SchoolIcon from '@mui/icons-material/School';
import { Chart, registerables } from 'chart.js';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

const DIST = [
  { range: '9.0–10.0', label: 'Distinction Zone', color: '#F59E0B', pct: 5 },
  { range: '8.0–8.9', label: '1st Class Distinction', color: '#10B981', pct: 18 },
  { range: '7.0–7.9', label: 'First Class', color: '#6366F1', pct: 28 },
  { range: '6.0–6.9', label: 'Second Class', color: '#0EA5E9', pct: 27 },
  { range: '5.0–5.9', label: 'Pass Class', color: '#F97316', pct: 15 },
  { range: '< 5.0', label: 'Below Pass', color: '#EF4444', pct: 7 },
];

const medalFor = (pct) => {
  if (pct >= 95) return { emoji: '🏆', label: 'Top 5%', bg: '#FEF9C3', fg: '#92400E' };
  if (pct >= 85) return { emoji: '🥇', label: 'Top 15%', bg: '#D1FAE5', fg: '#065F46' };
  if (pct >= 70) return { emoji: '🥈', label: 'Top 30%', bg: '#EEF2FF', fg: '#3730A3' };
  if (pct >= 50) return { emoji: '🥉', label: 'Top 50%', bg: '#E0F2FE', fg: '#075985' };
  return { emoji: '📚', label: 'Keep Going', bg: '#F3F4F6', fg: '#374151' };
};

export default function RankPredictor() {
  const [rankData, setRankData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const barRef = useRef(null);
  const barInst = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/features/rank'), api.get('/users/profile')])
      .then(([r, p]) => { setRankData(r.data); setProfile(p.data); })
      .catch(() => setError('Failed to load rank data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!rankData?.rank || !barRef.current) return;
    if (barInst.current) barInst.current.destroy();
    const { your_cgpa, avg_cgpa, top_cgpa } = rankData;
    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: ['Your CGPA', 'Branch Avg', 'Top CGPA'],
        datasets: [{
          data: [parseFloat(your_cgpa), parseFloat(avg_cgpa), parseFloat(top_cgpa)],
          backgroundColor: ['#6366F1', '#94A3B8', '#F59E0B'],
          borderRadius: 10,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` CGPA: ${ctx.raw}` }, backgroundColor: '#1E1B4B', cornerRadius: 8 } },
        scales: {
          y: { min: 0, max: 10, ticks: { stepSize: 2, color: '#9CA3AF', font: { size: 11 } }, grid: { color: '#F3F4F6' }, border: { display: false } },
          x: { ticks: { color: '#6B7280', font: { size: 11 } }, grid: { display: false }, border: { display: false } },
        },
        animation: { duration: 800, easing: 'easeOutQuart' },
      },
    });
    return () => { if (barInst.current) barInst.current.destroy(); };
  }, [rankData]);

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}><Header /><Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#F59E0B' }} /></Box></Box>;

  const hasData = rankData?.rank;
  const medal = hasData ? medalFor(parseFloat(rankData.percentile)) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FEFCE8' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #1C1917 0%, #451A03 50%, #78350F 100%)', pt: 6, pb: 8, px: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)', fontSize: '180px', opacity: 0.04, lineHeight: 1, userSelect: 'none' }}>🏆</Box>
        <Container>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
            <LeaderboardIcon sx={{ color: '#FDE68A', fontSize: 20 }} />
            <Typography sx={{ color: '#FDE68A', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Academic Standing</Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>Rank Predictor</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 1 }}>Where you stand among your VTU branch peers, based on CGPA</Typography>
          {hasData && (
            <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
              {[
                { l: 'Your Rank', v: `#${rankData.rank}`, c: '#FDE68A' },
                { l: 'Out of', v: rankData.total, c: '#FED7AA' },
                { l: 'Percentile', v: `${rankData.percentile}%`, c: '#BBF7D0' },
                { l: 'Branch', v: rankData.branch, c: '#BAE6FD' },
              ].map((s, i) => (
                <Box key={i} sx={{ bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', borderRadius: '14px', px: 3, py: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: s.c, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.v}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', mt: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      <Container sx={{ py: 5 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

        {!hasData ? (
          <Paper elevation={0} sx={{ border: '2px dashed #FDE68A', borderRadius: '20px', p: 8, textAlign: 'center', bgcolor: 'white' }}>
            <SchoolIcon sx={{ fontSize: 56, color: '#FCD34D', mb: 2 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827', mb: 1 }}>Upload your marks first</Typography>
            <Typography sx={{ color: '#6B7280', mb: 4 }}>Your CGPA needs to be calculated before we can predict your rank</Typography>
            <Button variant="contained" onClick={() => navigate('/upload-marks')}
              sx={{ bgcolor: '#F59E0B', textTransform: 'none', borderRadius: '12px', fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#D97706' } }}>
              Upload Marks Card →
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3} mb={4}>
              {/* Rank card */}
              <Grid item xs={12} md={4}>
                <Card elevation={0} sx={{ border: '2px solid #FDE68A', borderRadius: '20px', p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '5rem', lineHeight: 1 }}>{medal.emoji}</Typography>
                  <Typography sx={{ fontSize: '3.5rem', fontWeight: 900, color: '#B45309', fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>#{rankData.rank}</Typography>
                  <Typography sx={{ color: '#78350F', fontSize: '0.9rem' }}>out of <strong>{rankData.total}</strong> students in {rankData.branch}</Typography>
                  <Chip label={medal.label} sx={{ bgcolor: medal.bg, color: medal.fg, fontWeight: 800, fontSize: '0.9rem', py: 1, height: 'auto', alignSelf: 'center' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#92400E', mb: 0.5 }}>Top percentile</Typography>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#10B981', fontFamily: "'DM Mono', monospace" }}>{rankData.percentile}%</Typography>
                    <LinearProgress variant="determinate" value={parseFloat(rankData.percentile)}
                      sx={{ mt: 0.75, height: 8, borderRadius: 99, bgcolor: '#FEF9C3', '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 99 } }} />
                  </Box>
                </Card>
              </Grid>

              {/* Stats + chart */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2} mb={2}>
                  {[
                    { l: 'Your CGPA', v: parseFloat(rankData.your_cgpa).toFixed(2), c: '#6366F1', sub: profile?.branch },
                    { l: 'Branch Average', v: rankData.avg_cgpa, c: '#6B7280', sub: 'All students' },
                    { l: 'Top CGPA', v: parseFloat(rankData.top_cgpa).toFixed(2), c: '#F59E0B', sub: 'Rank #1' },
                    { l: 'Gap to Topper', v: (parseFloat(rankData.top_cgpa) - parseFloat(rankData.your_cgpa)).toFixed(2), c: parseFloat(rankData.top_cgpa) - parseFloat(rankData.your_cgpa) < 0.5 ? '#10B981' : '#EF4444', sub: 'CGPA points' },
                  ].map((s, i) => (
                    <Grid item xs={6} key={i}>
                      <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '14px', p: 2.5, textAlign: 'center', bgcolor: 'white' }}>
                        <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: s.c, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.v}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151', mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{s.sub}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '14px', p: 3, bgcolor: 'white', height: 200 }}>
                  <canvas ref={barRef} style={{ height: '100%' }} />
                </Paper>
              </Grid>
            </Grid>

            {/* Distribution */}
            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', overflow: 'hidden', bgcolor: 'white' }}>
              <Box sx={{ px: 4, py: 3, borderBottom: '1px solid #F3F4F6' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>VTU CGPA Distribution Reference</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Where most VTU students typically fall</Typography>
              </Box>
              {DIST.map((r, i) => {
                const cgpa = parseFloat(rankData.your_cgpa);
                const [lo, hi] = r.range.includes('–') ? r.range.split('–').map(parseFloat) : [0, 5];
                const isYours = r.range.startsWith('<') ? cgpa < 5 : cgpa >= lo && cgpa <= hi;
                return (
                  <Box key={i} sx={{ px: 4, py: 2, borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', gap: 3, bgcolor: isYours ? '#FEFCE8' : 'white' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: r.color, minWidth: 80 }}>{r.range}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress variant="determinate" value={r.pct}
                        sx={{ height: 7, borderRadius: 99, bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': { bgcolor: r.color, borderRadius: 99 } }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', minWidth: 70, textAlign: 'right' }}>{r.pct}% of students</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', minWidth: 140, display: { xs: 'none', md: 'block' } }}>{r.label}</Typography>
                    {isYours && <Chip label="📍 You" size="small" sx={{ bgcolor: '#FEF9C3', color: '#92400E', fontWeight: 800, fontSize: '0.65rem' }} />}
                  </Box>
                );
              })}
            </Paper>
          </>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
