import React from 'react';
import { Container, Box, Typography, Grid, Link, Stack, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const SECTIONS = {
  'Academics': [
    { label: 'Upload Marks', href: '/upload-marks' },
    { label: 'CGPA Tracker', href: '/cgpa-tracker' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Backlog Dashboard', href: '/backlog-dashboard' },
  ],
  'Learning': [
    { label: 'Training Courses', href: '/training' },
    { label: 'VTU Resources', href: '/vtu-resources' },
    { label: 'Community Notes', href: '/community-notes' },
    { label: 'Mock Test', href: '/mock-test' },
  ],
  'Career': [
    { label: 'Placement Drives', href: '/placement-drives' },
    { label: 'Resume Builder', href: '/resume-builder' },
    { label: 'Alumni Mentorship', href: '/alumni-mentorship' },
    { label: 'Job Opportunities', href: '/job-opportunities' },
  ],
  'Tools': [
    { label: 'Attendance Tracker', href: '/attendance' },
    { label: 'Exam Timetable', href: '/exam-timetable' },
    { label: 'Reminders', href: '/reminders' },
    { label: 'Live Chat', href: '/live-chat' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Box component="footer"
      sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', color: 'white', pt: { xs: 6, md: 8 }, pb: 4 }}>
      <Container>
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Brand */}
          <Grid item xs={12} md={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'white' }}>
                Campus Connect
              </Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.75 }}>
              Your complete VTU academic platform. Free for all students.
            </Typography>
          </Grid>

          {/* Link columns */}
          {Object.entries(SECTIONS).map(([section, items]) => (
            <Grid item xs={6} sm={3} md={2.375} key={section}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', mb: 2 }}>
                {section}
              </Typography>
              <Stack spacing={1}>
                {items.map(item => (
                  <Link key={item.href} href={item.href}
                    sx={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.8rem', '&:hover': { color: '#A5B4FC' }, transition: 'color 0.15s' }}>
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
            © {year} Campus Connect · For VTU Students · Free Forever
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/about-us" sx={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.75rem', '&:hover': { color: 'rgba(255,255,255,0.65)' } }}>About</Link>
            <Link href="/contact" sx={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.75rem', '&:hover': { color: 'rgba(255,255,255,0.65)' } }}>Contact</Link>
            <Link href="/faq" sx={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.75rem', '&:hover': { color: 'rgba(255,255,255,0.65)' } }}>FAQ</Link>
            <Link href="/privacy-policy" sx={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.75rem', '&:hover': { color: 'rgba(255,255,255,0.65)' } }}>Privacy</Link>
            <Link href="/terms" sx={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.75rem', '&:hover': { color: 'rgba(255,255,255,0.65)' } }}>Terms</Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
