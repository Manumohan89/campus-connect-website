import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Box, Button, Grid, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CodeIcon from '@mui/icons-material/Code';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StyleIcon from '@mui/icons-material/Style';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import StarIcon from '@mui/icons-material/Star';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BarChartIcon from '@mui/icons-material/BarChart';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const features = [
  { icon: <TrendingUpIcon sx={{ fontSize: 36, color: '#4F46E5' }} />, title: 'SGPA & CGPA Calculator', desc: 'Upload your VTU marks card PDF — auto-extracts subjects, applies grading scale, calculates instantly.', tag: 'Core' },
  { icon: <BarChartIcon sx={{ fontSize: 36, color: '#0EA5E9' }} />, title: 'Academic Analytics', desc: 'Subject-wise performance charts, grade distribution, semester-over-semester CGPA trends.', tag: 'Analytics' },
  { icon: <WarningAmberIcon sx={{ fontSize: 36, color: '#EF4444' }} />, title: 'Backlog Clearing Courses', desc: 'Failed a subject? Free courses matched specifically to help VTU students clear backlogs.', tag: 'FREE' },
  { icon: <PlayCircleIcon sx={{ fontSize: 36, color: '#7C3AED' }} />, title: 'Training and Certificates', desc: 'Python, DSA, ML, Full Stack with verified downloadable certificates for your placement profile.', tag: 'Certificates' },
  { icon: <MenuBookIcon sx={{ fontSize: 36, color: '#059669' }} />, title: 'VTU Resources Library', desc: 'Notes, QPs, syllabus for all schemes (2015–2025), all departments, all 8 semesters.', tag: '2025 Scheme' },
  { icon: <CodeIcon sx={{ fontSize: 36, color: '#111827' }} />, title: 'Coding Platform', desc: 'LeetCode-style DSA problems with Python, Java, C, C++ compilers. Run, submit, see leaderboard.', tag: 'NEW' },
  { icon: <QuestionAnswerIcon sx={{ fontSize: 36, color: '#7C3AED' }} />, title: 'Peer Doubt Forum', desc: 'Ask questions, get answers from seniors. Stack Overflow for VTU students. Earn reputation points.', tag: 'NEW' },
  { icon: <AutoAwesomeIcon sx={{ fontSize: 36, color: '#4F46E5' }} />, title: 'AI Study Tutor', desc: 'Ask any VTU subject question, get step-by-step answers. 5 questions/day free, unlimited premium.', tag: 'AI' },
  { icon: <StyleIcon sx={{ fontSize: 36, color: '#0EA5E9' }} />, title: 'Flashcards & Spaced Repetition', desc: 'Create flashcard decks for any subject. SM-2 algorithm schedules reviews at the optimal time.', tag: 'NEW' },
  { icon: <LeaderboardIcon sx={{ fontSize: 36, color: '#F59E0B' }} />, title: 'College Leaderboard', desc: 'Rankings based on CGPA, coding problems, courses completed, attendance, and forum contributions.', tag: 'NEW' },
  { icon: <WorkspacePremiumIcon sx={{ fontSize: 36, color: '#F59E0B' }} />, title: 'Placement Prep Hub', desc: 'Company drives, AI interview prep, resume builder, aptitude tests, alumni mentorship.', tag: 'Career' },
  { icon: <AnnouncementIcon sx={{ fontSize: 36, color: '#0EA5E9' }} />, title: 'VTU News & Alerts', desc: 'Exam timetables, results, revaluation deadlines, syllabus updates — all auto-updated.', tag: 'Live' },
];

function Homepage() {
  const [stats, setStats] = useState([
    { value: '...', label: 'VTU Students' },
    { value: '...', label: 'Free Courses' },
    { value: '...', label: 'Resources' },
    { value: '...', label: 'Certificates Issued' },
  ]);

  useEffect(() => {
    axios.get('/api/users/platform-stats').then(r => {
      const d = r.data;
      setStats([
        { value: d.students >= 1000 ? (d.students/1000).toFixed(1)+'k+' : d.students+'+', label: 'VTU Students' },
        { value: d.courses+'+', label: 'Free Courses' },
        { value: d.resources+'+', label: 'VTU Resources' },
        { value: d.certificates+'+', label: 'Certificates Issued' },
      ]);
    }).catch(() => {
      setStats([
        { value: '1,200+', label: 'VTU Students' },
        { value: '12+', label: 'Free Courses' },
        { value: '25+', label: 'VTU Resources' },
        { value: '340+', label: 'Certificates Issued' },
      ]);
    });
  }, []);

  return (
    <Box sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <PublicHeader />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #1E3A8A 100%)', py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)' }} />
        <Container sx={{ position: 'relative', textAlign: 'center' }}>
          <Chip label="🎓 Built for VTU Students" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', mb: 3, fontWeight: 600, backdropFilter: 'blur(10px)' }} />
          <Typography variant="h1" fontFamily="'Space Grotesk', sans-serif" fontWeight={800} color="white"
            sx={{ fontSize: { xs: '2.2rem', md: '3.5rem', lg: '4rem' }, lineHeight: 1.15, mb: 2 }}>
            Your VTU Academic<br />
            <Box component="span" sx={{ background: 'linear-gradient(135deg, #818CF8, #38BDF8)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Success Platform
            </Box>
          </Typography>
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, color: 'rgba(255,255,255,0.75)', mb: 5, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
            Calculate SGPA & CGPA from your marks card, clear backlogs with free courses, download VTU notes, and launch your career — all in one place.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mb={6}>
            <Button component={Link} to="/register" variant="contained" size="large"
              sx={{ bgcolor: '#4F46E5', px: 4, py: 1.75, fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '1rem', boxShadow: '0 8px 30px rgba(79,70,229,0.4)', '&:hover': { bgcolor: '#4338CA', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
              Get Started Free →
            </Button>
            <Button component={Link} to="/login" variant="outlined" size="large"
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', px: 4, py: 1.75, fontWeight: 600, borderRadius: 2, textTransform: 'none', fontSize: '1rem', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' }, transition: 'all 0.2s' }}>
              Sign In
            </Button>
          </Stack>

          {/* Stats */}
          <Grid container spacing={2} justifyContent="center">
            {stats.map((s, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', borderRadius: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography fontFamily="'Space Grotesk', sans-serif" fontWeight={800} fontSize="1.75rem" color="white">{s.value}</Typography>
                  <Typography color="rgba(255,255,255,0.6)" fontSize="0.8rem">{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F8FAFC' }}>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontFamily="'Space Grotesk', sans-serif" fontWeight={700} color="#0F172A" mb={1.5}>Everything you need to succeed at VTU</Typography>
            <Typography color="#64748B" fontSize="1.05rem" maxWidth={500} mx="auto">From marks calculation to placement prep — we've built it all, and it's free.</Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card elevation={0} sx={{ height: '100%', border: '1px solid #E2E8F0', borderRadius: 3, p: 0.5, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(79,70,229,0.12)', borderColor: '#C7D2FE' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#F1F5F9', borderRadius: 2 }}>{f.icon}</Box>
                      <Chip label={f.tag} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.65rem' }} />
                    </Box>
                    <Typography fontFamily="'Space Grotesk', sans-serif" fontWeight={700} mb={1} fontSize="1rem">{f.title}</Typography>
                    <Typography color="#64748B" fontSize="0.875rem" lineHeight={1.65}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Premium Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#1E1B4B', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Chip icon={<StarIcon sx={{ color: '#F59E0B !important', fontSize: '14px !important' }} />}
            label="Premium Plans from ₹199/month"
            sx={{ bgcolor: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontWeight: 700, mb: 3, border: '1px solid rgba(245,158,11,0.3)' }} />
          <Typography variant="h3" fontFamily="'Space Grotesk',sans-serif" fontWeight={900} color="white" mb={2}>
            Unlock the Full Experience
          </Typography>
          <Typography color="rgba(255,255,255,0.75)" mb={4} fontSize="1.05rem" maxWidth={540} mx="auto" lineHeight={1.7}>
            Unlimited AI Study Tutor · All 8 semesters · Unlimited coding · Resume AI · 4 months FREE on yearly plan
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mb={4}>
            <Button component={Link} to="/premium" variant="contained" size="large"
              sx={{ bgcolor: '#F59E0B', color: '#1E1B4B', px: 4, py: 1.75, fontWeight: 800, borderRadius: 2, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#D97706' } }}>
              See Premium Plans ⭐
            </Button>
            <Button component={Link} to="/register" variant="outlined" size="large"
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', px: 4, py: 1.75, fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '1rem', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}>
              Start Free
            </Button>
          </Stack>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['✅ SGPA Calculator','✅ VTU Resources','✅ Coding Platform','✅ Peer Forum','✅ Leaderboard','✅ Flashcards'].map(t => (
              <Typography key={t} fontSize="0.82rem" color="rgba(255,255,255,0.55)">{t}</Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box sx={{ py: { xs: 6, md: 9 }, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', textAlign: 'center' }}>
        <Container>
          <Typography variant="h3" fontFamily="'Space Grotesk', sans-serif" fontWeight={800} color="white" mb={2}>
            Ready to take control of your academics?
          </Typography>
          <Typography color="rgba(255,255,255,0.8)" mb={4} fontSize="1.1rem">
            Join 10,000+ VTU students who track, learn, and grow on Campus Connect
          </Typography>
          <Button component={Link} to="/register" variant="contained" size="large"
            sx={{ bgcolor: 'white', color: '#4F46E5', px: 5, py: 1.75, fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#F1F5F9', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
            Create Free Account →
          </Button>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}

export default Homepage;
