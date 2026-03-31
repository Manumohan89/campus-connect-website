import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Button, Grid, Chip,
  LinearProgress, RadioGroup, FormControlLabel, Radio, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  CircularProgress, Snackbar, IconButton, Tooltip, Divider
} from '@mui/material';
import TimerIcon         from '@mui/icons-material/Timer';
import PlayArrowIcon     from '@mui/icons-material/PlayArrow';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import CancelIcon        from '@mui/icons-material/Cancel';
import EmojiEventsIcon   from '@mui/icons-material/EmojiEvents';
import NavigateNextIcon  from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import FlagIcon          from '@mui/icons-material/Flag';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Header  from './Header';
import Footer  from './Footer';
import APTITUDE_BANK from '../data/aptitudeBank';
import api from '../utils/api';

const COMPANIES = [
  { name:'TCS NQT',         cats:['quantitative','logical','verbal','programming'], time:90 },
  { name:'Infosys',         cats:['quantitative','logical','verbal'],               time:60 },
  { name:'Wipro NLTH',      cats:['quantitative','logical','programming'],          time:60 },
  { name:'Accenture',       cats:['quantitative','logical','verbal'],               time:45 },
  { name:'Full Practice',   cats:['quantitative','logical','verbal','programming'], time:120 },
];

function fmtTime(s) {
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

export default function AptitudeTest() {
  const [mode, setMode]         = useState('select'); // select | test | result
  const [company, setCompany]   = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState({});
  const [flagged, setFlagged]   = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore]       = useState(null);
  const [confirm, setConfirm]   = useState(false);
  const [snack, setSnack]       = useState('');
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const handleSubmit = useCallback((auto = false) => {
    stopTimer();
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore({ correct, total: questions.length, pct: Math.round((correct / questions.length) * 100) });
    setMode('result');
    if (auto) setSnack('⏰ Time up! Test auto-submitted.');
    api.post('/features/mock-test', { subject: company?.name, score: Math.round((correct/questions.length)*100), total_questions: questions.length, correct_answers: correct }).catch(()=>{});
  }, [questions, answers, company, stopTimer]);

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  useEffect(() => {
    if (mode !== 'test') return;
    stopTimer(); // clear stale interval
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleSubmitRef.current(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [mode, stopTimer]); // handleSubmit excluded — use ref

  const startTest = (co) => {
    const qs = co.cats.flatMap(cat =>
      (APTITUDE_BANK[cat]?.questions || []).map(q => ({ ...q, category: cat, catLabel: APTITUDE_BANK[cat]?.label }))
    ).sort(() => Math.random() - 0.5);
    setCompany(co);
    setQuestions(qs);
    setAnswers({});
    setFlagged({});
    setCurrent(0);
    setScore(null);
    setTimeLeft(co.time * 60);
    setMode('test');
  };

  const resetTest = () => { stopTimer(); setMode('select'); setCompany(null); };

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const timerColor = timeLeft < 120 ? '#EF4444' : timeLeft < 300 ? '#F59E0B' : '#10B981';

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (mode === 'result' && score) {
    const grade = score.pct >= 80 ? { label:'Excellent — Placement Ready 🎯', color:'#10B981', bg:'#F0FDF4' }
                : score.pct >= 60 ? { label:'Good — Keep Practising 💪', color:'#4F46E5', bg:'#EEF2FF' }
                : score.pct >= 40 ? { label:'Average — Needs More Practice 📚', color:'#F59E0B', bg:'#FFFBEB' }
                :                   { label:'Below Average — Focus Required ⚠️', color:'#EF4444', bg:'#FEF2F2' };
    const catBreakdown = company?.cats.map(cat => {
      const catQs = questions.filter(q => q.category === cat);
      const catCorrect = catQs.filter((q, qi) => {
        const idx = questions.indexOf(q);
        return answers[idx] === q.answer;
      }).length;
      return { cat, label: APTITUDE_BANK[cat]?.label, icon: APTITUDE_BANK[cat]?.icon, color: APTITUDE_BANK[cat]?.color, correct: catCorrect, total: catQs.length };
    });

    return (
      <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
        <Header />
        <Container maxWidth="md" sx={{ py:5 }}>
          <Card elevation={0} sx={{ border:`2px solid ${grade.color}44`, borderRadius:'20px', p:{ xs:3, md:5 }, mb:4, bgcolor:grade.bg, textAlign:'center' }}>
            <EmojiEventsIcon sx={{ fontSize:56, color:grade.color, mb:1 }} />
            <Typography variant="h2" fontWeight={900} fontFamily="'Space Grotesk',sans-serif" color={grade.color}>{score.pct}%</Typography>
            <Typography fontWeight={700} mb={0.5}>{score.correct}/{score.total} correct</Typography>
            <Chip label={grade.label} sx={{ bgcolor:grade.color, color:'white', fontWeight:700, px:1 }} />
            <Typography color="text.secondary" mt={1}>{company?.name} Practice Test</Typography>
            <LinearProgress variant="determinate" value={score.pct} sx={{ mt:3, height:10, borderRadius:99, bgcolor:`${grade.color}22`, '& .MuiLinearProgress-bar':{ bgcolor:grade.color } }} />
          </Card>

          {/* Category breakdown */}
          <Typography fontWeight={800} fontSize="1rem" mb={2}>Performance by Category</Typography>
          <Grid container spacing={2} mb={4}>
            {catBreakdown?.map(b => (
              <Grid item xs={6} sm={3} key={b.cat}>
                <Card elevation={0} sx={{ border:`1.5px solid ${b.color}33`, borderRadius:'14px', p:2.5, textAlign:'center', bgcolor:`${b.color}08` }}>
                  <Typography fontSize="1.75rem">{b.icon}</Typography>
                  <Typography fontWeight={900} fontSize="1.4rem" color={b.color}>{b.total > 0 ? Math.round((b.correct/b.total)*100) : 0}%</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{b.label}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">{b.correct}/{b.total}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Answer review */}
          <Typography fontWeight={800} fontSize="1rem" mb={2}>Answer Review</Typography>
          <Stack spacing={2} mb={4}>
            {questions.map((q, i) => {
              const correct = answers[i] === q.answer;
              return (
                <Card key={i} elevation={0} sx={{ border:`1.5px solid ${correct ? '#10B981':'#EF4444'}44`, borderRadius:'14px', p:2.5, bgcolor: correct ? '#F0FDF4':'#FEF2F2' }}>
                  <Box sx={{ display:'flex', gap:1.5, alignItems:'flex-start', mb:1.5 }}>
                    {correct ? <CheckCircleIcon sx={{ color:'#10B981', mt:0.25, flexShrink:0 }}/> : <CancelIcon sx={{ color:'#EF4444', mt:0.25, flexShrink:0 }}/>}
                    <Box sx={{ flex:1 }}>
                      <Chip label={q.catLabel} size="small" sx={{ bgcolor:`${APTITUDE_BANK[q.category]?.color}18`, color:APTITUDE_BANK[q.category]?.color, fontWeight:700, fontSize:'0.65rem', mb:0.75 }} />
                      <Typography fontWeight={700} fontSize="0.875rem">{q.q}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ pl:4 }}>
                    {q.o.map((opt, oi) => (
                      <Typography key={oi} fontSize="0.82rem" sx={{ color: oi===q.answer ? '#065F46' : oi===answers[i] && !correct ? '#991B1B' : '#374151', fontWeight: oi===q.answer||oi===answers[i] ? 700:400, mb:0.4 }}>
                        {oi===q.answer ? '✓' : oi===answers[i] ? '✗' : '○'} {opt}
                      </Typography>
                    ))}
                    {q.e && (
                      <Box sx={{ mt:1.5, p:1.5, bgcolor:'rgba(255,255,255,0.7)', borderRadius:'8px', borderLeft:'3px solid #4F46E5' }}>
                        <Typography variant="caption" color="#1E1B4B" fontWeight={600}>💡 {q.e}</Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              );
            })}
          </Stack>
          <Button fullWidth variant="contained" size="large" onClick={resetTest}
            sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:'12px', textTransform:'none', fontWeight:700, py:1.5, boxShadow:'none' }}>
            Try Another Test
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  // ── TEST ───────────────────────────────────────────────────────────────────
  if (mode === 'test' && q) {
    return (
      <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
        <Header />
        <Box sx={{ position:'sticky', top:62, zIndex:10, bgcolor:'white', borderBottom:'1px solid #E5E7EB', px:3, py:1.5 }}>
          <Box sx={{ maxWidth:900, mx:'auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:1 }}>
            <Box>
              <Typography fontWeight={700} fontSize="0.85rem">{company?.name} Aptitude Test</Typography>
              <Typography variant="caption" color="text.secondary">Q {current+1} of {questions.length} · {answeredCount} answered</Typography>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
              <Chip icon={<TimerIcon sx={{ fontSize:'16px !important' }}/>} label={fmtTime(timeLeft)}
                sx={{ bgcolor: timeLeft<120 ? '#FEF2F2':'#F0FDF4', color:timerColor, fontWeight:800, fontFamily:'monospace', fontSize:'0.9rem', border:`1.5px solid ${timerColor}44` }} />
              <Button variant="contained" size="small" onClick={() => setConfirm(true)}
                sx={{ bgcolor:'#EF4444', textTransform:'none', borderRadius:'8px', fontWeight:700, boxShadow:'none', '&:hover':{ bgcolor:'#DC2626' } }}>Submit</Button>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={(answeredCount/questions.length)*100}
            sx={{ mt:1.5, height:4, borderRadius:99, bgcolor:'#E5E7EB', '& .MuiLinearProgress-bar':{ bgcolor:'#4F46E5' } }} />
        </Box>

        <Container maxWidth="lg" sx={{ py:4, flex:1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:3 }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
                  <Box sx={{ display:'flex', gap:1 }}>
                    <Chip label={`Q${current+1}`} size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontWeight:700 }} />
                    <Chip label={q.catLabel} size="small" sx={{ bgcolor:`${APTITUDE_BANK[q.category]?.color}18`, color:APTITUDE_BANK[q.category]?.color, fontWeight:700, fontSize:'0.7rem' }} />
                  </Box>
                  <Tooltip title={flagged[current] ? 'Unflag' : 'Flag for review'}>
                    <IconButton size="small" onClick={() => setFlagged(f => ({ ...f, [current]: !f[current] }))}>
                      <FlagIcon sx={{ fontSize:18, color: flagged[current] ? '#F59E0B':'#CBD5E1' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography fontWeight={700} fontSize="1rem" mb={3} lineHeight={1.6}>{q.q}</Typography>
                <RadioGroup value={answers[current]!==undefined ? String(answers[current]) : ''}
                  onChange={e => setAnswers(a => ({ ...a, [current]: Number(e.target.value) }))}>
                  {q.o.map((opt, oi) => (
                    <Paper key={oi} elevation={0} onClick={() => setAnswers(a => ({ ...a, [current]: oi }))}
                      sx={{ mb:1.5, p:1.5, border:`1.5px solid ${answers[current]===oi ? '#4F46E5':'#E5E7EB'}`, borderRadius:'10px', cursor:'pointer', bgcolor: answers[current]===oi ? '#EEF2FF':'white', transition:'all 0.15s', '&:hover':{ borderColor:'#4F46E5', bgcolor:'#F8F9FF' } }}>
                      <FormControlLabel value={String(oi)} control={<Radio sx={{ color:'#CBD5E1', '&.Mui-checked':{ color:'#4F46E5' } }}/>}
                        label={<Typography fontSize="0.9rem" fontWeight={answers[current]===oi ? 700:400}>{opt}</Typography>}
                        sx={{ m:0, width:'100%' }} />
                    </Paper>
                  ))}
                </RadioGroup>
                <Box sx={{ display:'flex', justifyContent:'space-between', mt:3 }}>
                  <Button startIcon={<NavigateBeforeIcon/>} onClick={() => setCurrent(c => Math.max(0,c-1))} disabled={current===0} sx={{ textTransform:'none', borderRadius:'10px', fontWeight:600 }}>Previous</Button>
                  <Button endIcon={<NavigateNextIcon/>} variant="contained" onClick={() => setCurrent(c => Math.min(questions.length-1,c+1))} disabled={current===questions.length-1}
                    sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', borderRadius:'10px', fontWeight:700, boxShadow:'none' }}>Next</Button>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:2.5, position:'sticky', top:140 }}>
                <Typography fontWeight={700} fontSize="0.85rem" mb={2}>Question Palette</Typography>
                <Grid container spacing={0.75} mb={2}>
                  {questions.map((_, i) => (
                    <Grid item key={i}>
                      <Box onClick={() => setCurrent(i)} sx={{ width:34, height:34, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'0.72rem', fontWeight:700, border:'1.5px solid',
                        borderColor: i===current ? '#4F46E5' : flagged[i] ? '#F59E0B' : answers[i]!==undefined ? '#10B981':'#E5E7EB',
                        bgcolor:     i===current ? '#EEF2FF' : flagged[i] ? '#FFFBEB' : answers[i]!==undefined ? '#F0FDF4':'white',
                        color:       i===current ? '#4F46E5' : flagged[i] ? '#92400E' : answers[i]!==undefined ? '#065F46':'#9CA3AF',
                      }}>{i+1}</Box>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mb:1.5 }} />
                {[['#10B981','Answered'],['#F59E0B','Flagged'],['#E5E7EB','Not answered']].map(([c,l]) => (
                  <Box key={l} sx={{ display:'flex', alignItems:'center', gap:1, mb:0.5 }}>
                    <Box sx={{ width:14, height:14, borderRadius:'4px', bgcolor:c, border:`1.5px solid ${c}` }} />
                    <Typography variant="caption" color="text.secondary">{l}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my:1.5 }} />
                <Typography fontWeight={700} fontSize="0.8rem" mb={1}>Category Progress</Typography>
                {company?.cats.map(cat => {
                  const catQs = questions.map((q,i) => ({...q,i})).filter(q => q.category===cat);
                  const done = catQs.filter(q => answers[q.i]!==undefined).length;
                  return (
                    <Box key={cat} sx={{ mb:1.5 }}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                        <Typography variant="caption" fontWeight={600}>{APTITUDE_BANK[cat]?.icon} {APTITUDE_BANK[cat]?.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{done}/{catQs.length}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={catQs.length > 0 ? (done/catQs.length)*100 : 0}
                        sx={{ borderRadius:99, height:5, bgcolor:'#E5E7EB', '& .MuiLinearProgress-bar':{ bgcolor:APTITUDE_BANK[cat]?.color } }} />
                    </Box>
                  );
                })}
              </Card>
            </Grid>
          </Grid>
        </Container>

        <Dialog open={confirm} onClose={() => setConfirm(false)} PaperProps={{ sx:{ borderRadius:'16px' } }}>
          <DialogTitle fontWeight={800}>Submit Test?</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">You've answered {answeredCount} of {questions.length} questions. {questions.length-answeredCount > 0 && `${questions.length-answeredCount} unanswered will be marked wrong.`}</Typography>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
            <Button onClick={() => setConfirm(false)} sx={{ textTransform:'none', borderRadius:'10px' }}>Continue</Button>
            <Button variant="contained" onClick={() => { setConfirm(false); handleSubmit(false); }}
              sx={{ bgcolor:'#EF4444', textTransform:'none', borderRadius:'10px', fontWeight:700, boxShadow:'none', '&:hover':{ bgcolor:'#DC2626' } }}>Submit</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
        <Footer />
      </Box>
    );
  }

  // ── SELECT ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#065F46,#059669,#10B981)', py:{ xs:5, md:7 }, px:2 }}>
        <Container maxWidth="md" sx={{ textAlign:'center' }}>
          <BusinessCenterIcon sx={{ fontSize:48, color:'#A7F3D0', mb:1 }} />
          <Typography variant="h3" fontWeight={900} fontFamily="'Space Grotesk',sans-serif" color="white" mb={1} fontSize={{ xs:'2rem', md:'2.5rem' }}>
            Aptitude & Placement Tests
          </Typography>
          <Typography color="rgba(255,255,255,0.75)">Practice company-specific aptitude tests — TCS NQT, Infosys, Wipro, Accenture patterns</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py:5 }}>
        {/* Category badges */}
        <Box sx={{ display:'flex', gap:1.5, flexWrap:'wrap', justifyContent:'center', mb:4 }}>
          {Object.values(APTITUDE_BANK).map(cat => (
            <Chip key={cat.label} icon={<Typography>{cat.icon}</Typography>} label={cat.label}
              sx={{ bgcolor:`${cat.color}18`, color:cat.color, fontWeight:700, border:`1px solid ${cat.color}33` }} />
          ))}
        </Box>

        <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" fontSize="1.1rem" mb={2.5} textAlign="center">
          Choose Your Practice Test
        </Typography>
        <Grid container spacing={2.5}>
          {COMPANIES.map((co, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Card elevation={0} onClick={() => startTest(co)} sx={{ border:'1.5px solid #E5E7EB', borderRadius:'16px', p:3, cursor:'pointer', transition:'all 0.2s', '&:hover':{ transform:'translateY(-3px)', boxShadow:'0 12px 30px rgba(79,70,229,0.12)', borderColor:'#4F46E5' } }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:1.5 }}>
                  <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" fontSize="1rem">{co.name}</Typography>
                  <Chip label={`${co.time} min`} size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontWeight:700 }} />
                </Box>
                <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.75, mb:2 }}>
                  {co.cats.map(cat => (
                    <Chip key={cat} label={`${APTITUDE_BANK[cat]?.icon} ${APTITUDE_BANK[cat]?.label}`} size="small"
                      sx={{ bgcolor:`${APTITUDE_BANK[cat]?.color}18`, color:APTITUDE_BANK[cat]?.color, fontWeight:600, fontSize:'0.7rem' }} />
                  ))}
                </Box>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Typography variant="caption" color="text.secondary">{co.cats.reduce((s,c) => s + (APTITUDE_BANK[c]?.questions.length||0), 0)} questions</Typography>
                  <Button size="small" variant="contained" startIcon={<PlayArrowIcon />}
                    sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', borderRadius:'8px', fontWeight:700, boxShadow:'none' }}>
                    Start
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
