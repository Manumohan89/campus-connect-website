import React from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Avatar, Stack } from '@mui/material';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import mohanPhoto from './Mohan.jpg';

const FEATURES = [
  { emoji: '📊', title: 'SGPA / CGPA Calculator',   desc: 'Upload any VTU marks card PDF — subjects auto-extracted, SGPA calculated instantly.' },
  { emoji: '⚠️', title: 'Backlog Clearing Courses', desc: 'Free video courses matched to VTU syllabus help you clear failed subjects.' },
  { emoji: '🤖', title: 'AI Study Tutor',            desc: 'Ask any VTU subject question. Step-by-step answers powered by Claude AI.' },
  { emoji: '💻', title: 'Coding Platform',           desc: 'LeetCode-style problems with built-in Python, Java, C, C++ compilers.' },
  { emoji: '📚', title: 'VTU Resource Library',      desc: 'Notes, question papers, syllabus for ALL schemes (2015–2025), all 8 semesters.' },
  { emoji: '💬', title: 'Peer Doubt Forum',          desc: 'Ask questions, get answers from seniors — Stack Overflow for VTU.' },
  { emoji: '🗂️', title: 'Flashcard Decks',           desc: 'SM-2 spaced repetition algorithm schedules reviews at the perfect moment.' },
  { emoji: '🏆', title: 'College Leaderboard',       desc: 'Rankings from CGPA, coding solved, courses completed and forum answers.' },
  { emoji: '💼', title: 'Placement Command Centre',  desc: 'Campus drives, resume builder, alumni mentorship and interview prep.' },
  { emoji: '🏢', title: 'Internship Programs',       desc: 'Apply for curated internships. Earn Internship & Training Certificates.' },
  { emoji: '📦', title: 'Final Year Projects',       desc: 'Ready-made projects with source code, or custom solutions built for you.' },
  { emoji: '💰', title: 'AI Data Earn Platform',     desc: 'Complete micro-tasks (voice, image, text) and earn real ₹ into your wallet.' },
  { emoji: '🎯', title: 'Aptitude Tests',            desc: 'TCS NQT, Infosys, Wipro, Accenture pattern tests with instant scoring.' },
  { emoji: '🎓', title: 'Verified Certificates',     desc: 'Complete training courses and earn shareable certificates for LinkedIn.' },
  { emoji: '📰', title: 'VTU News & Alerts',         desc: 'Exam timetables, results, revaluation deadlines — fetched daily from VTU.' },
  { emoji: '🤝', title: 'Alumni Mentorship',         desc: 'Connect with VTU alumni at top companies for guidance and referrals.' },
];

const STATS = [
  { value: '10,000+', label: 'VTU Students' },
  { value: '50+',     label: 'Colleges' },
  { value: '16+',     label: 'Platform Features' },
  { value: '95%',     label: 'Student Satisfaction' },
];

const TEAM = [
  {
    name: 'K Mohan',
    role: 'Founder & Full Stack Developer',
    bio: 'A VTU student who built Campus Connect to solve the real academic challenges faced by VTU students across Karnataka — from confusing mark calculations to lack of career guidance.',
    photo: mohanPhoto,
    avatar: '👨‍💻',
    tags: ['Full Stack', 'React', 'Node.js', 'PostgreSQL'],
    skills: {
      Programming: ['Java', 'Python', 'C', 'SQL'],
      'Web Technologies': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      Concepts: ['OOP', 'Data Structures', 'DBMS', 'SDLC'],
      'Machine Learning': ['Model Building', 'Data Preprocessing', 'Supervised Learning'],
      Databases: ['PostgreSQL', 'MySQL'],
      Tools: ['Git', 'VS Code', 'Jupyter'],
    },
  },
];

export default function About() {
  return (
    <Box sx={{ bgcolor: 'var(--bg-card2,#F8FAFC)', minHeight: '100vh' }}>
      <PublicHeader />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg,#06030F 0%,#1E1B4B 45%,#0D1B35 100%)', py: { xs: 8, md: 12 }, px: { xs: 2, sm: 2, md: 2 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -60, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, px: { xs: 1, sm: 2 } }}>
          <Chip label="About Campus Connect" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', mb: 3, fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }} />
          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, color: 'white', lineHeight: 1.15, mb: 2, fontFamily: "'Syne',sans-serif", letterSpacing: '-0.03em' }}>
            Built for VTU Students,<br />by a VTU Student
          </Typography>
          <Typography sx={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)', maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
            Campus Connect is a free, all-in-one academic platform designed specifically for Visvesvaraya Technological University students. From SGPA calculation to career placement — we cover everything.
          </Typography>
        </Container>
      </Box>

      {/* Stats */}
      <Box sx={{ bgcolor: 'var(--bg-card,white)', py: 5, px: { xs: 2, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container sx={{ px: { xs: 1, sm: 2 } }}>
          <Grid container spacing={3} justifyContent="center">
            {STATS.map((s, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 900, color: '#4F46E5', fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600, mt: 0.5 }}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission */}
      <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, sm: 2 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography sx={{ textAlign: 'center', fontWeight: 700, color: '#4F46E5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>Our Mission</Typography>
          <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 800, color: 'var(--text-1,#111827)', lineHeight: 1.25, mb: 3, fontFamily: "'Syne',sans-serif" }}>
            Making VTU academics stress-free and placement-ready
          </Typography>
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '1rem', lineHeight: 1.8 }}>
            Every VTU student deserves access to the best academic tools regardless of their college or background. Campus Connect provides free SGPA/CGPA calculation, backlog clearing, VTU resources, career support, and now even a way to earn money through AI tasks — all in one place, always free.
          </Typography>
        </Container>
      </Box>

      {/* All Features Grid */}
      <Box sx={{ bgcolor: 'var(--bg-card,white)', py: { xs: 6, md: 10 }, px: { xs: 2, sm: 2 } }}>
        <Container sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 800, color: 'var(--text-1,#111827)', mb: 2, fontFamily: "'Syne',sans-serif" }}>
            Everything You Need in One Place
          </Typography>
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 6, maxWidth: 560, mx: 'auto' }}>
            16 powerful features built specifically for VTU students — all free.
          </Typography>
          <Grid container spacing={2.5} justifyContent="center">
            {FEATURES.map((f, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 0.5, height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 32px rgba(79,70,229,0.1)', borderColor: '#C7D2FE', transform: 'translateY(-3px)' } }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ fontSize: '1.8rem', mb: 1.5 }}>{f.emoji}</Box>
                    <Typography sx={{ fontWeight: 800, mb: 0.75, color: 'var(--text-1,#111827)', fontSize: '0.9rem', fontFamily: "'Syne',sans-serif" }}>{f.title}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.65 }}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team / Founder */}
      <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, sm: 2 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography sx={{ textAlign: 'center', fontWeight: 700, color: '#4F46E5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>The Team</Typography>
          <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 800, color: 'var(--text-1,#111827)', mb: 6, fontFamily: "'Syne',sans-serif" }}>
            Meet the Creator
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {TEAM.map((member, i) => (
              <Grid item xs={12} sm={8} md={6} key={i}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, textAlign: 'center', background: 'linear-gradient(135deg,rgba(79,70,229,0.04),rgba(124,58,237,0.04))' }}>
                  <Avatar
                    src={member.photo}
                    alt={member.name}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'linear-gradient(135deg,#4F46E5,#7C3AED)', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', fontSize: '2.5rem' }}
                  >
                    {member.avatar}
                  </Avatar>
                  <Typography fontWeight={800} fontSize="1.1rem" color="var(--text-1,#111827)" fontFamily="'Syne',sans-serif">{member.name}</Typography>
                  <Typography color="primary" fontWeight={600} fontSize="0.85rem" mb={1.5}>{member.role}</Typography>
                  <Typography color="text.secondary" fontSize="0.85rem" lineHeight={1.75} mb={2}>{member.bio}</Typography>
                  <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap" gap={0.75}>
                    {member.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 600, fontSize: '0.72rem' }} />
                    ))}
                  </Stack>
                  <Box sx={{ mt: 2.25, textAlign: 'left', p: 2, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: 'var(--bg-card,white)' }}>
                    {Object.entries(member.skills || {}).map(([group, items]) => (
                      <Box key={group} sx={{ mb: 1.2, '&:last-child': { mb: 0 } }}>
                        <Typography sx={{ fontSize: '0.74rem', color: '#6366F1', fontWeight: 700, mb: 0.4 }}>{group}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
                          {items.join(', ')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Trust Us */}
      <Box sx={{ bgcolor: 'var(--bg-card,white)', py: { xs: 6, md: 8 }, px: { xs: 2, sm: 2 } }}>
        <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.5rem', md: '1.9rem' }, fontWeight: 800, color: 'var(--text-1,#111827)', mb: 5, fontFamily: "'Syne',sans-serif" }}>
            Why 10,000+ VTU Students Trust Us
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {[
              { emoji: '🔒', title: 'Completely Free',       desc: 'Every feature is free. No hidden charges, no premium paywalls for core academic tools.' },
              { emoji: '🎯', title: 'VTU-Specific',          desc: 'Built for VTU 2021 & 2022 scheme. Not a generic tool — every feature is tailored for VTU.' },
              { emoji: '🛡️', title: 'Privacy First',         desc: 'Your marks, data, and earn submissions are stored securely and never sold.' },
              { emoji: '⚡', title: 'Always Improving',      desc: 'New features added regularly based on student feedback. We listen and we ship.' },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box sx={{ display: 'flex', gap: 2, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
                  <Box sx={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0 }}>{item.emoji}</Box>
                  <Box>
                    <Typography fontWeight={700} color="var(--text-1,#111827)" mb={0.5} fontFamily="'Syne',sans-serif">{item.title}</Typography>
                    <Typography color="text.secondary" fontSize="0.83rem" lineHeight={1.65}>{item.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}
