import React from 'react';
import { Box, Container, Typography, Divider, Chip, Alert } from '@mui/material';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const SECTIONS = [
  {
    title: '1. What We Collect',
    body: `When you register and use Campus Connect, we collect:\n• Account data: username, email address, full name, mobile number\n• Academic data: semester, branch, college, marks uploaded from VTU marks cards\n• Usage data: pages visited, features used, login timestamps\n• Uploaded files: marks card PDFs (processed and deleted after SGPA extraction), profile photos, shared documents`
  },
  {
    title: '2. How We Use Your Data',
    body: `Your data is used to:\n• Calculate and display your SGPA/CGPA\n• Send academic alerts (backlog warnings, placement notifications)\n• Personalise resource recommendations\n• Display your profile and academic history\n• Improve platform features\n\nWe do NOT sell your data to third parties. We do NOT use your data for advertising.`
  },
  {
    title: '3. Data Storage & Security',
    body: `Your data is stored on secure cloud infrastructure (Render.com, PostgreSQL). Passwords are hashed using bcrypt — we never store plain-text passwords. JWT tokens expire after 1 hour. Uploaded PDF files are processed and deleted from the server. Profile photos are stored in our /uploads directory.`
  },
  {
    title: '4. Email Communications',
    body: `We send emails for:\n• OTP verification during registration\n• Password reset links\n• Academic notifications (placement drives, backlog alerts)\n\nYou can opt out of non-essential notifications. OTP and security emails are mandatory for account use.`
  },
  {
    title: '5. Cookies',
    body: `Campus Connect uses minimal browser storage (localStorage) to maintain your login session. We do not use tracking cookies or third-party analytics cookies. We do not use Google Analytics or Meta Pixel.`
  },
  {
    title: '6. Your Rights',
    body: `You have the right to:\n• Access all your personal data (via your Profile page)\n• Correct inaccurate data (via Update Profile)\n• Delete your account and all associated data (via Settings → Delete Account or by emailing support)\n• Export your academic records (contact support)\n\nData deletion requests are processed within 7 working days.`
  },
  {
    title: '7. Third-Party Links',
    body: `Campus Connect links to VTU official sites, company career pages, and educational resources. We are not responsible for the privacy practices of these external sites. Placement drive links redirect to company-managed portals.`
  },
  {
    title: '8. Contact & Grievance',
    body: `For privacy concerns, data requests, or to report a breach, contact:\nEmail: privacy@campusconnect.in\nWe respond within 5 working days.`
  },
];

export default function PrivacyPolicy() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
      <PublicHeader />
      <Box sx={{ background: 'linear-gradient(135deg,#1E1B4B,#0EA5E9)', py: { xs: 6, md: 8 }, px: 2 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip label="Legal" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', mb: 2, fontWeight: 700 }} />
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', fontFamily: "'Space Grotesk',sans-serif" }}>Privacy Policy</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 1 }}>Last updated: March 2025 · We keep it simple and honest</Typography>
        </Container>
      </Box>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="success" sx={{ mb: 4, borderRadius: '12px' }}>
          <strong>TL;DR:</strong> We collect only what's needed to run the platform. We don't sell your data. Your passwords are encrypted. You can delete your account anytime.
        </Alert>
        {SECTIONS.map((s, i) => (
          <Box key={i} sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-1,#111827)', mb: 1.5, fontFamily: "'Space Grotesk',sans-serif" }}>{s.title}</Typography>
            <Typography sx={{ color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{s.body}</Typography>
            {i < SECTIONS.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))}
      </Container>
      <PublicFooter />
    </Box>
  );
}
