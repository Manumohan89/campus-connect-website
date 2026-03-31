import React from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const FEATURES = [
  { icon: <TrendingUpIcon />, title: 'SGPA & CGPA Calculator', desc: 'Upload your VTU marks card PDF and get your SGPA automatically calculated using the official VTU grading formula.' },
  { icon: <SchoolIcon />, title: 'Backlog Clearing', desc: 'Free online courses matched to your failed subjects, with countdowns and revaluation request tools.' },
  { icon: <GroupIcon />, title: 'Community Resources', desc: 'Student-uploaded notes, PYQs, and study materials organized by department, scheme, and semester.' },
  { icon: <EmojiEventsIcon />, title: 'Placement Support', desc: 'Campus drives, resume builder, alumni mentorship, and aptitude training — everything to land your first job.' },
];

const STATS = [
  { value: '10,000+', label: 'VTU Students' },
  { value: '50+', label: 'Colleges' },
  { value: '100+', label: 'Free Courses' },
  { value: '95%', label: 'Backlog Clear Rate' },
];

export default function About() {
  return (
    <Box sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <PublicHeader />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', py: { xs: 8, md: 12 }, px: 2, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Chip label="About Campus Connect" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', mb: 3, fontWeight: 600 }} />
          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, color: 'white', lineHeight: 1.15, mb: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
            Built for VTU Students,<br />by VTU Students
          </Typography>
          <Typography sx={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 580, mx: 'auto', lineHeight: 1.7 }}>
            Campus Connect is a free academic platform designed specifically for Visvesvaraya Technological University students. From marks calculation to placement preparation — we cover it all.
          </Typography>
        </Container>
      </Box>

      {/* Stats */}
      <Box sx={{ bgcolor: '#EEF2FF', py: 5, px: 2 }}>
        <Container>
          <Grid container spacing={3} justifyContent="center">
            {STATS.map((s, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#4F46E5', fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</Typography>
                  <Typography sx={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission */}
      <Box sx={{ py: { xs: 7, md: 10 }, px: 2 }}>
        <Container maxWidth="md">
          <Typography sx={{ textAlign: 'center', fontWeight: 700, color: '#4F46E5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>Our Mission</Typography>
          <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 800, color: '#111827', lineHeight: 1.25, mb: 3, fontFamily: "'Space Grotesk', sans-serif" }}>
            Making VTU academics stress-free and placement-ready
          </Typography>
          <Typography sx={{ textAlign: 'center', color: '#6B7280', fontSize: '1.05rem', lineHeight: 1.75 }}>
            We believe every VTU student deserves access to the best academic tools — regardless of college or background. Campus Connect provides free SGPA/CGPA calculation, backlog clearing courses, VTU notes, and career support all in one place.
          </Typography>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 7, md: 10 }, px: 2 }}>
        <Container>
          <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 800, color: '#111827', mb: 6, fontFamily: "'Space Grotesk', sans-serif" }}>What We Offer</Typography>
          <Grid container spacing={3}>
            {FEATURES.map((f, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', p: 1, height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(79,70,229,0.12)', borderColor: '#C7D2FE' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      {React.cloneElement(f.icon, { sx: { color: '#4F46E5', fontSize: 24 } })}
                    </Box>
                    <Typography sx={{ fontWeight: 800, mb: 1, color: '#111827', fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}
