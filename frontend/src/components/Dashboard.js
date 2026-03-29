import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Grid, Card, CardContent, Typography, Button,
  Alert, Skeleton, Chip, Divider, LinearProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import QuizIcon from '@mui/icons-material/Quiz';
import CodeIcon from '@mui/icons-material/Code';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PersonIcon from '@mui/icons-material/Person';
import ShareIcon from '@mui/icons-material/Share';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import StyleIcon from '@mui/icons-material/Style';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StarIcon from '@mui/icons-material/Star';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import Onboarding from './Onboarding';
import './Dashboard.css';

const QuickCard = ({ icon, title, desc, action, badge, color = '#4F46E5', highlight, badgeColor }) => (
  <Card elevation={0} onClick={action}
    sx={{ border: `1px solid ${highlight ? color + '55' : '#E2E8F0'}`, bgcolor: highlight ? color + '06' : 'white', borderRadius: 3, cursor: 'pointer', height: '100%', transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 30px ${color}22`, borderColor: color + '55' } }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
        </Box>
        {badge && <Chip label={badge} size="small" sx={{ bgcolor: (badgeColor || color) + '18', color: badgeColor || color, fontWeight: 700, fontSize: '0.62rem', height: 20 }} />}
      </Box>
      <Typography fontWeight={700} fontFamily="'Space Grotesk', sans-serif" mb={0.5} fontSize="0.88rem">{title}</Typography>
      <Typography variant="body2" color="text.secondary" lineHeight={1.5} fontSize="0.8rem">{desc}</Typography>
    </CardContent>
  </Card>
);

function Dashboard() {
  const [data, setData] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding only once per user
    return localStorage.getItem('onboardingDone') !== 'true';
  });
  const handleCloseOnboarding = () => {
    localStorage.setItem('onboardingDone', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    Promise.all([api.get('/users/dashboard-data'), api.get('/users/marks')])
      .then(([d, m]) => { setData(d.data); setMarks(m.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const failedSubjects = marks.filter(m => m.total < 40);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container sx={{ py: 4, flex: 1 }}>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 3 }} />
        <Grid container spacing={2.5}>
          {[...Array(12)].map((_, i) => <Grid item xs={6} sm={4} md={3} key={i}><Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />
      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="xl">

          {/* Welcome Banner */}
          <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E3A8A 100%)', color: 'white', p: { xs: 3, md: 4 }, borderRadius: 3, mb: 4, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)' }} />
            <Box sx={{ position: 'relative' }}>
              <Typography variant="h4" fontWeight={800} fontFamily="'Space Grotesk', sans-serif" mb={0.5}>
                Welcome back, {data?.username || 'Student'}! 👋
              </Typography>
              <Typography sx={{ opacity: 0.8, mb: 3, fontSize: '0.95rem' }}>Your complete VTU academic command centre</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Semester', value: data?.semester || '—' },
                  { label: 'CGPA', value: data?.cgpa && data.cgpa !== 'N/A' ? parseFloat(data.cgpa).toFixed(2) : data?.cgpa || '—' },
                  { label: 'Subjects', value: marks.length || '—' },
                  { label: 'Backlogs', value: failedSubjects.length, alert: failedSubjects.length > 0 },
                ].map((s, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: { xs: 1.5, md: 2 }, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Typography>
                      <Typography variant="h4" fontWeight={800} fontFamily="'Space Grotesk', sans-serif"
                        sx={{ color: s.alert ? '#FCA5A5' : 'white', fontSize: { xs: '1.5rem', md: '2rem' } }}>{s.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>

          {/* Backlog Alert */}
          {failedSubjects.length > 0 && (
            <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 2 }}
              action={<Button color="inherit" size="small" onClick={() => navigate('/backlog-dashboard')} sx={{ textTransform: 'none', fontWeight: 700 }}>View Details →</Button>}>
              <strong>⚠️ {failedSubjects.length} backlog(s):</strong> {failedSubjects.map(s => s.subject_code).join(', ')} — Free clearing courses available!
            </Alert>
          )}

          {/* ── SECTION 1: Academics ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1.5 }}>📊 Academics</Typography>
          <Grid container spacing={2.5} mt={0.5} mb={3}>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<UploadFileIcon />} title="Upload Marks Card" desc="Auto-calculate SGPA & CGPA from your PDF" action={() => navigate('/upload-marks')} /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<AnalyticsIcon />} title="Analytics" desc="Subject-wise performance & grade charts" action={() => navigate('/analytics')} /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<TrendingUpIcon />} title="CGPA Tracker" desc="Semester history + SGPA trend graph" action={() => navigate('/cgpa-tracker')} badge="NEW" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<WarningIcon />} title="Backlog Dashboard" desc="Failed subjects, countdown & revaluation form" action={() => navigate('/backlog-dashboard')} badge={failedSubjects.length > 0 ? `${failedSubjects.length} active` : 'NEW'} color="#EF4444" badgeColor="#EF4444" highlight={failedSubjects.length > 0} /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<EmojiEventsIcon />} title="Rank Predictor" desc="See your class rank & percentile vs peers" action={() => navigate('/rank-predictor')} badge="NEW" color="#F59E0B" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<CheckBoxIcon />} title="Attendance Tracker" desc="Track % per subject — warning below 85%" action={() => navigate('/attendance')} /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<EventIcon />} title="Exam Timetable" desc="Schedule exams with 3-day reminder alerts" action={() => navigate('/exam-timetable')} /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<NotificationsIcon />} title="Reminders" desc="Set custom reminders for deadlines & events" action={() => navigate('/reminders')} /></Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* ── SECTION 2: Learning ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1.5 }}>🎓 Learning & Resources</Typography>
          <Grid container spacing={2.5} mt={0.5} mb={3}>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<PlayCircleIcon />} title="Training Courses" desc="Backlog clearing, upskill & placement prep" action={() => navigate('/training')} badge="FREE" color="#7C3AED" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<MenuBookIcon />} title="VTU Resources" desc="Notes, QPs & syllabus — scheme & sem wise" action={() => navigate('/vtu-resources')} color="#0EA5E9" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<GroupIcon />} title="Community Notes" desc="Student-uploaded notes & PYQs with ratings" action={() => navigate('/community-notes')} badge="NEW" color="#059669" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<QuizIcon />} title="Mock Tests" desc="MCQs + upload QP PDF for instant AI practice" action={() => navigate('/mock-test')} badge="AI" color="#EF4444" badgeColor="#EF4444" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<CodeIcon />} title="Coding Platform" desc="LeetCode-style DSA problems — Python, Java, C, C#" action={() => navigate('/coding')} badge="NEW" color="#0f0f0f" badgeColor="#10B981" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<QuestionAnswerIcon />} title="Peer Forum" desc="Ask doubts, answer questions, earn reputation" action={() => navigate('/forum')} badge="NEW" color="#7C3AED" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<StyleIcon />} title="Flashcards" desc="Spaced repetition study cards for exam prep" action={() => navigate('/flashcards')} badge="NEW" color="#4F46E5" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<AnnouncementIcon />} title="VTU News" desc="Exam alerts, results, syllabus updates" action={() => navigate('/vtu-news')} color="#0EA5E9" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<AutoAwesomeIcon />} title="AI Study Tutor" desc="Ask any VTU subject question, get step-by-step answers" action={() => navigate('/ai-tutor')} badge="AI" color="#7C3AED" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<WorkIcon />} title="Interview Prep" desc="HR + technical mock interviews with AI feedback" action={() => navigate('/interview-prep')} badge="AI" color="#059669" /></Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* ── SECTION 3: Career & Placement ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1.5 }}>💼 Career & Placement</Typography>
          <Grid container spacing={2.5} mt={0.5} mb={3}>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<WorkIcon />} title="Placement Drives" desc="Company drives with eligibility checker & apply" action={() => navigate('/placement-drives')} badge="NEW" color="#4F46E5" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<DescriptionIcon />} title="Resume Builder" desc="ATS-ready resume builder with live preview & PDF" action={() => navigate('/resume-builder')} badge="NEW" color="#7C3AED" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<PeopleIcon />} title="Alumni Mentorship" desc="Connect with seniors at Google, Microsoft & more" action={() => navigate('/alumni-mentorship')} badge="NEW" color="#059669" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<WorkIcon />} title="Job Opportunities" desc="Browse internships & off-campus openings" action={() => navigate('/job-opportunities')} /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<LeaderboardIcon />} title="Leaderboard" desc="See your rank across CGPA, coding & courses" action={() => navigate('/leaderboard')} badge="NEW" color="#F59E0B" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<EmojiEventsIcon />} title="Scholarships" desc="Find Karnataka & central govt scholarships you qualify for" action={() => navigate('/scholarships')} badge="FREE" color="#F59E0B" /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<StarIcon />} title="Go Premium" desc="Unlock AI tutor, unlimited coding & all resources" action={() => navigate('/premium')} badge="⭐" color="#4F46E5" badgeColor="#F59E0B" /></Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* ── SECTION 4: Profile & Social ── */}
          <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1.5 }}>👤 Profile & Social</Typography>
          <Grid container spacing={2.5} mt={0.5} mb={4}>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<PersonIcon />} title="My Profile" desc="View & update your academic profile" action={() => navigate('/profile')} /></Grid>
            <Grid item xs={6} sm={4} md={3}><QuickCard icon={<ShareIcon />} title="Share Documents" desc="Share notes & files with classmates" action={() => navigate('/share-documents')} /></Grid>
          </Grid>

          {/* Recent Marks Summary */}
          {marks.length > 0 && (
            <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
                <Typography fontWeight={700} fontFamily="'Space Grotesk', sans-serif">Recent Marks</Typography>
                <Button size="small" onClick={() => navigate('/analytics')} sx={{ textTransform: 'none', color: '#4F46E5', fontWeight: 600 }}>Full Analytics →</Button>
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Code', 'Internal', 'External', 'Total', 'Credits', 'GP'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {marks.slice(0, 6).map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', background: m.total < 40 ? '#FFF5F5' : 'white' }}>
                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: '#4F46E5' }}>{m.subject_code}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>{m.internal_marks}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>{m.external_marks}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: m.total < 40 ? '#EF4444' : '#10B981' }}>{m.total}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>{m.credits}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>{m.grade_points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Card>
          )}
        </Container>
      </Box>
      <Onboarding open={showOnboarding} onClose={handleCloseOnboarding} />
      <Footer />
    </Box>
  );
}


export default Dashboard;
