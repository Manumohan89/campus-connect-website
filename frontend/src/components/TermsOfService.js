import React from 'react';
import { Box, Container, Typography, Divider, Chip } from '@mui/material';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using Campus Connect ("the Platform"), you agree to be bound by these Terms of Service. If you are a student, faculty, or institution affiliated with Visvesvaraya Technological University (VTU), these terms apply to your use of all features including the SGPA calculator, VTU resources, placement tools, and community features.`
  },
  {
    title: '2. Use of the Platform',
    body: `Campus Connect is provided free of charge for educational purposes. You agree to:\n• Use the platform only for lawful academic purposes\n• Not upload copyrighted materials without permission\n• Not misrepresent your academic data or identity\n• Not attempt to reverse-engineer, scrape, or exploit the platform\n• Maintain the security of your account credentials`
  },
  {
    title: '3. User-Generated Content',
    body: `When you upload marks cards, notes, or share documents, you grant Campus Connect a non-exclusive license to store and display that content to provide the service. You retain ownership of your data. Community-shared notes must not infringe third-party copyrights. Admin moderators may remove content that violates these terms.`
  },
  {
    title: '4. SGPA/CGPA Calculations',
    body: `Our SGPA/CGPA calculations are based on the official VTU grading formula and subject credit patterns. While we strive for accuracy, Campus Connect calculations are indicative and for planning purposes only. Official results from VTU (results.vtu.ac.in) are authoritative. We are not liable for decisions made based on calculated values.`
  },
  {
    title: '5. Account Termination',
    body: `We reserve the right to suspend or terminate accounts that violate these terms, engage in abuse, or are flagged for suspicious activity. Admin users can block accounts. Users may request account deletion by contacting support@campusconnect.in.`
  },
  {
    title: '6. Limitation of Liability',
    body: `Campus Connect is provided "as is" without warranties of any kind. We are not liable for any loss of data, academic consequences, placement outcomes, or other damages arising from use of the platform. Placement drive information is provided for reference — apply directly on company portals.`
  },
  {
    title: '7. Changes to Terms',
    body: `We may update these terms periodically. Continued use of the platform after changes constitutes acceptance. Significant changes will be notified via the platform.`
  },
  {
    title: '8. Contact',
    body: `For questions about these terms, contact us at support@campusconnect.in.`
  },
];

export default function TermsOfService() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <PublicHeader />
      <Box sx={{ background: 'linear-gradient(135deg,#1E1B4B,#4F46E5)', py: { xs: 6, md: 8 }, px: 2 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip label="Legal" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', mb: 2, fontWeight: 700 }} />
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', fontFamily: "'Space Grotesk',sans-serif" }}>Terms of Service</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 1 }}>Last updated: March 2025</Typography>
        </Container>
      </Box>
      <Container maxWidth="md" sx={{ py: 6 }}>
        {SECTIONS.map((s, i) => (
          <Box key={i} sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', mb: 1.5, fontFamily: "'Space Grotesk',sans-serif" }}>{s.title}</Typography>
            <Typography sx={{ color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{s.body}</Typography>
            {i < SECTIONS.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))}
      </Container>
      <PublicFooter />
    </Box>
  );
}
