import React, { useState } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button, Stepper,
  Chip, Grid, Card
} from '@mui/material';
import UploadFileIcon    from '@mui/icons-material/UploadFile';
import PlayCircleIcon    from '@mui/icons-material/PlayCircle';
import WorkIcon          from '@mui/icons-material/Work';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowForwardIcon  from '@mui/icons-material/ArrowForward';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    icon: '🎓',
    title: 'Welcome to Campus Connect!',
    subtitle: 'Your all-in-one VTU academic portal',
    desc: 'Calculate SGPA/CGPA instantly, clear backlogs with free courses, prepare for placements, and track your entire academic journey — all in one place.',
    cta: "Let's get started",
    features: [
      { icon:'📊', text:'Automatic SGPA calculation from PDF' },
      { icon:'🎯', text:'Personalised backlog clearing courses' },
      { icon:'💼', text:'Real placement drives & career tools' },
      { icon:'🏆', text:'Verified certificates for every course' },
    ],
  },
  {
    icon: '📤',
    title: 'Upload Your Marks Card',
    subtitle: 'Step 1 — Calculate your SGPA instantly',
    desc: 'Upload your official VTU marks card PDF. We automatically extract all subjects, match credits from the VTU subject database, and calculate your SGPA using the official formula.',
    cta: 'Upload Marks Now',
    ctaPath: '/upload-marks',
    highlight: '#4F46E5',
    tip: '💡 Your CGPA is updated automatically every time you upload a new semester.',
    features: [
      { icon:'🔍', text:'Reads subject codes and marks from PDF' },
      { icon:'📐', text:'Official VTU grading formula applied' },
      { icon:'📈', text:'CGPA tracks across all semesters' },
      { icon:'⚠️', text:'Backlogs detected & courses recommended' },
    ],
  },
  {
    icon: '📚',
    title: 'Enroll in Free Courses',
    subtitle: 'Step 2 — Clear backlogs or upskill',
    desc: 'Browse 12+ free courses designed specifically for VTU students. Clear your backlogs with subject-specific courses or upskill with Python, Web Dev, ML, and more.',
    cta: 'Browse Courses',
    ctaPath: '/training',
    highlight: '#7C3AED',
    tip: '🏆 Earn a verified certificate when you complete any course.',
    features: [
      { icon:'🆓', text:'Free backlog clearing for all subjects' },
      { icon:'💻', text:'Python, Full Stack, ML courses' },
      { icon:'📋', text:'Placement prep & aptitude training' },
      { icon:'🎓', text:'Download certificates to share on LinkedIn' },
    ],
  },
  {
    icon: '💼',
    title: 'Explore Placements',
    subtitle: 'Step 3 — Launch your career',
    desc: 'Browse campus and off-campus placement drives filtered for your branch. Check your eligibility instantly, build your resume, and connect with alumni mentors.',
    cta: 'View Placement Drives',
    ctaPath: '/placement-drives',
    highlight: '#059669',
    tip: '📧 You\'ll get email alerts when new drives matching your profile are added.',
    features: [
      { icon:'🏢', text:'Real company drives with apply links' },
      { icon:'✅', text:'One-click eligibility check' },
      { icon:'📄', text:'ATS-friendly resume builder' },
      { icon:'👥', text:'Connect with working alumni for mentorship' },
    ],
  },
  {
    icon: '🔔',
    title: 'You\'re all set!',
    subtitle: 'Start your Campus Connect journey',
    desc: 'Your account is ready. Upload your marks to get started, or explore the dashboard to discover all features.',
    cta: 'Go to Dashboard',
    ctaPath: '/dashboard',
    highlight: '#10B981',
    features: [
      { icon:'📊', text:'Dashboard — your academic overview' },
      { icon:'📝', text:'Study Planner — weekly schedule' },
      { icon:'📅', text:'Exam Timetable — never miss an exam' },
      { icon:'🔔', text:'Smart notifications keep you on track' },
    ],
  },
];

export default function Onboarding({ open, onClose }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const s = STEPS[step];

  const handleCta = () => {
    if (step < STEPS.length - 1) {
      if (s.ctaPath) { onClose(); navigate(s.ctaPath); return; }
      setStep(st => st + 1);
    } else {
      onClose();
      if (s.ctaPath) navigate(s.ctaPath);
    }
  };

  const handleSkip = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown
      PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', maxHeight: '90vh' } }}>
      {/* Progress bar */}
      <Box sx={{ height: 4, background: '#E5E7EB' }}>
        <Box sx={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: `linear-gradient(90deg,#4F46E5,#7C3AED)`, transition: 'width 0.4s ease', borderRadius: 99 }} />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg,#1E1B4B,#4F46E5)', px: 4, pt: 4, pb: 5, textAlign: 'center' }}>
          <Typography fontSize="3.5rem" lineHeight={1} mb={1}>{s.icon}</Typography>
          <Typography fontFamily="'Space Grotesk',sans-serif" fontWeight={900} color="white" fontSize="1.4rem" mb={0.5}>{s.title}</Typography>
          <Chip label={s.subtitle} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, fontSize: '0.78rem' }} />
        </Box>

        {/* Content */}
        <Box sx={{ px: 4, py: 3 }}>
          <Typography color="text.secondary" lineHeight={1.7} mb={2.5} textAlign="center">{s.desc}</Typography>

          <Grid container spacing={1.25} mb={2.5}>
            {s.features.map((f, i) => (
              <Grid item xs={6} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, bgcolor: 'action.hover', borderRadius: '10px' }}>
                  <Typography fontSize="1.1rem">{f.icon}</Typography>
                  <Typography fontSize="0.78rem" fontWeight={600} color="text.primary">{f.text}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {s.tip && (
            <Box sx={{ p: 2, bgcolor: '#EEF2FF', borderRadius: '12px', mb: 2.5, border: '1px solid #C7D2FE' }}>
              <Typography fontSize="0.82rem" color="#4338CA" fontWeight={600}>{s.tip}</Typography>
            </Box>
          )}

          {/* Step indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mb: 3 }}>
            {STEPS.map((_, i) => (
              <Box key={i} sx={{ width: i === step ? 24 : 8, height: 8, borderRadius: 99, bgcolor: i === step ? '#4F46E5' : i < step ? '#A5B4FC' : '#E5E7EB', transition: 'all 0.3s' }} />
            ))}
          </Box>

          <Button fullWidth variant="contained" size="large" onClick={handleCta} endIcon={step < STEPS.length - 1 ? <ArrowForwardIcon /> : <CheckCircleIcon />}
            sx={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', fontWeight: 700, borderRadius: '12px', textTransform: 'none', py: 1.5, boxShadow: 'none', mb: 1.5 }}>
            {s.cta}
          </Button>

          {step < STEPS.length - 1 && (
            <Button fullWidth variant="text" onClick={handleSkip}
              sx={{ textTransform: 'none', color: 'text.secondary', borderRadius: '12px' }}>
              Skip tour — go to Dashboard
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
