import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Card, TextField, Button, Chip, Grid,
  CircularProgress, Alert, IconButton, Avatar, LinearProgress, Select, MenuItem, FormControl, Snackbar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const SUBJECTS = ['Mathematics', 'DBMS', 'Operating Systems', 'Computer Networks', 'Data Structures', 'Algorithms', 'OOP with Java', 'Python', 'Machine Learning', 'Cloud Computing', 'Compiler Design', 'Microprocessors', 'Digital Electronics', 'Engineering Physics', 'Engineering Chemistry', 'Linear Algebra', 'Mechanics'];
const QUICK_PROMPTS = ['Explain with an example', 'Summarize the key points', 'Give me 5 important exam questions', 'What are the VTU exam patterns for this topic?', 'Explain the difference between...', 'Write the algorithm/pseudocode'];

const timeAgo = d => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString('en-IN');
};

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: isUser ? '#4F46E5' : '#7C3AED', fontSize: '0.78rem', flexShrink: 0 }}>
        {isUser ? <PersonIcon sx={{ fontSize: 16 }} /> : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
      </Avatar>
      <Box sx={{
        maxWidth: '78%', bgcolor: isUser ? '#4F46E5' : '#F8FAFC',
        color: isUser ? 'white' : '#111827', borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        px: 2, py: 1.5, border: isUser ? 'none' : '1px solid #E2E8F0' }}>
        <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</Typography>
      </Box>
    </Box>
  );
}

export default function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [usage, setUsage] = useState({ used: 0, limit: 5, premium: false, remaining: 5 });
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadUsage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const loadSessions = () => {
    api.get('/ai/sessions').then(r => setSessions(r.data || [])).catch(() => {});
  };

  const loadUsage = () => {
    api.get('/ai/usage').then(r => setUsage(r.data)).catch(() => {});
  };

  const loadSession = async (id) => {
    try {
      const r = await api.get(`/ai/sessions/${id}`);
      setMessages(r.data.messages || []);
      setActiveSession(id);
      setShowSessions(false);
    } catch { setSnack('Failed to load session'); }
  };

  const newChat = () => {
    setMessages([]);
    setActiveSession(null);
    setInput('');
    setError('');
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/sessions/${id}`);
      setSessions(s => s.filter(x => x.id !== id));
      if (activeSession === id) newChat();
      setSnack('Session deleted');
    } catch { setSnack('Failed to delete'); }
  };

  const sendMessage = async (text = input) => {
    const question = text.trim();
    if (!question || loading) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const context = messages.slice(-6);
      const r = await api.post('/ai/ask', {
        question,
        subject_code: subject || undefined,
        session_id: activeSession,
        context });

      setMessages(prev => [...prev, { role: 'assistant', content: r.data.answer }]);
      if (!activeSession) setActiveSession(r.data.session_id);
      setUsage(u => ({
        ...u,
        used: u.premium ? u.used : u.used + 1,
        remaining: u.premium ? null : Math.max(0, (u.remaining ?? 5) - 1) }));
      loadSessions();

    } catch (e) {
      const err = e.response?.data;
      if (err?.code === 'LIMIT_REACHED') {
        setError('daily_limit');
      } else if (err?.code === 'NO_API_KEY') {
        setError('no_api_key');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ ' + (err?.error || 'Sorry, something went wrong. Please try again.') }]);
      }
      setMessages(prev => prev.slice(0, -1)); // remove the user message if failed
      setInput(question);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const limitPct = usage.premium ? 0 : ((usage.used || 0) / (usage.limit || 5)) * 100;
  const atLimit = !usage.premium && (usage.remaining === 0 || (usage.used >= usage.limit));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
      <Header />
      <Box sx={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', py: 4, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoAwesomeIcon sx={{ color: 'white', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">AI Study Tutor</Typography>
              <Typography color="rgba(255,255,255,0.75)" fontSize="0.875rem">Ask any VTU subject question — get step-by-step answers, examples, and exam tips</Typography>
            </Box>
            {!usage.premium && (
              <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                <Typography fontSize="0.72rem" color="rgba(255,255,255,0.7)" mb={0.3}>{usage.used || 0}/{usage.limit || 5} questions today</Typography>
                <LinearProgress variant="determinate" value={Math.min(limitPct, 100)}
                  sx={{ width: 120, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: limitPct >= 80 ? '#F59E0B' : '#4ade80' } }} />
              </Box>
            )}
            {usage.premium && <Chip label="⭐ Premium — Unlimited" size="small" sx={{ ml: 'auto', bgcolor: 'rgba(245,158,11,0.2)', color: '#F59E0B', fontWeight: 700 }} />}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 3, flex: 1 }} maxWidth="xl">
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 280px)', minHeight: 500 }}>
          {/* Session History Sidebar */}
          <Grid item xs={12} md={3} sx={{ display: { xs: showSessions ? 'block' : 'none', md: 'block' } }}>
            <Card elevation={0} sx={{ border: '1.5px solid #E2E8F0', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight={700} fontSize="0.875rem">Chat History</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={newChat} sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#4F46E5' }}>New Chat</Button>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
                {sessions.length === 0 ? (
                  <Typography fontSize="0.78rem" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>No chats yet. Ask your first question!</Typography>
                ) : (
                  sessions.map(s => (
                    <Box key={s.id} onClick={() => loadSession(s.id)}
                      sx={{ px: 2, py: 1.25, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
                            bgcolor: activeSession === s.id ? '#EEF2FF' : 'transparent', '&:hover': { bgcolor: 'var(--bg-card2,#F8FAFC)' } }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontSize="0.78rem" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title || 'Untitled'}</Typography>
                        <Typography fontSize="0.65rem" color="text.secondary">{timeAgo(s.updated_at)}</Typography>
                      </Box>
                      <IconButton size="small" onClick={e => deleteSession(s.id, e)} sx={{ color: '#CBD5E1', '&:hover': { color: '#EF4444' }, flexShrink: 0 }}>
                        <DeleteIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Box>
                  ))
                )}
              </Box>
            </Card>
          </Grid>

          {/* Main Chat Area */}
          <Grid item xs={12} md={9} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card elevation={0} sx={{ border: '1.5px solid #E2E8F0', borderRadius: 3, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Toolbar */}
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select value={subject} onChange={e => setSubject(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
                    <MenuItem value=""><em style={{ color: '#9CA3AF' }}>Select subject...</em></MenuItem>
                    {SUBJECTS.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.82rem' }}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button size="small" onClick={() => setShowSessions(s => !s)} sx={{ display: { md: 'none' }, textTransform: 'none', fontSize: '0.78rem', color: '#4F46E5' }}>
                  History ({sessions.length})
                </Button>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 48, color: '#C7D2FE', mb: 2 }} />
                    <Typography fontWeight={700} fontSize="1.1rem" mb={1}>Ask me anything about your VTU subjects</Typography>
                    <Typography color="text.secondary" fontSize="0.875rem" mb={3}>I know VTU syllabus, grading patterns, and exam tips</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 500, mx: 'auto' }}>
                      {['Explain 2NF and 3NF normalization with examples', 'What is deadlock? How to prevent it?', 'Kadane\'s algorithm step by step', 'Explain OSI model layers with protocols'].map(q => (
                        <Chip key={q} label={q} size="small" clickable onClick={() => sendMessage(q)}
                          sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontSize: '0.72rem', '&:hover': { bgcolor: '#4F46E5', color: 'white' } }} />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)
                )}
                {loading && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#7C3AED' }}><AutoAwesomeIcon sx={{ fontSize: 16 }} /></Avatar>
                    <Box sx={{ bgcolor: 'var(--bg-card2,#F8FAFC)', border: '1px solid #E2E8F0', borderRadius: '4px 18px 18px 18px', px: 2, py: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {[0, 1, 2].map(i => (
                          <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#7C3AED', animation: 'pulse 1.4s infinite', animationDelay: `${i * 0.2}s', '@keyframes pulse': { '0%, 80%, 100%': { transform: 'scale(0.6)' }, '40%': { transform: 'scale(1)' } }` }} />
                        ))}
                        <Typography fontSize="0.78rem" color="text.secondary" ml={0.5}>Thinking...</Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Error states */}
              {error === 'daily_limit' && (
                <Box sx={{ mx: 2, mb: 1 }}>
                  <Alert severity="warning" sx={{ borderRadius: 2 }}
                    action={<Button size="small" href="/premium" sx={{ fontWeight: 700, color: '#4F46E5', textTransform: 'none' }}>Upgrade Free →</Button>}>
                    Daily limit reached (5 questions/day on free plan). Upgrade to Premium for unlimited AI tutoring.
                  </Alert>
                </Box>
              )}
              {error === 'no_api_key' && (
                <Box sx={{ mx: 2, mb: 1 }}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    AI tutor needs setup. Admin: add ANTHROPIC_API_KEY to environment variables. Get a free key at console.anthropic.com
                  </Alert>
                </Box>
              )}

              {/* Quick prompts */}
              {messages.length > 0 && !loading && (
                <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {QUICK_PROMPTS.slice(0, 3).map(p => (
                    <Chip key={p} label={p} size="small" clickable onClick={() => sendMessage(p)} disabled={atLimit}
                      sx={{ bgcolor: '#F1F5F9', fontSize: '0.68rem', '&:hover': { bgcolor: '#EEF2FF', color: '#4F46E5' } }} />
                  ))}
                </Box>
              )}

              {/* Input */}
              <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField fullWidth multiline maxRows={4} size="small" value={input}
                    onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                    disabled={loading || atLimit}
                    placeholder={atLimit ? 'Daily limit reached — upgrade for unlimited' : 'Ask any VTU subject question... (Enter to send, Shift+Enter for new line)'}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }} />
                  <Button variant="contained" onClick={() => sendMessage()} disabled={!input.trim() || loading || atLimit}
                    sx={{ minWidth: 44, height: 40, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 2, boxShadow: 'none', flexShrink: 0 }}>
                    {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
                  </Button>
                </Box>
                <Typography fontSize="0.65rem" color="text.secondary" mt={0.75}>
                  {usage.premium ? 'Premium — unlimited questions' : `${usage.remaining ?? 5} questions remaining today · Upgrade for unlimited`}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
