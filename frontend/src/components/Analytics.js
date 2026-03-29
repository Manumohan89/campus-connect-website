import React, { useEffect, useState, useRef } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, CircularProgress, Alert, Paper } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

Chart.register(...registerables);

const GradeColor = { S: '#10B981', A: '#3B82F6', B: '#8B5CF6', C: '#F59E0B', D: '#F97316', F: '#EF4444' };

function getGradeLetter(gp) {
  if (gp >= 10) return 'S';
  if (gp >= 9) return 'A';
  if (gp >= 8) return 'B';
  if (gp >= 7) return 'C';
  if (gp >= 6) return 'D';
  return 'F';
}

function Analytics() {
  const [profile, setProfile] = useState(null);
  const [marks, setMarks] = useState([]);
  const [sgpaHistory, setSgpaHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sgpaChartRef = useRef(null);
  const subjectChartRef = useRef(null);
  const sgpaChartInstance = useRef(null);
  const subjectChartInstance = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, marksRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/users/marks'),
        ]);
        setProfile(profileRes.data);
        setMarks(marksRes.data || []);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!marks.length) return;

    // Destroy old chart instances
    if (sgpaChartInstance.current) sgpaChartInstance.current.destroy();
    if (subjectChartInstance.current) subjectChartInstance.current.destroy();

    // Subject performance bar chart
    if (subjectChartRef.current) {
      subjectChartInstance.current = new Chart(subjectChartRef.current, {
        type: 'bar',
        data: {
          labels: marks.map(m => m.subject_code),
          datasets: [
            { label: 'Internal', data: marks.map(m => m.internal_marks), backgroundColor: 'rgba(79, 70, 229, 0.7)', borderRadius: 4 },
            { label: 'External', data: marks.map(m => m.external_marks), backgroundColor: 'rgba(124, 58, 237, 0.7)', borderRadius: 4 },
            { label: 'Total', data: marks.map(m => m.total), backgroundColor: 'rgba(14, 165, 233, 0.7)', borderRadius: 4 },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'top' }, title: { display: true, text: 'Subject-wise Performance' } },
          scales: { y: { beginAtZero: true, max: 100 } },
        },
      });
    }

    // Grade point doughnut
    if (sgpaChartRef.current && profile) {
      const gradeCount = marks.reduce((acc, m) => {
        const g = getGradeLetter(m.grade_points);
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(gradeCount);
      sgpaChartInstance.current = new Chart(sgpaChartRef.current, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: labels.map(l => gradeCount[l]), backgroundColor: labels.map(l => GradeColor[l] || '#94A3B8'), borderWidth: 2 }],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Grade Distribution' } },
        },
      });
    }
    return () => {
      if (sgpaChartInstance.current) sgpaChartInstance.current.destroy();
      if (subjectChartInstance.current) subjectChartInstance.current.destroy();
    };
  }, [marks, profile]);

  const failedSubjects = marks.filter(m => m.total < 40);
  const passedSubjects = marks.filter(m => m.total >= 40);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />
      <Box sx={{ flex: 1, py: 4 }}>
        <Container>
          <Typography variant="h4" fontWeight={700} fontFamily="'Space Grotesk', sans-serif" mb={1}>📊 Analytics</Typography>
          <Typography color="text.secondary" mb={4}>Your complete academic performance overview</Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            {[
              { label: 'CGPA', value: profile?.cgpa?.toFixed(2) || 'N/A', color: '#4F46E5', sub: 'Cumulative' },
              { label: 'SGPA', value: profile?.sgpa?.toFixed(2) || 'N/A', color: '#10B981', sub: 'Latest Semester' },
              { label: 'Subjects Passed', value: passedSubjects.length, color: '#0EA5E9', sub: `of ${marks.length} total` },
              { label: 'Subjects Failed', value: failedSubjects.length, color: '#EF4444', sub: failedSubjects.length > 0 ? 'Needs attention' : 'All clear! 🎉' },
            ].map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" fontWeight={800} color={s.color} fontFamily="'Space Grotesk', sans-serif">{s.value}</Typography>
                  <Typography fontWeight={600} mt={0.5}>{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {marks.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', border: '2px dashed #E2E8F0', borderRadius: 3, bgcolor: 'white' }}>
              <Typography fontSize="3rem">📤</Typography>
              <Typography variant="h6" fontWeight={600} mt={2}>No marks data yet</Typography>
              <Typography color="text.secondary">Upload your marks card to see your performance analytics</Typography>
            </Paper>
          ) : (
            <>
              {/* Charts */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={8}>
                  <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3 }}>
                    <canvas ref={subjectChartRef} />
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: 3 }}>
                    <canvas ref={sgpaChartRef} />
                  </Card>
                </Grid>
              </Grid>

              {/* Marks Table */}
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontWeight={700} fontFamily="'Space Grotesk', sans-serif">Subject-wise Marks</Typography>
                  <Chip label={`${marks.length} subjects`} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5' }} />
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        {['Subject Code', 'Subject Name', 'Internal', 'External', 'Total', 'Credits', 'Grade Points', 'Grade'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((m, i) => {
                        const grade = getGradeLetter(m.grade_points);
                        const failed = m.total < 40;
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', background: failed ? '#FFF5F5' : 'white' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#4F46E5' }}>{m.subject_code}</td>
                            <td style={{ padding: '12px 16px', maxWidth: 200 }}>{m.subject_name || '—'}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{m.internal_marks}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{m.external_marks}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: failed ? '#EF4444' : '#10B981' }}>{m.total}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{m.credits}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{m.grade_points}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: GradeColor[grade] + '22', color: GradeColor[grade] }}>{grade}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              </Card>

              {/* Failed subjects alert */}
              {failedSubjects.length > 0 && (
                <Card elevation={0} sx={{ mt: 3, border: '1px solid #FCA5A5', borderRadius: 3, bgcolor: '#FFF5F5', p: 3 }}>
                  <Typography fontWeight={700} color="#991B1B" mb={1}>⚠️ Subjects Needing Attention ({failedSubjects.length})</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {failedSubjects.map((s, i) => (
                      <Chip key={i} label={`${s.subject_code} — ${s.total}/100`} sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 600 }} />
                    ))}
                  </Box>
                  <Typography variant="body2" color="#B45309" mt={2}>
                    💡 Check the <strong>Training</strong> section for backlog clearing courses for these subjects!
                  </Typography>
                </Card>
              )}
            </>
          )}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

export default Analytics;
