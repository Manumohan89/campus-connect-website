import React from 'react';
import { Container, Box, Typography, Grid, Link, Stack, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const LINKS = {
  'Platform': [
    { label: 'Upload Marks', href: '/upload-marks' },
    { label: 'CGPA Tracker', href: '/cgpa-tracker' },
    { label: 'VTU Resources', href: '/vtu-resources' },
    { label: 'Training Courses', href: '/training' },
    { label: 'Coding Platform', href: '/coding' },
    { label: 'AI Study Tutor', href: '/ai-tutor' },
    { label: 'Peer Forum', href: '/forum' },
    { label: 'Flashcards', href: '/flashcards' },
    { label: 'VTU News', href: '/vtu-news' },
  ],
  'Career': [
    { label: 'Placement Drives', href: '/placement-drives' },
    { label: 'Resume Builder', href: '/resume-builder' },
    { label: 'Alumni Mentorship', href: '/alumni-mentorship' },
    { label: 'Job Opportunities', href: '/job-opportunities' },
    { label: 'Interview Prep', href: '/interview-prep' },
    { label: 'Scholarships', href: '/scholarships' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ],
  'Company': [
    { label: 'SGPA Calculator', href: '/sgpa-calculator' },
    { label: 'VTU Result Checker', href: '/vtu-result' },
    { label: 'Internship Tracker', href: '/internship-tracker' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Sign Up Free', href: '/register' },
  ],
};

export default function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <Box component="footer"
      sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', color: 'white', pt: { xs: 6, md: 8 }, pb: 4 }}>
      <Container>
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Brand */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'white' }}>
                Campus Connect
              </Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.75, maxWidth: 220 }}>
              Free academic platform built specifically for VTU students. Calculate SGPA, clear backlogs, and land your first job.
            </Typography>
          </Grid>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <Grid item xs={6} sm={4} md={3} key={section}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', mb: 2 }}>
                {section}
              </Typography>
              <Stack spacing={1}>
                {items.map(item => (
                  <Link key={item.href} href={item.href}
                    sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: '#A5B4FC' }, transition: 'color 0.15s' }}>
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            © {year} Campus Connect · Built for VTU Students · Free Forever
          </Typography>
          <Stack direction="row" spacing={3}>
            {['Privacy Policy', 'Terms of Service'].map(l => (
              <Link key={l} href="#"
                sx={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.8rem', '&:hover': { color: 'rgba(255,255,255,0.7)' } }}>
                {l}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
