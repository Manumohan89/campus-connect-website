import React, { useState } from 'react';
import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, TextField, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const FAQS = [
  { cat: 'SGPA/CGPA', q: 'How does SGPA calculation work?', a: 'Upload your VTU marks card PDF on the Upload Marks page. We extract each subject\'s marks by reading the table, look up credits from the VTU subject code pattern, and calculate:\n\nSGPA = Σ(Grade Points × Credits) / Σ(Credits)\n\nVTU Grade Scale: ≥90→S(10), ≥80→A(9), ≥70→B(8), ≥60→C(7), ≥50→D(6), ≥40→E(4), <40→F(0)' },
  { cat: 'SGPA/CGPA', q: 'Why is my CGPA different from what VTU shows?', a: 'CGPA is calculated from all marks you have uploaded. If you haven\'t uploaded all semesters, the CGPA will be based only on what\'s available. Use the CGPA Tracker to manually add semester SGPAs for a more accurate cumulative figure.' },
  { cat: 'Registration', q: 'I registered but never received an OTP', a: 'If EMAIL_USER is not configured in the backend .env file, OTPs won\'t be sent. For local development, use 000000 as the OTP. For production, add your Gmail address and app password to the .env file.' },
  { cat: 'Registration', q: 'How do I log in after registering?', a: 'After registering, you\'ll be redirected to the OTP verification page. Enter the OTP sent to your email (or 000000 for dev). Once verified, you\'ll be logged in automatically and redirected to your dashboard.' },
  { cat: 'Backlogs', q: 'How do I clear my backlog?', a: 'Go to Backlog Dashboard to see all failed subjects with exam countdowns. Then visit Training → Backlog Clearing Courses to find free courses matched to your failed subjects. You can also submit a revaluation request from the Backlog Dashboard.' },
  { cat: 'Placements', q: 'How does the placement eligibility checker work?', a: 'Each drive has minimum CGPA and backlog requirements. When you click "Check Eligibility", we compare your current CGPA and backlog count from your uploaded marks against the company\'s criteria.' },
  { cat: 'Resources', q: 'Where do I find VTU notes and question papers?', a: 'Visit VTU Resources — filter by department (CSE, ECE, ME, etc.), semester (1–8), and year scheme (2021/2018/2015) to find notes and previous year question papers.' },
  { cat: 'General', q: 'Is Campus Connect free to use?', a: 'Yes, Campus Connect is completely free for all VTU students. All academic tools, resources, and backlog clearing courses are free. Some premium upskill courses may have a fee but they\'re clearly labeled.' },
  { cat: 'General', q: 'Can I use Campus Connect from my mobile phone?', a: 'Yes! Campus Connect is fully responsive and works on mobile browsers. All pages — from marks upload to resume builder — are optimized for mobile screens.' },
  { cat: 'Technical', q: 'Why does the backend show a 404 error?', a: 'Make sure the proxy is configured: add "proxy": "http://localhost:5000" to frontend/package.json. The React dev server runs on :3000 and needs to forward API requests to Express on :5000.' },
];

const CATS = ['All', ...new Set(FAQS.map(f => f.cat))];

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = FAQS.filter(f => {
    const matchCat = cat === 'All' || f.cat === cat;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <Box sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <PublicHeader />

      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', py: { xs: 7, md: 10 }, px: 2, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 900, color: 'white', fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 1, mb: 4, fontSize: '1.05rem' }}>Everything you need to know about Campus Connect</Typography>
          <TextField fullWidth placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment> }}
            sx={{ maxWidth: 480, mx: 'auto', display: 'block', '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'white' } }} />
        </Container>
      </Box>

      <Container sx={{ py: 6, px: 2 }} maxWidth="md">
        {/* Category filter */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4, justifyContent: 'center' }}>
          {CATS.map(c => (
            <Chip key={c} label={c} onClick={() => setCat(c)} clickable
              sx={{ bgcolor: cat === c ? '#4F46E5' : '#F1F5F9', color: cat === c ? 'white' : '#374151', fontWeight: 700, '&:hover': { bgcolor: cat === c ? '#4338CA' : '#E2E8F0' } }} />
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((f, i) => (
            <Accordion key={i} expanded={expanded === i} onChange={() => setExpanded(expanded === i ? null : i)} elevation={0}
              sx={{ border: '1px solid #E5E7EB', borderRadius: '14px !important', overflow: 'hidden', '&:before': { display: 'none' }, '&.Mui-expanded': { boxShadow: '0 4px 16px rgba(79,70,229,0.1)', borderColor: '#C7D2FE' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6366F1' }} />} sx={{ px: 3, py: 0.5, '&.Mui-expanded': { bgcolor: '#FAFAFA' } }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Chip label={f.cat} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4338CA', fontWeight: 700, fontSize: '0.65rem' }} />
                  <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{f.q}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2.5, bgcolor: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                <Typography sx={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          {filtered.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8, color: '#9CA3AF' }}>
              <Typography>No questions found for "{search}"</Typography>
            </Box>
          )}
        </Box>
      </Container>

      <PublicFooter />
    </Box>
  );
}
