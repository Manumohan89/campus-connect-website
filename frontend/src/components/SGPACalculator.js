import React, { useState } from 'react';
import {
  Box, Container, Typography, Card, Button, Alert, Paper,
  LinearProgress, Grid, Chip, Divider, Stack, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { CloudUpload, Calculate, CheckCircle, Login } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import axios from 'axios';

// Public route — no auth token needed, but must use absolute URL in production
const PUBLIC_API_BASE = (() => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.endsWith('/api') ? envUrl : envUrl.replace(/\/$/, '') + '/api';
  return '/api';
})();

function GradeBadge({ gp }) {
  const map = { 10:['S','#D1FAE5','#065F46'], 9:['A','#DBEAFE','#1E3A8A'], 8:['B','#EDE9FE','#4C1D95'], 7:['C','#FEF9C3','#713F12'], 6:['D','#FEF3C7','#92400E'], 4:['E','#FEE2E2','#991B1B'] };
  const [label, bg, color] = map[gp] || ['F','#FEE2E2','#991B1B'];
  return <span style={{ padding:'2px 10px', borderRadius:999, fontSize:'0.75rem', fontWeight:700, background:bg, color }}>{label}</span>;
}

const GRADING = [
  ['≥90','S','10','#065F46','#D1FAE5'],
  ['80–89','A','9','#1E3A8A','#DBEAFE'],
  ['70–79','B','8','#4C1D95','#EDE9FE'],
  ['60–69','C','7','#713F12','#FEF9C3'],
  ['50–59','D','6','#92400E','#FEF3C7'],
  ['40–49','E','4','#991B1B','#FEE2E2'],
  ['<40','F','0','#FFFFFF','#EF4444'],
];

export default function SGPACalculator() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please select a PDF file.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File too large — max 10MB.'); return; }
    setFile(f); setFileName(f.name); setError(null); setResult(null);
  };

  const handleCalculate = async () => {
    if (!file) { setError('Please select a VTU marks card PDF.'); return; }
    setLoading(true); setError(null);
    const fd = new FormData();
    fd.append('marksCard', file);
    try {
      // Do NOT set Content-Type manually with FormData — axios sets it with boundary automatically
      const res = await axios.post(`${PUBLIC_API_BASE}/users/sgpa-public`, fd);
      setResult(res.data);
      setFile(null); setFileName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not process the PDF. Please ensure it is a valid VTU marks card.');
    } finally {
      setLoading(false);
    }
  };

  const sgpaColor = result?.sgpa >= 9 ? '#065F46' : result?.sgpa >= 8 ? '#1E3A8A' : result?.sgpa >= 6 ? '#92400E' : '#991B1B';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
      <PublicHeader />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 60%, #7C3AED 100%)', py: { xs: 6, md: 8 }, px: 2, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Chip label="Free Tool — No Login Required" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, mb: 2 }} />
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 900, color: 'white', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.15, mb: 2 }}>
            VTU SGPA Calculator
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}>
            Upload your VTU marks card PDF and instantly get your SGPA calculated using the official VTU grading formula.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>

          {/* Left: Upload + How it works */}
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '20px', p: 3, mb: 3 }}>
              <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" fontSize="1.1rem" mb={2}>Upload Marks Card PDF</Typography>

              {/* Drop zone */}
              <Paper component="label" sx={{ p: 4, textAlign: 'center', border: `2px dashed ${fileName ? '#4F46E5' : '#CBD5E1'}`, bgcolor: fileName ? '#EEF2FF' : '#F8FAFC', borderRadius: '14px', cursor: 'pointer', display: 'block', mb: 2, transition: 'all 0.2s', '&:hover': { borderColor: '#4F46E5', bgcolor: '#EEF2FF' } }}>
                <input hidden type="file" accept=".pdf" onChange={handleFileChange} disabled={loading} />
                <CloudUpload sx={{ fontSize: 44, color: fileName ? '#4F46E5' : '#94A3B8', mb: 1 }} />
                <Typography fontWeight={600} color={fileName ? '#4F46E5' : '#64748B'}>
                  {fileName ? `📄 ${fileName}` : 'Click to select your marks card PDF'}
                </Typography>
                <Typography variant="caption" color="text.secondary">PDF only · max 10MB · VTU official marks card</Typography>
              </Paper>

              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

              {loading && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>Reading your marks card...</Typography>
                  <LinearProgress sx={{ borderRadius: 99 }} />
                </Box>
              )}

              <Button fullWidth variant="contained" size="large" onClick={handleCalculate} disabled={loading || !file}
                startIcon={loading ? null : <Calculate />}
                sx={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', fontWeight: 700, py: 1.5, borderRadius: '12px', textTransform: 'none', fontSize: '1rem', boxShadow: 'none' }}>
                {loading ? <><CircularProgress size={20} sx={{ color: 'white', mr: 1 }} /> Calculating...</> : 'Calculate SGPA'}
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* Save reminder */}
              <Box sx={{ p: 2, bgcolor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px' }}>
                <Typography fontWeight={700} color="#92400E" fontSize="0.85rem" mb={0.5}>💾 Want to save your results?</Typography>
                <Typography fontSize="0.8rem" color="#92400E" mb={1.5}>
                  {isLoggedIn ? 'Go to Upload Marks to save to your profile.' : 'Register for free to save your SGPA, track CGPA across semesters, and get backlog alerts.'}
                </Typography>
                {isLoggedIn ? (
                  <Button size="small" variant="outlined" onClick={() => navigate('/upload-marks')} sx={{ textTransform: 'none', borderColor: '#F59E0B', color: '#92400E', borderRadius: '8px', fontWeight: 600 }}>
                    Save to my profile →
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" onClick={() => navigate('/register')} sx={{ textTransform: 'none', bgcolor: '#F59E0B', color: '#1C1917', fontWeight: 700, borderRadius: '8px', boxShadow: 'none', '&:hover': { bgcolor: '#D97706' } }}>
                      Register Free
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => navigate('/login')} startIcon={<Login />} sx={{ textTransform: 'none', borderColor: '#F59E0B', color: '#92400E', borderRadius: '8px', fontWeight: 600 }}>
                      Login
                    </Button>
                  </Stack>
                )}
              </Box>
            </Card>

            {/* How it works */}
            <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '20px', p: 3 }}>
              <Typography fontWeight={700} fontSize="0.9rem" mb={2}>How it works</Typography>
              {[
                ['📄', 'Upload', 'Your official VTU marks card PDF'],
                ['🔍', 'Extract', 'Subject codes, internal & external marks'],
                ['📊', 'Calculate', 'SGPA using Σ(GP × Credits) / Σ(Credits)'],
                ['🎓', 'Result', 'Instant SGPA with full subject breakdown'],
              ].map(([emoji, title, desc], i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{emoji}</Box>
                  <Box><Typography fontWeight={700} fontSize="0.82rem" color="#111827">{title}</Typography><Typography fontSize="0.78rem" color="#64748B">{desc}</Typography></Box>
                </Box>
              ))}
            </Card>
          </Grid>

          {/* Right: Grading scale + Result */}
          <Grid item xs={12} md={7}>
            {/* Result */}
            {result && result.subjects?.length > 0 && (
              <Card elevation={0} sx={{ border: '2px solid #4F46E5', borderRadius: '20px', p: 3, mb: 3, bgcolor: '#FAFAFE' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <CheckCircle sx={{ color: '#10B981', fontSize: 28 }} />
                  <Box>
                    <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" fontSize="1.1rem" color="#111827">Results</Typography>
                    <Typography fontSize="0.78rem" color="#64748B">{result.subjects.length} subjects · {result.total_credits} total credits</Typography>
                  </Box>
                </Box>

                {/* SGPA big number */}
                <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', mb: 3 }}>
                  <Typography fontSize="4.5rem" fontWeight={900} color={sgpaColor} fontFamily="'Space Grotesk',sans-serif" lineHeight={1}>{result.sgpa?.toFixed(2)}</Typography>
                  <Typography fontWeight={700} color="#64748B" mt={0.5}>SGPA</Typography>
                  <Typography fontSize="0.78rem" color="#9CA3AF">
                    {result.total_grade_points} grade points ÷ {result.total_credits} credits
                  </Typography>
                </Box>

                {/* Subjects table */}
                <Box sx={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
                        {['Code','Subject','Int','Ext','Total','Cr','GP','Grade'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', bgcolor: 'var(--bg-card2,#F8FAFC)', py: 1.25 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.subjects.map((s, i) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: 'var(--bg-card2,#F8FAFC)' }, bgcolor: s.total_marks < 40 ? '#FFF5F5' : 'white' }}>
                          <TableCell sx={{ fontWeight: 700, color: '#4F46E5', fontSize: '0.78rem' }}>{s.subject_code}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: '#374151', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subject_name}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.78rem' }}>{s.internal_marks}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.78rem' }}>{s.external_marks}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: s.total_marks < 40 ? '#EF4444' : '#111827', fontSize: '0.82rem' }}>{s.total_marks}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.78rem' }}>{s.credits}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.grade_points}</TableCell>
                          <TableCell align="center"><GradeBadge gp={s.grade_points} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>

                {result.subjects.filter(s => s.total_marks < 40).length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
                    {result.subjects.filter(s => s.total_marks < 40).length} failed subject(s) detected.{' '}
                    <Link to="/training" style={{ color: '#92400E', fontWeight: 700 }}>Free backlog clearing courses →</Link>
                  </Alert>
                )}

                {!isLoggedIn && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#EEF2FF', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography fontSize="0.85rem" fontWeight={600} color="#4F46E5">Register to save results & track CGPA →</Typography>
                    <Button size="small" variant="contained" onClick={() => navigate('/register')} sx={{ bgcolor: '#4F46E5', textTransform: 'none', fontWeight: 700, borderRadius: '8px', boxShadow: 'none' }}>Register Free</Button>
                  </Box>
                )}
              </Card>
            )}

            {result && result.subjects?.length === 0 && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
                No subjects could be extracted from this PDF. Please ensure you uploaded an official VTU marks card PDF (not scanned or image-based).
              </Alert>
            )}

            {/* VTU Grading Scale */}
            <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '20px', p: 3 }}>
              <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" fontSize="1rem" mb={2}>VTU Grading Scale (2021 Scheme)</Typography>
              <Grid container spacing={1}>
                {GRADING.map(([range, grade, points, textColor, bgColor]) => (
                  <Grid item xs={6} sm={4} key={grade}>
                    <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: bgColor, border: `1px solid ${bgColor}`, textAlign: 'center' }}>
                      <Typography fontWeight={900} color={textColor} fontSize="1.3rem">{grade}</Typography>
                      <Typography fontWeight={700} color={textColor} fontSize="0.7rem">{range}</Typography>
                      <Typography color={textColor} fontSize="0.68rem" sx={{ opacity: 0.8 }}>{points} grade points</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2.5, p: 2, bgcolor: 'var(--bg-card2,#F8FAFC)', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <Typography fontWeight={700} fontSize="0.82rem" color="#374151" mb={0.5}>SGPA Formula</Typography>
                <Typography fontFamily="'DM Mono',monospace" fontSize="0.82rem" color="#4F46E5">
                  SGPA = Σ(Grade Points × Credits) / Σ(Credits)
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <PublicFooter />
    </Box>
  );
}
