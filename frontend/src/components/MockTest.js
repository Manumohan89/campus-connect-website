import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Button, Alert, LinearProgress,
  Chip, Grid, Paper, CircularProgress, Snackbar, RadioGroup,
  FormControlLabel, Radio, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl,
  InputLabel, Stack, IconButton, Tooltip
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import FlagIcon from '@mui/icons-material/Flag';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import QUESTION_BANK from '../data/questionBank';

// Normalize question bank to unified shape
const QB = {};
Object.entries(QUESTION_BANK).forEach(([code, qs]) => {
  QB[code] = qs.map(q => ({
    question: q.q || q.question,
    options:  q.o || q.options,
    answer:   q.a !== undefined ? q.a : q.answer,
    explanation: q.e || q.explanation || '',
  }));
});

const SUBJECT_LABELS = {
  '21MAT31': 'Transform Calculus (21MAT31)',
  '21PHY12': 'Engineering Physics (21PHY12)',
  '21CS31':  'Data Structures (21CS31)',
  '21CS32':  'DBMS (21CS32)',
  '21CS33':  'Operating Systems (21CS33)',
  '21CS34':  'Computer Organisation (21CS34)',
  '21EC41':  'Signals & Systems (21EC41)',
  '21ME32':  'Thermodynamics (21ME32)',
  '21EE41':  'Electrical Machines (21EE41)',
  '21CV31':  'Mechanics of Materials (21CV31)',
};

const TIME_LIMITS = { 5: 5 * 60, 10: 10 * 60 };   // seconds
const STEP = { SELECT: 0, TEST: 1, RESULT: 2 };

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MockTest() {
  const [step, setStep]       = useState(STEP.SELECT);
  const [subject, setSubject] = useState('');
  const [numQ, setNumQ]       = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]     = useState(null);
  const [snack, setSnack]     = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const handleSubmit = useCallback((auto = false) => {
    stopTimer();
    const qs = questions;
    let correct = 0;
    qs.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore({ correct, total: qs.length, pct: Math.round((correct / qs.length) * 100) });
    setSubmitted(true);
    setStep(STEP.RESULT);
    if (auto) setSnack('⏰ Time up! Test auto-submitted.');
    // Save to backend
    api.post('/features/mock-test', { subject, score: Math.round((correct / qs.length) * 100), total_questions: qs.length, correct_answers: correct }).catch(() => {});
  }, [questions, answers, subject, stopTimer]);

  // Keep a ref to handleSubmit so the timer closure always sees the latest
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  // Timer countdown — only re-runs when step/submitted change, not on every answer
  useEffect(() => {
    if (step !== STEP.TEST || submitted) return;
    stopTimer(); // clear any stale interval first
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmitRef.current(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return stopTimer;
  }, [step, submitted, stopTimer]); // handleSubmit excluded intentionally — use ref

  const startTest = () => {
    const pool = QB[subject] || [];
    if (!pool.length) { setSnack('No questions available for this subject.'); return; }
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(numQ, pool.length));
    setQuestions(shuffled);
    setAnswers({});
    setFlagged({});
    setCurrent(0);
    setSubmitted(false);
    setScore(null);
    setTimeLeft(TIME_LIMITS[numQ] || numQ * 60);
    setStep(STEP.TEST);
  };

  const resetTest = () => { stopTimer(); setStep(STEP.SELECT); setSubject(''); setAnswers({}); setFlagged({}); setSubmitted(false); };

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const timerColor = timeLeft < 60 ? '#EF4444' : timeLeft < 180 ? '#F59E0B' : '#10B981';

  // ── RESULT SCREEN ─────────────────────────────────────────────────────────
  if (step === STEP.RESULT && score) {
    const grade = score.pct >= 80 ? { label: 'Excellent', color: '#10B981', bg: '#F0FDF4' }
                : score.pct >= 60 ? { label: 'Good',      color: '#4F46E5', bg: '#EEF2FF' }
                : score.pct >= 40 ? { label: 'Average',   color: '#F59E0B', bg: '#FFFBEB' }
                :                   { label: 'Keep Practicing', color: '#EF4444', bg: '#FEF2F2' };
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: 5 }}>
          {/* Score card */}
          <Card elevation={0} sx={{ border: `2px solid ${grade.color}44`, borderRadius: '20px', p: { xs: 3, md: 5 }, mb: 4, bgcolor: grade.bg, textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 56, color: grade.color, mb: 1 }} />
            <Typography variant="h3" fontWeight={900} fontFamily="'Space Grotesk',sans-serif" sx={{ color: grade.color }}>
              {score.correct}/{score.total}
            </Typography>
            <Typography variant="h5" fontWeight={700} mb={0.5}>{score.pct}%</Typography>
            <Chip label={grade.label} sx={{ bgcolor: grade.color, color: 'white', fontWeight: 700, fontSize: '0.9rem', px: 1 }} />
            <Typography color="text.secondary" mt={1.5}>{SUBJECT_LABELS[subject] || subject}</Typography>
            <LinearProgress variant="determinate" value={score.pct} sx={{ mt: 3, height: 10, borderRadius: 99, bgcolor: `${grade.color}22`, '& .MuiLinearProgress-bar': { bgcolor: grade.color } }} />
          </Card>

          {/* Answer review */}
          <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" fontSize="1.1rem" mb={2}>Answer Review</Typography>
          <Stack spacing={2} mb={4}>
            {questions.map((q, i) => {
              const userAns = answers[i];
              const correct = userAns === q.answer;
              return (
                <Card key={i} elevation={0} sx={{ border: `1.5px solid ${correct ? '#10B981' : '#EF4444'}44`, borderRadius: '14px', p: 2.5, bgcolor: correct ? '#F0FDF4' : '#FEF2F2' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
                    {correct ? <CheckCircleIcon sx={{ color: '#10B981', mt: 0.25, flexShrink: 0 }} /> : <CancelIcon sx={{ color: '#EF4444', mt: 0.25, flexShrink: 0 }} />}
                    <Typography fontWeight={700} fontSize="0.9rem">{q.question}</Typography>
                  </Box>
                  <Box sx={{ pl: 4 }}>
                    {q.options.map((opt, oi) => (
                      <Typography key={oi} fontSize="0.82rem" sx={{
                        color: oi === q.answer ? '#065F46' : oi === userAns && !correct ? '#991B1B' : '#374151',
                        fontWeight: oi === q.answer || oi === userAns ? 700 : 400,
                        mb: 0.4
                      }}>
                        {oi === q.answer ? '✓' : oi === userAns ? '✗' : '○'} {opt}
                      </Typography>
                    ))}
                    {q.explanation && (
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '8px', borderLeft: '3px solid #4F46E5' }}>
                        <Typography variant="caption" color="#1E1B4B" fontWeight={600}>💡 {q.explanation}</Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              );
            })}
          </Stack>
          <Button fullWidth variant="contained" size="large" onClick={resetTest}
            sx={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.5, boxShadow: 'none' }}>
            Take Another Test
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  // ── TEST SCREEN ──────────────────────────────────────────────────────────
  if (step === STEP.TEST && q) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <Header />
        {/* Sticky test bar */}
        <Box sx={{ position: 'sticky', top: 62, zIndex: 10, bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 3, py: 1.5 }}>
          <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography fontWeight={700} fontSize="0.85rem" color="#374151">{SUBJECT_LABELS[subject] || subject}</Typography>
              <Typography variant="caption" color="text.secondary">Q {current + 1} of {questions.length} · {answeredCount} answered</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip icon={<TimerIcon sx={{ fontSize: '16px !important' }} />} label={fmtTime(timeLeft)}
                sx={{ bgcolor: timeLeft < 60 ? '#FEF2F2' : '#F0FDF4', color: timerColor, fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9rem', border: `1.5px solid ${timerColor}44` }} />
              <Button variant="contained" size="small" onClick={() => setConfirmDialog(true)}
                sx={{ bgcolor: '#EF4444', textTransform: 'none', borderRadius: '8px', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#DC2626' } }}>
                Submit
              </Button>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={(answeredCount / questions.length) * 100}
            sx={{ mt: 1.5, height: 4, borderRadius: 99, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: '#4F46E5' } }} />
        </Box>

        <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
          <Grid container spacing={3}>
            {/* Question */}
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip label={`Q${current + 1}`} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
                  <Tooltip title={flagged[current] ? 'Unflag' : 'Flag for review'}>
                    <IconButton size="small" onClick={() => setFlagged(f => ({ ...f, [current]: !f[current] }))}>
                      <FlagIcon sx={{ fontSize: 18, color: flagged[current] ? '#F59E0B' : '#CBD5E1' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography fontWeight={700} fontSize="1rem" mb={3} lineHeight={1.6}>{q.question}</Typography>
                <RadioGroup value={answers[current] !== undefined ? String(answers[current]) : ''}
                  onChange={e => setAnswers(a => ({ ...a, [current]: Number(e.target.value) }))}>
                  {q.options.map((opt, oi) => (
                    <Paper key={oi} elevation={0} onClick={() => setAnswers(a => ({ ...a, [current]: oi }))}
                      sx={{ mb: 1.5, p: 1.5, border: `1.5px solid ${answers[current] === oi ? '#4F46E5' : '#E5E7EB'}`, borderRadius: '10px', cursor: 'pointer', bgcolor: answers[current] === oi ? '#EEF2FF' : 'white', transition: 'all 0.15s', '&:hover': { borderColor: '#4F46E5', bgcolor: '#F8F9FF' } }}>
                      <FormControlLabel value={String(oi)} control={<Radio sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#4F46E5' } }} />}
                        label={<Typography fontSize="0.9rem" fontWeight={answers[current] === oi ? 700 : 400}>{opt}</Typography>}
                        sx={{ m: 0, width: '100%' }} />
                    </Paper>
                  ))}
                </RadioGroup>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button startIcon={<NavigateBeforeIcon />} onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                    sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 600 }}>Previous</Button>
                  <Button endIcon={<NavigateNextIcon />} variant="contained" onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
                    sx={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: 'none' }}>Next</Button>
                </Box>
              </Card>
            </Grid>

            {/* Question palette */}
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', p: 2.5, position: 'sticky', top: 140 }}>
                <Typography fontWeight={700} fontSize="0.85rem" mb={2}>Question Palette</Typography>
                <Grid container spacing={0.75} mb={2}>
                  {questions.map((_, i) => (
                    <Grid item key={i}>
                      <Box onClick={() => setCurrent(i)} sx={{
                        width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid',
                        borderColor: i === current ? '#4F46E5' : flagged[i] ? '#F59E0B' : answers[i] !== undefined ? '#10B981' : '#E5E7EB',
                        bgcolor:     i === current ? '#EEF2FF' : flagged[i] ? '#FFFBEB' : answers[i] !== undefined ? '#F0FDF4' : 'white',
                        color:       i === current ? '#4F46E5' : flagged[i] ? '#92400E' : answers[i] !== undefined ? '#065F46' : '#9CA3AF',
                        transition: 'all 0.1s',
                      }}>{i + 1}</Box>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mb: 1.5 }} />
                {[['#10B981','Answered'], ['#F59E0B','Flagged'], ['#E5E7EB','Not visited']].map(([c, l]) => (
                  <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: c, border: `1.5px solid ${c}` }} />
                    <Typography variant="caption" color="text.secondary">{l}</Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Confirm submit dialog */}
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} PaperProps={{ sx: { borderRadius: '16px' } }}>
          <DialogTitle fontWeight={800}>Submit Test?</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">You've answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && ` ${questions.length - answeredCount} unanswered questions will be marked wrong.`}
            </Typography>
            {Object.values(flagged).some(Boolean) && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>You have flagged questions. Review them before submitting.</Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button onClick={() => setConfirmDialog(false)} sx={{ textTransform: 'none', borderRadius: '10px' }}>Continue Test</Button>
            <Button variant="contained" onClick={() => { setConfirmDialog(false); handleSubmit(false); }}
              sx={{ bgcolor: '#EF4444', textTransform: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#DC2626' } }}>
              Submit Now
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
        <Footer />
      </Box>
    );
  }

  // ── SELECT SCREEN ────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />
      <Box sx={{ background: 'linear-gradient(135deg,#312E81,#4F46E5,#7C3AED)', py: { xs: 5, md: 7 }, px: 2 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 48, color: '#A5B4FC', mb: 1 }} />
          <Typography variant="h3" fontWeight={900} fontFamily="'Space Grotesk',sans-serif" color="white" mb={1} fontSize={{ xs: '2rem', md: '2.5rem' }}>
            Mock Test
          </Typography>
          <Typography color="rgba(255,255,255,0.75)" fontSize="1rem">
            10 subjects · Timed tests · Instant feedback · VTU 2021 scheme
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: { xs: 3, md: 4 } }}>
          <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" fontSize="1.15rem" mb={3}>Configure Your Test</Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Subject</InputLabel>
            <Select value={subject} onChange={e => setSubject(e.target.value)} label="Select Subject"
              sx={{ borderRadius: '12px' }}>
              {Object.entries(SUBJECT_LABELS).map(([code, label]) => (
                <MenuItem key={code} value={code}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{label}</span>
                    <Chip label={`${QB[code]?.length || 0} Qs`} size="small" sx={{ ml: 1, bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700, fontSize: '0.65rem' }} />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography fontWeight={700} fontSize="0.875rem" mb={1.5} color="#374151">Number of Questions</Typography>
          <Grid container spacing={1.5} mb={3}>
            {[5, 10].map(n => (
              <Grid item xs={6} key={n}>
                <Paper elevation={0} onClick={() => setNumQ(n)} sx={{
                  p: 2, textAlign: 'center', border: `2px solid ${numQ === n ? '#4F46E5' : '#E5E7EB'}`,
                  borderRadius: '12px', cursor: 'pointer', bgcolor: numQ === n ? '#EEF2FF' : 'white', transition: 'all 0.15s'
                }}>
                  <Typography fontWeight={900} fontSize="1.5rem" color={numQ === n ? '#4F46E5' : '#374151'}>{n}</Typography>
                  <Typography variant="caption" color="text.secondary">{TIME_LIMITS[n] / 60} min</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {subject && (
            <Box sx={{ mb: 3, p: 2.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <Typography fontWeight={700} fontSize="0.875rem" mb={1}>Test Summary</Typography>
              {[
                ['Subject', SUBJECT_LABELS[subject]],
                ['Questions', `${Math.min(numQ, QB[subject]?.length || numQ)}`],
                ['Time Limit', `${TIME_LIMITS[numQ] / 60} minutes`],
                ['Marks per Q', '1 mark'],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{k}</Typography>
                  <Typography variant="caption" fontWeight={700}>{v}</Typography>
                </Box>
              ))}
            </Box>
          )}

          <Button fullWidth variant="contained" size="large" disabled={!subject} onClick={startTest}
            startIcon={<PlayArrowIcon />}
            sx={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.5, boxShadow: 'none', fontSize: '1rem' }}>
            Start Test
          </Button>
        </Card>

        {/* Subject grid */}
        <Typography fontWeight={700} mt={4} mb={2} fontSize="0.9rem" color="#374151">Available Subjects</Typography>
        <Grid container spacing={1.5}>
          {Object.entries(SUBJECT_LABELS).map(([code, label]) => (
            <Grid item xs={12} sm={6} key={code}>
              <Paper elevation={0} onClick={() => setSubject(code)} sx={{
                p: 1.75, border: `1.5px solid ${subject === code ? '#4F46E5' : '#E5E7EB'}`,
                borderRadius: '10px', cursor: 'pointer', bgcolor: subject === code ? '#EEF2FF' : 'white',
                transition: 'all 0.15s', '&:hover': { borderColor: '#4F46E5' }
              }}>
                <Typography fontWeight={700} fontSize="0.78rem" color={subject === code ? '#4F46E5' : '#111827'}>{code}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  {label.split(' (')[0]}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
