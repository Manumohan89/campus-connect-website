import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Button, Chip, Grid,
  CircularProgress, Alert, TextField, Select, MenuItem,
  FormControl, InputLabel, LinearProgress, Divider, Stack, Snackbar
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const COMPANIES = ['General', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini', 'Cognizant', 'HCL', 'Tech Mahindra'];
const TYPES = ['hr', 'technical'];

const FALLBACK_QUESTIONS = [
  { id: 1, company: 'General', type: 'hr', question: 'Tell me about yourself.', tips: 'Keep it to 90 seconds. Name, branch, achievements, why you applied here.' },
  { id: 2, company: 'General', type: 'hr', question: 'What are your strengths and weaknesses?', tips: 'Choose strengths relevant to the job. For weakness, show self-awareness and what you are doing to improve.' },
  { id: 3, company: 'General', type: 'hr', question: 'Why should we hire you?', tips: 'Align your skills with the job description. Be specific and confident.' },
  { id: 4, company: 'General', type: 'hr', question: 'Where do you see yourself in 5 years?', tips: 'Show ambition but align with the company. Mention growth within the organization.' },
  { id: 5, company: 'General', type: 'technical', question: 'Explain the four pillars of Object-Oriented Programming.', tips: 'Encapsulation, Inheritance, Polymorphism, Abstraction. Give a real example for each.' },
  { id: 6, company: 'General', type: 'technical', question: 'What is the difference between stack and queue?', tips: 'LIFO vs FIFO. Mention real use cases: function calls (stack), print queue (queue).' },
  { id: 7, company: 'TCS', type: 'hr', question: 'What do you know about TCS?', tips: 'Largest IT company in India, 600k+ employees, NQT-based hiring, present in 46 countries.' },
  { id: 8, company: 'Infosys', type: 'hr', question: 'What do you know about Infosys?', tips: 'Founded 1981, Bengaluru, InfyTQ program, digital transformation leader, 300k+ employees.' },
  { id: 9, company: 'General', type: 'technical', question: 'What is normalization in DBMS? Explain 1NF, 2NF, 3NF.', tips: 'Start with definition. Use a student-subjects table example to show each form step by step.' },
  { id: 10, company: 'General', type: 'technical', question: 'What is a deadlock? State the four conditions for deadlock.', tips: 'Mutual exclusion, hold and wait, no preemption, circular wait. Mention prevention using resource ordering.' },
];

function ScoreBar({ label, value, color }) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
        <Typography fontSize="0.75rem" color="text.secondary">{label}</Typography>
        <Typography fontSize="0.75rem" fontWeight={700} color={color}>{value}/10</Typography>
      </Box>
      <LinearProgress variant="determinate" value={(value / 10) * 100}
        sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
    </Box>
  );
}

function EvaluationResult({ result, question }) {
  if (!result) return null;
  const overall = result.overall_score || 5;
  const color = overall >= 8 ? '#10B981' : overall >= 6 ? '#F59E0B' : '#EF4444';
  return (
    <Card elevation={0} sx={{ border: `1.5px solid ${color}33`, borderRadius: 3, p: 3, mt: 2, bgcolor: `${color}08` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ textAlign: 'center', minWidth: 60 }}>
          <Typography fontWeight={900} fontSize="2rem" color={color} fontFamily="monospace">{overall}</Typography>
          <Typography fontSize="0.65rem" color="text.secondary">/10</Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={700} mb={1}>AI Evaluation</Typography>
          <ScoreBar label="Clarity" value={result.clarity || 5} color="#4F46E5" />
          <ScoreBar label="Content accuracy" value={result.content || 5} color="#7C3AED" />
          <ScoreBar label="Confidence" value={result.confidence || 5} color="#0EA5E9" />
        </Box>
      </Box>
      {result.what_was_good?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={700} fontSize="0.82rem" color="#10B981" mb={0.75}>What was good</Typography>
          {result.what_was_good.map((p, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 0.75, mb: 0.5 }}>
              <Typography color="#10B981">✓</Typography>
              <Typography fontSize="0.8rem" color="text.secondary">{p}</Typography>
            </Box>
          ))}
        </Box>
      )}
      {result.improvements?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={700} fontSize="0.82rem" color="#F59E0B" mb={0.75}>Areas to improve</Typography>
          {result.improvements.map((p, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 0.75, mb: 0.5 }}>
              <Typography color="#F59E0B">→</Typography>
              <Typography fontSize="0.8rem" color="text.secondary">{p}</Typography>
            </Box>
          ))}
        </Box>
      )}
      {result.better_answer && (
        <Box sx={{ bgcolor: '#EEF2FF', borderRadius: 2, p: 2, mb: 1.5 }}>
          <Typography fontWeight={700} fontSize="0.78rem" color="#4F46E5" mb={0.5}>💡 Suggested better answer</Typography>
          <Typography fontSize="0.8rem" color="#374151" lineHeight={1.6}>{result.better_answer}</Typography>
        </Box>
      )}
      {result.tip && (
        <Box sx={{ bgcolor: '#F0FDF4', borderRadius: 2, p: 1.5 }}>
          <Typography fontSize="0.78rem" color="#10B981"><strong>Pro tip:</strong> {result.tip}</Typography>
        </Box>
      )}
      {result.error && (
        <Alert severity="info" sx={{ borderRadius: 2, mt: 1 }}>AI evaluation not available — add ANTHROPIC_API_KEY to enable. Your answer was recorded.</Alert>
      )}
    </Card>
  );
}

export default function InterviewPrep() {
  const [company, setCompany] = useState('General');
  const [type, setType] = useState('hr');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [mode, setMode] = useState('browse'); // browse | practice
  const [score, setScore] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    loadQuestions();
  }, [company, type]);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const loadQuestions = async () => {
    try {
      const r = await api.get(`/ai/interview-questions?company=${company}&type=${type}`);
      const data = r.data?.length > 0 ? r.data : FALLBACK_QUESTIONS.filter(q => (company === 'General' || q.company === company || q.company === 'General') && q.type === type);
      setQuestions(data);
    } catch {
      setQuestions(FALLBACK_QUESTIONS.filter(q => (company === 'General' || q.company === company || q.company === 'General') && q.type === type));
    }
    setCurrent(0); setEvaluation(null); setAnswer('');
  };

  const startPractice = () => {
    setMode('practice');
    setScore([]);
    setCurrent(0);
    setAnswer('');
    setEvaluation(null);
    setTimer(0);
    setTimerActive(true);
  };

  const evaluate = async () => {
    if (!answer.trim()) { setSnack('Please write your answer first'); return; }
    setEvaluating(true);
    setTimerActive(false);
    try {
      const r = await api.post('/ai/interview-evaluate', {
        question: questions[current]?.question,
        answer: answer.trim(),
        company,
        type,
      });
      setEvaluation(r.data);
      setScore(s => [...s, r.data.overall_score || 5]);
    } catch (e) {
      const err = e.response?.data;
      if (err?.code === 'NO_API_KEY') {
        setEvaluation({ overall_score: 7, error: true, tip: 'AI evaluation not configured. Practice mode still works!' });
        setScore(s => [...s, 7]);
      } else if (err?.code === 'LIMIT_REACHED') {
        setSnack('Daily evaluation limit reached. Upgrade to Premium for unlimited.');
      } else {
        setSnack('Evaluation failed. Try again.');
      }
    }
    setEvaluating(false);
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setAnswer('');
      setEvaluation(null);
      setTimer(0);
      setTimerActive(true);
    } else {
      setMode('results');
      setTimerActive(false);
    }
  };

  const avgScore = score.length > 0 ? (score.reduce((a, b) => a + b, 0) / score.length).toFixed(1) : null;
  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (mode === 'results') return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />
      <Container sx={{ py: 6, flex: 1, textAlign: 'center' }} maxWidth="sm">
        <Typography fontSize="3rem" mb={2}>🎯</Typography>
        <Typography variant="h4" fontWeight={900} mb={1}>Mock Interview Complete!</Typography>
        <Typography color="text.secondary" mb={3}>You answered {score.length} questions</Typography>
        <Card elevation={0} sx={{ border: '1.5px solid #E2E8F0', borderRadius: 3, p: 4, mb: 3 }}>
          <Typography fontWeight={900} fontSize="3rem" color={parseFloat(avgScore) >= 7 ? '#10B981' : '#F59E0B'} fontFamily="monospace">{avgScore}</Typography>
          <Typography color="text.secondary" mb={2}>/10 Average Score</Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {score.map((s, i) => (
              <Chip key={i} label={`Q${i + 1}: ${s}/10`} size="small"
                sx={{ bgcolor: s >= 8 ? '#D1FAE5' : s >= 6 ? '#FEF9C3' : '#FEF2F2', color: s >= 8 ? '#065F46' : s >= 6 ? '#92400E' : '#991B1B', fontWeight: 700 }} />
            ))}
          </Box>
        </Card>
        <Button variant="contained" onClick={() => { setMode('browse'); startPractice(); }} sx={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', mr: 1.5 }}>
          Practice Again
        </Button>
        <Button variant="outlined" onClick={() => setMode('browse')} sx={{ textTransform: 'none', borderRadius: 2 }}>Browse Questions</Button>
      </Container>
      <Footer />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />
      <Box sx={{ background: 'linear-gradient(135deg,#059669,#0EA5E9)', py: 5, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WorkIcon sx={{ color: 'white', fontSize: '2.5rem' }} />
            <Box>
              <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">AI Interview Prep</Typography>
              <Typography color="rgba(255,255,255,0.8)">Practice HR + technical questions with AI feedback. Targeted for TCS, Infosys, Wipro & more.</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 4, flex: 1 }} maxWidth="lg">
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Company</InputLabel>
            <Select value={company} onChange={e => setCompany(e.target.value)} label="Company" sx={{ borderRadius: 2 }}>
              {COMPANIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={e => setType(e.target.value)} label="Type" sx={{ borderRadius: 2 }}>
              <MenuItem value="hr">HR Questions</MenuItem>
              <MenuItem value="technical">Technical Questions</MenuItem>
            </Select>
          </FormControl>
          <Chip label={`${questions.length} questions`} sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }} />
          <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={startPractice}
            sx={{ ml: 'auto', background: 'linear-gradient(135deg,#059669,#0EA5E9)', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}>
            Start Mock Interview
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Question list */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1.5px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
              {questions.slice(0, 10).map((q, i) => (
                <Box key={q.id || i} onClick={() => { setCurrent(i); setAnswer(''); setEvaluation(null); setMode('practice'); }}
                  sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9', cursor: 'pointer', bgcolor: current === i && mode === 'practice' ? '#EEF2FF' : 'white', '&:hover': { bgcolor: '#F8FAFC' } }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Typography fontSize="0.72rem" color="#9CA3AF" fontFamily="monospace" sx={{ mt: 0.2, minWidth: 20 }}>{i + 1}.</Typography>
                    <Typography fontSize="0.8rem" fontWeight={current === i ? 700 : 400} lineHeight={1.4} sx={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {q.question}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Card>
          </Grid>

          {/* Practice area */}
          <Grid item xs={12} md={8}>
            {questions.length > 0 ? (
              <Card elevation={0} sx={{ border: '1.5px solid #E2E8F0', borderRadius: 3, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={type === 'hr' ? 'HR' : 'Technical'} size="small" sx={{ bgcolor: type === 'hr' ? '#EEF2FF' : '#D1FAE5', color: type === 'hr' ? '#4F46E5' : '#065F46', fontWeight: 700 }} />
                    <Chip label={company} size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 600 }} />
                    <Chip label={`Q ${current + 1}/${questions.length}`} size="small" sx={{ bgcolor: '#F1F5F9' }} />
                  </Box>
                  {timerActive && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimerIcon sx={{ fontSize: 16, color: timer > 120 ? '#EF4444' : '#6B7280' }} />
                      <Typography fontSize="0.82rem" fontFamily="monospace" color={timer > 120 ? '#EF4444' : '#6B7280'}>{fmt(timer)}</Typography>
                    </Box>
                  )}
                </Box>

                <Typography fontWeight={700} fontSize="1.1rem" mb={1.5} lineHeight={1.4}>{questions[current]?.question}</Typography>

                {questions[current]?.tips && !evaluation && (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }}>
                    💡 <strong>Tip:</strong> {questions[current].tips}
                  </Alert>
                )}

                <TextField fullWidth multiline rows={5} placeholder="Write your answer here... (2-3 minutes recommended)"
                  value={answer} onChange={e => setAnswer(e.target.value)}
                  disabled={evaluating || !!evaluation}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }} />

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {!evaluation ? (
                    <Button variant="contained" startIcon={evaluating ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AutoAwesomeIcon />}
                      onClick={evaluate} disabled={!answer.trim() || evaluating}
                      sx={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}>
                      {evaluating ? 'Evaluating with AI...' : 'Get AI Feedback'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={next}
                      sx={{ background: 'linear-gradient(135deg,#059669,#0EA5E9)', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}>
                      {current < questions.length - 1 ? 'Next Question →' : 'Finish Interview'}
                    </Button>
                  )}
                  <Button variant="outlined" onClick={() => { setAnswer(''); setEvaluation(null); setTimer(0); setTimerActive(true); }}
                    sx={{ textTransform: 'none', borderRadius: 2 }}>Reset</Button>
                </Box>

                <EvaluationResult result={evaluation} question={questions[current]?.question} />
              </Card>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#4F46E5' }} />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
