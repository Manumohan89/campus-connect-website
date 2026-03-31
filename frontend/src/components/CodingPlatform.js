import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Grid, Typography, Button, Chip, IconButton,
  Select, MenuItem, FormControl, InputLabel, Divider, CircularProgress,
  Alert, Tab, Tabs, Card, Table, TableHead, TableRow, TableCell,
  TableBody, Tooltip, LinearProgress, Paper, Stack, Badge, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Drawer, List,
  ListItem, ListItemText, ListItemIcon, Avatar
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const LANG_OPTIONS = [
  { value: 'python',     label: 'Python 3',    ext: 'py',  mono: '#3572A5' },
  { value: 'java',       label: 'Java',        ext: 'java', mono: '#b07219' },
  { value: 'c',          label: 'C',           ext: 'c',   mono: '#555555' },
  { value: 'cpp',        label: 'C++',         ext: 'cpp', mono: '#f34b7d' },
  { value: 'csharp',     label: 'C#',          ext: 'cs',  mono: '#178600' },
  { value: 'javascript', label: 'JavaScript',  ext: 'js',  mono: '#f1e05a' },
];

const DIFF_COLORS = { easy: '#00b8a3', medium: '#ffc01e', hard: '#ff375f' };

function DiffChip({ d }) {
  return (
    <Chip label={d.charAt(0).toUpperCase() + d.slice(1)} size="small"
      sx={{ bgcolor: DIFF_COLORS[d] + '22', color: DIFF_COLORS[d], fontWeight: 700, fontSize: '0.7rem', border: `1px solid ${DIFF_COLORS[d]}44` }} />
  );
}

// ── Problem List View ────────────────────────────────────────────────────────
function ProblemList({ onSelect }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ difficulty: '', tag: '', search: '' });
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.difficulty) params.set('difficulty', filter.difficulty);
    if (filter.tag) params.set('tag', filter.tag);
    if (filter.search) params.set('search', filter.search);
    setLoading(true);
    api.get('/coding/problems?' + params).then(r => {
      setProblems(r.data.problems || []);
      const s = { easy: 0, medium: 0, hard: 0 };
      (r.data.problems || []).forEach(p => { if (p.solved) s[p.difficulty]++; });
      setStats(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    api.get('/coding/leaderboard').then(r => setLeaderboard(r.data || [])).catch(() => {});
  }, []);

  const solved = problems.filter(p => p.solved).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f0f' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.8rem', color: '#fff', fontFamily: 'monospace' }}>
              {'<'}<Box component="span" sx={{ color: '#ffa116' }}>Coding</Box>{' Platform />'}
            </Typography>
            <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.3 }}>
              Sharpen your DSA skills — LeetCode-style problems in Python, Java, C, C#
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {['easy', 'medium', 'hard'].map(d => (
              <Box key={d} sx={{ textAlign: 'center', bgcolor: '#1a1a1a', px: 2.5, py: 1.2, borderRadius: '12px', border: `1px solid ${DIFF_COLORS[d]}33` }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: DIFF_COLORS[d], fontFamily: 'monospace' }}>{stats[d]}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small" placeholder="Search problems..." value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            sx={{ bgcolor: '#1a1a1a', '& input': { color: '#fff' }, '& fieldset': { borderColor: '#333' }, minWidth: 200 }}
            InputProps={{ sx: { color: '#fff', fontSize: '0.85rem' } }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={filter.difficulty} onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}
              displayEmpty sx={{ bgcolor: '#1a1a1a', color: filter.difficulty ? DIFF_COLORS[filter.difficulty] : '#888', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
              <MenuItem value="">All Difficulty</MenuItem>
              {['easy', 'medium', 'hard'].map(d => <MenuItem key={d} value={d} sx={{ color: DIFF_COLORS[d] }}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>)}
            </Select>
          </FormControl>
          {['array', 'string', 'dynamic-programming', 'tree', 'graph', 'hash-table', 'two-pointers', 'stack'].map(tag => (
            <Chip key={tag} label={tag} size="small" clickable
              onClick={() => setFilter(f => ({ ...f, tag: f.tag === tag ? '' : tag }))}
              sx={{ bgcolor: filter.tag === tag ? '#ffa11622' : '#1a1a1a', color: filter.tag === tag ? '#ffa116' : '#888', border: `1px solid ${filter.tag === tag ? '#ffa116' : '#333'}`, fontSize: '0.7rem' }} />
          ))}
        </Box>

        <Grid container spacing={2}>
          {/* Problems Table */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', overflow: 'hidden' }}>
              {loading ? (
                <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#ffa116' }} /></Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#111' }}>
                      <TableCell sx={{ color: '#888', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', borderColor: '#2a2a2a' }}>Status</TableCell>
                      <TableCell sx={{ color: '#888', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', borderColor: '#2a2a2a' }}>Title</TableCell>
                      <TableCell sx={{ color: '#888', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', borderColor: '#2a2a2a' }}>Difficulty</TableCell>
                      <TableCell sx={{ color: '#888', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', borderColor: '#2a2a2a' }}>Tags</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {problems.map(p => (
                      <TableRow key={p.id} hover onClick={() => onSelect(p.id)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#222' }, borderBottom: '1px solid #2a2a2a22' }}>
                        <TableCell sx={{ borderColor: '#2a2a2a22', py: 1.2 }}>
                          {p.solved
                            ? <CheckCircleIcon sx={{ color: '#00b8a3', fontSize: '1.1rem' }} />
                            : <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #444' }} />}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#2a2a2a22', py: 1.2 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem', '&:hover': { color: '#ffa116' } }}>
                            {p.title}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: '#2a2a2a22', py: 1.2 }}><DiffChip d={p.difficulty} /></TableCell>
                        <TableCell sx={{ borderColor: '#2a2a2a22', py: 1.2 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {(p.tags || []).slice(0, 2).map(t => (
                              <Chip key={t} label={t} size="small" sx={{ bgcolor: '#2a2a2a', color: '#aaa', fontSize: '0.65rem', height: 18 }} />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {problems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#666', py: 4, borderColor: '#2a2a2a' }}>
                          No problems found. Try different filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </Grid>

          {/* Leaderboard */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LeaderboardIcon sx={{ color: '#ffa116' }} />
                <Typography sx={{ color: '#fff', fontWeight: 800 }}>Leaderboard</Typography>
              </Box>
              {leaderboard.slice(0, 10).map((u, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.8, borderBottom: '1px solid #2a2a2a22' }}>
                  <Typography sx={{ color: i < 3 ? '#ffa116' : '#666', fontWeight: 800, width: 20, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </Typography>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#4F46E5', fontSize: '0.7rem' }}>
                    {(u.username || '?')[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>{u.username}</Typography>
                    <Typography sx={{ color: '#888', fontSize: '0.65rem' }}>{u.branch || ''}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ color: '#ffa116', fontWeight: 800, fontSize: '0.8rem', fontFamily: 'monospace' }}>{u.solved_count}</Typography>
                    <Typography sx={{ color: '#666', fontSize: '0.6rem' }}>solved</Typography>
                  </Box>
                </Box>
              ))}
              {leaderboard.length === 0 && (
                <Typography sx={{ color: '#666', textAlign: 'center', py: 2, fontSize: '0.8rem' }}>
                  No submissions yet. Be the first!
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}

// ── Code Editor ──────────────────────────────────────────────────────────────
function CodeEditor({ value, onChange, language }) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        textareaRef.current.selectionStart = start + 4;
        textareaRef.current.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        style={{
          width: '100%', height: '100%', minHeight: 380,
          background: '#1e1e2e', color: '#cdd6f4',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          fontSize: '13.5px', lineHeight: '1.6',
          border: 'none', outline: 'none', resize: 'none',
          padding: '16px', boxSizing: 'border-box',
          tabSize: 4,
        }}
      />
    </Box>
  );
}

// ── Problem Solve View ───────────────────────────────────────────────────────
function ProblemSolve({ problemId, onBack }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileTab, setMobileTab] = useState(0); // 0=desc, 1=code, 2=output
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState(0);    // 0=description, 1=submissions, 2=hints
  const [outTab, setOutTab] = useState(0); // 0=output, 1=testcases
  const [submissions, setSubmissions] = useState([]);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    api.get(`/coding/problems/${problemId}`).then(r => {
      setProblem(r.data);
      // Set starter code
      const sc = r.data.starter_code || {};
      setCode(sc[language] || `# Write your ${language} solution here\n`);
      if (r.data.sample_cases?.length > 0) {
        setCustomInput(r.data.sample_cases[0].input || '');
      }
    }).catch(() => {});
    loadSubmissions();
  }, [problemId]);

  useEffect(() => {
    if (problem?.starter_code) {
      setCode(problem.starter_code[language] || `// Write your ${language} solution here\n`);
    }
  }, [language]);

  const loadSubmissions = () => {
    api.get(`/coding/submissions?problem_id=${problemId}`).then(r => setSubmissions(r.data || [])).catch(() => {});
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const r = await api.post('/coding/run', { language, source_code: code, stdin: customInput });
      setOutput(r.data);
      setOutTab(0);
    } catch (e) {
      setOutput({ stderr: e.response?.data?.error || 'Failed to run code', stdout: '', status: { description: 'Error' } });
    }
    setRunning(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const r = await api.post('/coding/submit', { problem_id: problemId, language, source_code: code });
      setSubmitResult(r.data);
      setOutTab(1);
      loadSubmissions();
    } catch (e) {
      setSubmitResult({ passed: false, error: e.response?.data?.error || 'Submission failed' });
    }
    setSubmitting(false);
  };

  if (!problem) return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#ffa116' }} />
    </Box>
  );

  const hints = (() => { try { return JSON.parse(problem.hints || '[]'); } catch { return []; } })();
  const examples = (() => { try { return JSON.parse(problem.examples || '[]'); } catch { return []; } })();
  const sampleCases = problem.sample_cases || [];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0f0f0f', overflow: 'hidden' }}>
      {/* Top bar */}
      <Box sx={{ bgcolor: '#1a1a1a', borderBottom: '1px solid #2a2a2a', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <IconButton onClick={onBack} size="small" sx={{ color: '#888' }}><ArrowBackIcon /></IconButton>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', flex: 1 }}>
          {problem.title}
        </Typography>
        <DiffChip d={problem.difficulty} />
        {problem.solved && <Chip label="Solved ✓" size="small" sx={{ bgcolor: '#00b8a322', color: '#00b8a3', fontWeight: 700 }} />}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={language} onChange={e => setLanguage(e.target.value)}
            sx={{ bgcolor: '#111', color: LANG_OPTIONS.find(l => l.value === language)?.mono || '#fff', fontSize: '0.8rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, height: 32 }}>
            {LANG_OPTIONS.map(l => (
              <MenuItem key={l.value} value={l.value} sx={{ color: l.mono, fontSize: '0.8rem', fontFamily: 'monospace' }}>{l.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" size="small" startIcon={running ? <CircularProgress size={14} /> : <PlayArrowIcon />}
          onClick={handleRun} disabled={running || submitting}
          sx={{ borderColor: '#4ade80', color: '#4ade80', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem',
                '&:hover': { bgcolor: '#4ade8022', borderColor: '#4ade80' } }}>
          Run
        </Button>
        <Button variant="contained" size="small" startIcon={submitting ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
          onClick={handleSubmit} disabled={running || submitting}
          sx={{ bgcolor: '#ffa116', color: '#000', textTransform: 'none', fontWeight: 800, fontSize: '0.78rem',
                '&:hover': { bgcolor: '#ff8c00' } }}>
          Submit
        </Button>
      </Box>

      {/* Mobile tabs */}
      {isMobile && (
        <Box sx={{ display: 'flex', bgcolor: '#111', borderBottom: '1px solid #2a2a2a' }}>
          {['Description', 'Code', 'Output'].map((label, idx) => (
            <Button key={label} onClick={() => setMobileTab(idx)} size="small"
              sx={{ flex: 1, textTransform: 'none', color: mobileTab === idx ? '#ffa116' : '#888', borderBottom: mobileTab === idx ? '2px solid #ffa116' : '2px solid transparent', borderRadius: 0, py: 1, fontSize: '0.78rem' }}>
              {label}
            </Button>
          ))}
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Problem Description */}
        <Box sx={{ width: isMobile ? '100%' : '40%', minWidth: isMobile ? 0 : 320, borderRight: isMobile ? 'none' : '1px solid #2a2a2a', overflow: 'auto', flexShrink: 0, display: isMobile && mobileTab !== 0 ? 'none' : 'block' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #2a2a2a', bgcolor: '#111',
            '& .MuiTab-root': { color: '#888', textTransform: 'none', fontSize: '0.8rem', minHeight: 38 },
            '& .Mui-selected': { color: '#ffa116' },
            '& .MuiTabs-indicator': { bgcolor: '#ffa116' } }}>
            <Tab label="Description" />
            <Tab label={`Submissions (${submissions.length})`} />
            {hints.length > 0 && <Tab label={`Hints (${hints.length})`} />}
          </Tabs>

          {tab === 0 && (
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {(problem.tags || []).map(t => (
                  <Chip key={t} label={t} size="small" sx={{ bgcolor: '#2a2a2a', color: '#aaa', fontSize: '0.68rem' }} />
                ))}
                {(problem.companies || []).map(c => (
                  <Chip key={c} label={c} size="small" variant="outlined" sx={{ borderColor: '#4F46E5', color: '#818cf8', fontSize: '0.68rem' }} />
                ))}
              </Box>
              <Typography sx={{ color: '#ccc', fontSize: '0.875rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', mb: 3 }}>
                {problem.description}
              </Typography>
              {examples.length > 0 && (
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>Examples</Typography>
                  {examples.map((ex, i) => (
                    <Box key={i} sx={{ bgcolor: '#111', borderRadius: '10px', p: 2, mb: 1.5, border: '1px solid #2a2a2a' }}>
                      <Typography sx={{ color: '#888', fontSize: '0.72rem', fontWeight: 700, mb: 0.5 }}>Example {i + 1}</Typography>
                      <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        <Box sx={{ color: '#aaa' }}><Box component="span" sx={{ color: '#888' }}>Input: </Box>{ex.input}</Box>
                        <Box sx={{ color: '#aaa' }}><Box component="span" sx={{ color: '#888' }}>Output: </Box>{ex.output}</Box>
                        {ex.explanation && <Box sx={{ color: '#888', mt: 0.5, fontSize: '0.75rem' }}>{ex.explanation}</Box>}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              {problem.constraints && (
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>Constraints</Typography>
                  <Box sx={{ bgcolor: '#111', borderRadius: '10px', p: 2, border: '1px solid #2a2a2a' }}>
                    <Typography sx={{ color: '#888', fontSize: '0.78rem', whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                      {problem.constraints}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ p: 2 }}>
              {submissions.length === 0 ? (
                <Typography sx={{ color: '#666', textAlign: 'center', py: 4, fontSize: '0.85rem' }}>No submissions yet</Typography>
              ) : submissions.map((s, i) => (
                <Box key={i} sx={{ p: 1.5, mb: 1, bgcolor: '#111', borderRadius: '10px', border: `1px solid ${s.status === 'accepted' ? '#00b8a322' : '#ff375f22'}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={s.status === 'accepted' ? '✓ Accepted' : '✗ ' + s.status.replace('_', ' ')} size="small"
                      sx={{ bgcolor: s.status === 'accepted' ? '#00b8a322' : '#ff375f22',
                            color: s.status === 'accepted' ? '#00b8a3' : '#ff375f', fontWeight: 700, fontSize: '0.7rem' }} />
                    <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>
                      {new Date(s.submitted_at).toLocaleDateString('en-IN')}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#666', fontSize: '0.72rem', mt: 0.5 }}>
                    {s.language} · {s.passed_count}/{s.total_count} test cases
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {tab === 2 && hints.length > 0 && (
            <Box sx={{ p: 2.5 }}>
              {hints.map((hint, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Button variant="outlined" size="small" startIcon={<LightbulbIcon />}
                    onClick={() => setShowHint(showHint === i ? -1 : i)}
                    sx={{ borderColor: '#ffa116', color: '#ffa116', textTransform: 'none', mb: 1, fontSize: '0.78rem' }}>
                    Hint {i + 1}
                  </Button>
                  {showHint === i && (
                    <Box sx={{ bgcolor: '#ffa11611', borderRadius: '10px', p: 1.5, border: '1px solid #ffa11633' }}>
                      <Typography sx={{ color: '#ccc', fontSize: '0.8rem' }}>{hint}</Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Right: Editor + Output */}
        <Box sx={{ flex: 1, display: isMobile && mobileTab === 0 ? 'none' : 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Editor */}
          <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, display: isMobile && mobileTab === 2 ? 'none' : 'block' }}>
            <CodeEditor value={code} onChange={setCode} language={language} />
          </Box>

          {/* Output Panel */}
          <Box sx={{ height: isMobile ? (mobileTab === 2 ? 'calc(100vh - 200px)' : 200) : 200, borderTop: '1px solid #2a2a2a', display: isMobile && mobileTab === 1 ? 'none' : 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#111', px: 2, borderBottom: '1px solid #2a2a2a' }}>
              <Tabs value={outTab} onChange={(_, v) => setOutTab(v)} sx={{ flex: 1,
                '& .MuiTab-root': { color: '#888', textTransform: 'none', fontSize: '0.75rem', minHeight: 36, py: 0 },
                '& .Mui-selected': { color: '#ffa116' },
                '& .MuiTabs-indicator': { bgcolor: '#ffa116' } }}>
                <Tab label="Output" />
                <Tab label="Test Cases" />
              </Tabs>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
              {outTab === 0 && (
                <Box>
                  {/* Custom input */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Typography sx={{ color: '#888', fontSize: '0.72rem', mt: 0.3 }}>Custom Input:</Typography>
                    <textarea value={customInput} onChange={e => setCustomInput(e.target.value)}
                      style={{ flex: 1, background: '#111', color: '#ccc', border: '1px solid #333', borderRadius: 6,
                               fontFamily: 'monospace', fontSize: '0.78rem', padding: '4px 8px', resize: 'none', height: 30, outline: 'none' }} />
                  </Box>
                  {(running) && <LinearProgress sx={{ bgcolor: '#2a2a2a', '& .MuiLinearProgress-bar': { bgcolor: '#4ade80' } }} />}
                  {output && (
                    <Box>
                      {output.engine === 'built-in' && (
                        <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mb:0.5 }}>
                          <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:'#4ade80' }} />
                          <Typography sx={{ color:'#4ade80', fontSize:'0.65rem' }}>Built-in engine — free, no API key</Typography>
                        </Box>
                      )}
                      {output.compile_output && (
                        <Box sx={{ bgcolor: '#ff375f11', border: '1px solid #ff375f33', borderRadius: 1, p: 1, mb: 1 }}>
                          <Typography sx={{ color: '#ff375f', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre' }}>{output.compile_output}</Typography>
                        </Box>
                      )}
                      {output.stderr && (
                        <Typography sx={{ color: '#ff375f', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre' }}>{output.stderr}</Typography>
                      )}
                      {output.stdout && (
                        <Typography sx={{ color: '#4ade80', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre' }}>{output.stdout}</Typography>
                      )}
                      {!output.stdout && !output.stderr && !output.compile_output && (
                        <Typography sx={{ color: '#666', fontSize: '0.78rem' }}>No output</Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}
              {outTab === 1 && (
                <Box>
                  {submitting && <LinearProgress sx={{ bgcolor: '#2a2a2a', '& .MuiLinearProgress-bar': { bgcolor: '#ffa116' }, mb: 1 }} />}
                  {submitResult && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {submitResult.passed
                          ? <CheckCircleIcon sx={{ color: '#00b8a3' }} />
                          : <CancelIcon sx={{ color: '#ff375f' }} />}
                        <Typography sx={{ color: submitResult.passed ? '#00b8a3' : '#ff375f', fontWeight: 700 }}>
                          {submitResult.passed ? 'All Test Cases Passed!' : `${submitResult.passed_count || 0}/${submitResult.total} Test Cases Passed`}
                        </Typography>
                        {submitResult.score !== undefined && (
                          <Chip label={`Score: ${submitResult.score}%`} size="small"
                            sx={{ bgcolor: submitResult.score === 100 ? '#00b8a322' : '#ff375f22',
                                  color: submitResult.score === 100 ? '#00b8a3' : '#ff375f', fontWeight: 700 }} />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {(submitResult.results || []).map((tc, i) => (
                          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: tc.passed ? '#00b8a311' : '#ff375f11',
                                             border: `1px solid ${tc.passed ? '#00b8a333' : '#ff375f33'}`, borderRadius: 1, p: 0.75 }}>
                            {tc.passed ? <CheckCircleIcon sx={{ color: '#00b8a3', fontSize: '0.9rem' }} /> : <CancelIcon sx={{ color: '#ff375f', fontSize: '0.9rem' }} />}
                            <Typography sx={{ color: '#aaa', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                              Test {i + 1}{tc.input !== '(hidden)' ? `: in="${tc.input}"` : ' (hidden)'} {!tc.passed && tc.actual_output !== '(hidden)' ? `→ got "${tc.actual_output}"` : ''}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {!submitResult && !submitting && (
                    <Box>
                      <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 1 }}>Sample Test Cases:</Typography>
                      {sampleCases.map((tc, i) => (
                        <Box key={i} sx={{ bgcolor: '#111', borderRadius: 1, p: 1, mb: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          <Typography sx={{ color: '#888' }}>Input: <Box component="span" sx={{ color: '#ccc' }}>{tc.input}</Box></Typography>
                          <Typography sx={{ color: '#888' }}>Expected: <Box component="span" sx={{ color: '#ccc' }}>{tc.expected_output}</Box></Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────
export default function CodingPlatform() {
  const [selectedProblem, setSelectedProblem] = useState(null);
  if (selectedProblem) return <ProblemSolve problemId={selectedProblem} onBack={() => setSelectedProblem(null)} />;
  return <ProblemList onSelect={setSelectedProblem} />;
}
