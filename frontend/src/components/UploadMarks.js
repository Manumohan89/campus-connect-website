import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Alert,
  Stack, Paper, LinearProgress, Chip, Grid, Divider, Snackbar
} from '@mui/material';
import { CloudUpload, CheckCircle, BarChart, School, Warning } from '@mui/icons-material';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function GradeBadge({ gp }) {
  const map = { 10: ['S', '#D1FAE5', '#065F46'], 9: ['A', '#DBEAFE', '#1E3A8A'], 8: ['B', '#EDE9FE', '#4C1D95'], 7: ['C', '#FEF9C3', '#713F12'], 6: ['D', '#FEF3C7', '#92400E'] };
  const [label, bg, color] = map[gp] || ['F', '#FEE2E2', '#991B1B'];
  return <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>{label}</span>;
}

function UploadMarks() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');
  const [marks, setMarks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/marks').then(r => setMarks(r.data)).catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please select a PDF file.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File size must be under 10MB.'); return; }
    setFile(f);
    setFileName(f.name);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a marks card PDF.'); return; }
    const formData = new FormData();
    formData.append('marksCard', file);
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/users/upload-marks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      setSnack(`✅ ${res.data.subjects_count} subjects processed! SGPA: ${res.data.sgpa?.toFixed(2)}`);
      setFile(null);
      setFileName('');
      // Refresh marks from DB (slight delay to ensure DB write complete)
      setTimeout(() => {
        api.get('/users/marks').then(r => setMarks(r.data)).catch(() => {});
      }, 500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Please ensure the PDF is a valid VTU marks card.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const failedCount = marks.filter(m => m.total < 40).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />
      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} fontFamily="'Space Grotesk', sans-serif" mb={1}>📤 Upload Marks Card</Typography>
          <Typography color="text.secondary" mb={4}>Upload your VTU marks card PDF to automatically calculate SGPA & CGPA</Typography>

          <Grid container spacing={4}>
            {/* Upload panel */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3, height: '100%' }}>
                {/* How it works */}
                <Paper sx={{ p: 2.5, bgcolor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 2, mb: 3 }}>
                  <Typography fontWeight={700} color="#4F46E5" mb={1} fontSize="0.9rem">How it works</Typography>
                  {['Upload your official VTU marks card PDF', 'Our system reads subject codes, internal + external marks', 'Credits are matched from VTU subject database', 'SGPA is calculated: Σ(Grade Points × Credits) / Σ(Credits)', 'Your CGPA is updated across all uploaded semesters'].map((s, i) => (
                    <Typography key={i} variant="body2" color="#3730A3" sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <span style={{ fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>{s}
                    </Typography>
                  ))}
                </Paper>

                {/* VTU Grading */}
                <Paper sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }}>
                  <Typography fontWeight={700} mb={1.5} fontSize="0.9rem">VTU Grading Scale</Typography>
                  <Grid container spacing={1}>
                    {[['≥90', 'S', '10'], ['80-89', 'A', '9'], ['70-79', 'B', '8'], ['60-69', 'C', '7'], ['50-59', 'D', '6'], ['40-49', 'E', '4'], ['<40', 'F', '0']].map(([marks, grade, gp]) => (
                      <Grid item xs={6} key={grade}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 0.75, bgcolor: 'white', borderRadius: 1, border: '1px solid #E2E8F0' }}>
                          <GradeBadge gp={parseInt(gp)} />
                          <Typography variant="caption" color="text.secondary">{marks} → {gp} pts</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                {/* Upload area */}
                <Paper component="label" sx={{ p: 4, textAlign: 'center', border: `2px dashed ${fileName ? '#4F46E5' : '#CBD5E1'}`, bgcolor: fileName ? '#EEF2FF' : '#F8FAFC', borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#4F46E5', bgcolor: '#EEF2FF' }, display: 'block', mb: 2 }}>
                  <input hidden type="file" accept=".pdf" onChange={handleFileChange} disabled={loading} />
                  <CloudUpload sx={{ fontSize: 48, color: fileName ? '#4F46E5' : '#94A3B8', mb: 1 }} />
                  <Typography fontWeight={600} color={fileName ? '#4F46E5' : '#64748B'}>
                    {fileName ? `📄 ${fileName}` : 'Click to select your marks card PDF'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">PDF only, max 10MB</Typography>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>Processing your marks card...</Typography>
                    <LinearProgress sx={{ borderRadius: 99 }} />
                  </Box>
                )}
                <Button fullWidth variant="contained" size="large" onClick={handleUpload} disabled={loading || !file}
                  sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', fontWeight: 700, py: 1.5, borderRadius: 2, textTransform: 'none', boxShadow: 'none', fontSize: '1rem' }}>
                  {loading ? 'Processing...' : '🚀 Calculate SGPA & CGPA'}
                </Button>
              </Card>
            </Grid>

            {/* Results / Current marks panel */}
            <Grid item xs={12} md={6}>
              {result && (
                <Card elevation={0} sx={{ border: '2px solid #10B981', borderRadius: 3, p: 3, mb: 3, bgcolor: '#F0FDF4' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircle sx={{ color: '#10B981' }} />
                    <Typography fontWeight={700} fontFamily="'Space Grotesk', sans-serif" color="#065F46">Upload Successful!</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2 }}>
                        <Typography variant="h3" fontWeight={800} color="#4F46E5">{result.sgpa?.toFixed(2) || 'N/A'}</Typography>
                        <Typography fontWeight={600} color="#64748B">SGPA</Typography>
                        {result.subjects_count && <Typography variant="caption" color="#6B7280">{result.subjects_count} subjects</Typography>}
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2 }}>
                        <Typography variant="h3" fontWeight={800} color="#7C3AED">{result.cgpa?.toFixed(2) || 'N/A'}</Typography>
                        <Typography fontWeight={600} color="#64748B">CGPA</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Button fullWidth variant="outlined" startIcon={<BarChart />} onClick={() => navigate('/analytics')} sx={{ mt: 2, borderRadius: 2, textTransform: 'none', borderColor: '#10B981', color: '#065F46', fontWeight: 600 }}>
                    View Full Analytics
                  </Button>
                </Card>
              )}

              {/* Current Marks */}
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontWeight={700} fontFamily="'Space Grotesk', sans-serif">Current Marks</Typography>
                  <Stack direction="row" gap={1}>
                    <Chip label={`${marks.length} subjects`} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5' }} />
                    {failedCount > 0 && <Chip icon={<Warning sx={{ fontSize: '14px !important' }} />} label={`${failedCount} failed`} size="small" sx={{ bgcolor: '#FEE2E2', color: '#991B1B' }} />}
                  </Stack>
                </Box>
                {marks.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <School sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                    <Typography color="text.secondary">No marks uploaded yet</Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', position: 'sticky', top: 0 }}>
                          <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B' }}>Code</th>
                          <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#64748B' }}>Int</th>
                          <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#64748B' }}>Ext</th>
                          <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#64748B' }}>Total</th>
                          <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#64748B' }}>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marks.map((m, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #F1F5F9', background: m.total < 40 ? '#FFF5F5' : 'white' }}>
                            <td style={{ padding: '10px 16px', fontWeight: 600, color: '#4F46E5' }}>{m.subject_code}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>{m.internal_marks}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>{m.external_marks}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: m.total < 40 ? '#EF4444' : '#0F172A' }}>{m.total}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'center' }}><GradeBadge gp={m.grade_points} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                )}
                {failedCount > 0 && (
                  <>
                    <Divider />
                    <Box sx={{ p: 2.5, bgcolor: '#FFF5F5' }}>
                      <Typography variant="body2" color="#991B1B" fontWeight={600} mb={1}>⚠️ {failedCount} failed subject(s) — get help clearing them!</Typography>
                      <Button size="small" variant="outlined" onClick={() => navigate('/training')} sx={{ borderColor: '#EF4444', color: '#EF4444', textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                        View Backlog Clearing Courses →
                      </Button>
                    </Box>
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
      <Footer />
    </Box>
  );
}

export default UploadMarks;
