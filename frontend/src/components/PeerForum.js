import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, TextField, Button, Chip, Grid,
  Avatar, CircularProgress, Alert, Divider, Snackbar,
  Select, MenuItem, FormControl, Tooltip, Stack
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];
const timeAgo = d => {
  const s = (Date.now() - new Date(d))/1000;
  if (s<60) return 'just now'; if (s<3600) return `${Math.floor(s/60)}m ago`;
  if (s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`;
};

function AvatarIcon({ name, size=36 }) {
  const i = name?.charCodeAt(0) % AVATAR_COLORS.length || 0;
  return <Avatar sx={{ width:size, height:size, bgcolor:AVATAR_COLORS[i], fontSize:size*0.38, fontWeight:700 }}>{name?.[0]?.toUpperCase()||'?'}</Avatar>;
}

// Post Card in list
function PostCard({ post, onClick }) {
  return (
    <Card elevation={0} onClick={onClick} sx={{
      border:'1.5px solid', borderColor: post.is_solved ? '#10B98133' : '#E2E8F0',
      borderRadius:3, p:2.5, cursor:'pointer', transition:'all 0.15s',
      bgcolor: post.is_solved ? '#F0FDF4' : 'white',
      '&:hover':{ transform:'translateY(-2px)', boxShadow:'0 6px 20px rgba(79,70,229,0.1)', borderColor:'#4F46E5' }
    }}>
      <Box sx={{ display:'flex', gap:2, alignItems:'flex-start' }}>
        <AvatarIcon name={post.full_name || post.username} />
        <Box sx={{ flex:1, minWidth:0 }}>
          <Box sx={{ display:'flex', gap:1, alignItems:'center', mb:0.5, flexWrap:'wrap' }}>
            {post.is_solved && <Chip label="✓ Solved" size="small" sx={{ bgcolor:'#D1FAE5', color:'#065F46', fontWeight:700, fontSize:'0.65rem', height:20 }} />}
            {(post.tags||[]).map(t=><Chip key={t} label={t} size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontSize:'0.62rem', height:20 }} />)}
            {post.subject_code && <Chip label={post.subject_code} size="small" sx={{ bgcolor:'#FEF9C3', color:'#92400E', fontSize:'0.62rem', height:20 }} />}
          </Box>
          <Typography fontWeight={700} fontSize="0.95rem" sx={{ mb:0.5, lineHeight:1.3 }}>{post.title}</Typography>
          <Typography fontSize="0.78rem" color="text.secondary" sx={{ mb:1, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {post.body}
          </Typography>
          <Box sx={{ display:'flex', gap:2, alignItems:'center' }}>
            <Typography fontSize="0.72rem" color="text.secondary">{post.username} · {timeAgo(post.created_at)}</Typography>
            <Box sx={{ display:'flex', gap:1.5, ml:'auto' }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:0.4 }}><ThumbUpIcon sx={{ fontSize:13, color:'#9CA3AF' }} /><Typography fontSize="0.72rem" color="text.secondary">{post.upvotes}</Typography></Box>
              <Box sx={{ display:'flex', alignItems:'center', gap:0.4 }}><QuestionAnswerIcon sx={{ fontSize:13, color:'#9CA3AF' }} /><Typography fontSize="0.72rem" color="text.secondary">{post.answer_count} answers</Typography></Box>
              <Box sx={{ display:'flex', alignItems:'center', gap:0.4 }}><VisibilityIcon sx={{ fontSize:13, color:'#9CA3AF' }} /><Typography fontSize="0.72rem" color="text.secondary">{post.view_count}</Typography></Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

// New Post Form
function NewPostForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title:'', body:'', subject_code:'', tags:'' });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
      const r = await api.post('/forum/posts', payload);
      onSave(r.data);
    } catch (e) { alert(e.response?.data?.error || 'Failed to post'); }
    setSaving(false);
  };

  return (
    <Card elevation={0} sx={{ border:'1.5px solid #4F46E5', borderRadius:3, p:3 }}>
      <Typography fontWeight={800} fontSize="1.1rem" mb={2}>Ask a Question</Typography>
      <Stack spacing={2}>
        <TextField label="Question Title *" fullWidth size="small" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="What exactly do you want to know? Be specific." />
        <TextField label="Description *" fullWidth multiline rows={5} size="small" value={form.body} onChange={e=>set('body',e.target.value)} placeholder="Explain your doubt in detail. Include any error messages, code snippets, or what you've already tried." />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Subject Code (optional)" fullWidth size="small" value={form.subject_code} onChange={e=>set('subject_code',e.target.value)} placeholder="e.g. 22CS51" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Tags (comma-separated)" fullWidth size="small" value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="DBMS, SQL, normalization" />
          </Grid>
        </Grid>
        <Box sx={{ display:'flex', gap:1.5, justifyContent:'flex-end' }}>
          <Button onClick={onCancel} sx={{ textTransform:'none' }}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={saving || !form.title.trim() || !form.body.trim()}
            startIcon={saving ? <CircularProgress size={16} sx={{ color:'#fff' }} /> : null}
            sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:2, boxShadow:'none' }}>
            {saving ? 'Posting...' : 'Post Question'}
          </Button>
        </Box>
      </Stack>
    </Card>
  );
}

// Post Detail View
function PostDetail({ postId, userId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [posting, setPosting] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    api.get(`/forum/posts/${postId}`).then(r=>setData(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setPosting(true);
    try {
      const r = await api.post(`/forum/posts/${postId}/answers`, { body: answer });
      setData(d => ({ ...d, answers: [...(d.answers||[]), r.data] }));
      setAnswer('');
      setSnack('Answer posted!');
    } catch (e) { setSnack(e.response?.data?.error || 'Failed'); }
    setPosting(false);
  };

  const vote = async (targetId, targetType) => {
    try {
      const r = await api.post('/forum/vote', { target_id: targetId, target_type: targetType, vote: 1 });
      if (targetType === 'post') setData(d => ({ ...d, post: { ...d.post, upvotes: r.data.upvotes } }));
      else setData(d => ({ ...d, answers: d.answers.map(a => a.id===targetId ? {...a,upvotes:r.data.upvotes} : a) }));
    } catch {}
  };

  const accept = async (answerId) => {
    try {
      await api.patch(`/forum/answers/${answerId}/accept`);
      setData(d => ({
        ...d,
        post: { ...d.post, is_solved: true },
        answers: d.answers.map(a => ({ ...a, is_accepted: a.id === answerId }))
      }));
      setSnack('Answer accepted! +15 reputation points given.');
    } catch (e) { setSnack(e.response?.data?.error || 'Failed'); }
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Post not found</Alert>;

  const { post, answers } = data;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb:2, textTransform:'none', color:'#4F46E5' }}>Back to Forum</Button>
      <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:3, mb:3 }}>
        <Box sx={{ display:'flex', gap:1, mb:1.5, flexWrap:'wrap' }}>
          {post.is_solved && <Chip label="✓ Solved" size="small" sx={{ bgcolor:'#D1FAE5', color:'#065F46', fontWeight:700 }} />}
          {(post.tags||[]).map(t=><Chip key={t} label={t} size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontSize:'0.68rem' }} />)}
          {post.subject_code && <Chip label={post.subject_code} size="small" sx={{ bgcolor:'#FEF9C3', color:'#92400E' }} />}
        </Box>
        <Typography fontWeight={800} fontSize="1.35rem" mb={1.5}>{post.title}</Typography>
        <Typography fontSize="0.9rem" color="text.secondary" sx={{ whiteSpace:'pre-wrap', mb:2, lineHeight:1.7 }}>{post.body}</Typography>
        <Divider sx={{ mb:2 }} />
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <AvatarIcon name={post.full_name || post.username} size={28} />
          <Typography fontSize="0.78rem" color="text.secondary">{post.username} · {timeAgo(post.created_at)} · {post.view_count} views</Typography>
          <Tooltip title="Upvote this question">
            <Button size="small" startIcon={<ThumbUpIcon sx={{ fontSize:14 }} />} onClick={() => vote(post.id,'post')}
              sx={{ ml:'auto', textTransform:'none', color:'#4F46E5', fontSize:'0.78rem' }}>
              {post.upvotes} upvotes
            </Button>
          </Tooltip>
        </Box>
      </Card>

      {/* Answers */}
      <Typography fontWeight={800} fontSize="1rem" mb={1.5}>{answers.length} Answer{answers.length !== 1 ? 's':''}</Typography>
      <Stack spacing={2} mb={3}>
        {answers.map(ans => (
          <Card key={ans.id} elevation={0} sx={{ border:`1.5px solid ${ans.is_accepted?'#10B981':'#E2E8F0'}`, borderRadius:3, p:2.5, bgcolor:ans.is_accepted?'#F0FDF4':'white' }}>
            {ans.is_accepted && <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}><CheckCircleIcon sx={{ color:'#10B981', fontSize:18 }} /><Typography fontSize="0.78rem" fontWeight={700} color="#065F46">Accepted Answer</Typography></Box>}
            {ans.is_ai_generated && <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mb:1 }}><AutoAwesomeIcon sx={{ color:'#7C3AED', fontSize:14 }} /><Typography fontSize="0.72rem" color="#7C3AED" fontWeight={600}>AI-generated suggestion</Typography></Box>}
            <Typography fontSize="0.88rem" color="text.secondary" sx={{ whiteSpace:'pre-wrap', lineHeight:1.7, mb:2 }}>{ans.body}</Typography>
            <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
              <AvatarIcon name={ans.full_name || ans.username} size={24} />
              <Typography fontSize="0.72rem" color="text.secondary">{ans.username} · {timeAgo(ans.created_at)}</Typography>
              <Box sx={{ ml:'auto', display:'flex', gap:1 }}>
                <Button size="small" startIcon={<ThumbUpIcon sx={{ fontSize:12 }} />} onClick={() => vote(ans.id,'answer')}
                  sx={{ textTransform:'none', fontSize:'0.72rem', color:'#6B7280' }}>{ans.upvotes}</Button>
                {!post.is_solved && post.user_id === userId && !ans.is_accepted && (
                  <Button size="small" startIcon={<CheckCircleIcon sx={{ fontSize:12 }} />} onClick={() => accept(ans.id)}
                    sx={{ textTransform:'none', fontSize:'0.72rem', color:'#10B981' }}>Accept</Button>
                )}
              </Box>
            </Box>
          </Card>
        ))}
        {answers.length === 0 && (
          <Box sx={{ textAlign:'center', py:4, color:'#9CA3AF' }}>
            <QuestionAnswerIcon sx={{ fontSize:40, opacity:0.3, mb:1, display:'block', mx:'auto' }} />
            <Typography fontSize="0.9rem">No answers yet. Be the first to help!</Typography>
          </Box>
        )}
      </Stack>

      {/* Answer form */}
      <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:3 }}>
        <Typography fontWeight={700} mb={1.5}>Your Answer</Typography>
        <TextField fullWidth multiline rows={4} size="small" value={answer} onChange={e=>setAnswer(e.target.value)}
          placeholder="Write a clear, detailed answer. Include code snippets if helpful." sx={{ mb:2 }} />
        <Button variant="contained" onClick={submitAnswer} disabled={posting || !answer.trim()}
          startIcon={posting ? <CircularProgress size={16} sx={{ color:'#fff' }} /> : null}
          sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:2, boxShadow:'none' }}>
          {posting ? 'Posting...' : 'Post Answer'}
        </Button>
      </Card>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={()=>setSnack('')} message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
    </Box>
  );
}

// ── Main Forum Page ──────────────────────────────────────────────────────────
export default function PeerForum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState({ sort:'newest', subject:'', search:'' });
  const [stats, setStats] = useState({ total_posts:0, total_answers:0, solved:0 });
  const [userId, setUserId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort:filter.sort };
      if (filter.subject) params.subject = filter.subject;
      if (filter.search)  params.search  = filter.search;
      const [postsRes, statsRes] = await Promise.all([
        api.get('/forum/posts', { params }),
        api.get('/forum/stats'),
      ]);
      setPosts(postsRes.data.posts || []);
      setStats(statsRes.data);
    } catch {}
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try { const p = JSON.parse(atob(token.split('.')[1])); setUserId(p.userId); } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selectedPost) return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Container sx={{ py:4, flex:1 }} maxWidth="md">
        <PostDetail postId={selectedPost} userId={userId} onBack={() => { setSelectedPost(null); load(); }} />
      </Container>
      <Footer />
    </Box>
  );

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#1E1B4B,#4F46E5)', py:5, px:2 }}>
        <Container>
          <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif" mb={1}>
            💬 Peer Doubt Forum
          </Typography>
          <Typography color="rgba(255,255,255,0.75)" mb={2}>Ask questions, share knowledge, help each other pass VTU exams</Typography>
          <Box sx={{ display:'flex', gap:3 }}>
            {[['📝', stats.total_posts, 'Questions'], ['💡', stats.total_answers, 'Answers'], ['✅', stats.solved, 'Solved']].map(([icon,val,label]) => (
              <Box key={label} sx={{ textAlign:'center' }}>
                <Typography fontWeight={900} fontSize="1.5rem" color="white">{icon} {val}</Typography>
                <Typography fontSize="0.72rem" color="rgba(255,255,255,0.6)" textTransform="uppercase" letterSpacing="0.08em">{label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py:4, flex:1 }} maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {showNew ? (
              <NewPostForm onSave={p => { setPosts(prev=>[p,...prev]); setShowNew(false); }} onCancel={() => setShowNew(false)} />
            ) : (
              <Box sx={{ display:'flex', gap:2, mb:3, flexWrap:'wrap' }}>
                <TextField size="small" placeholder="Search questions..." value={filter.search}
                  onChange={e=>setFilter(f=>({...f,search:e.target.value}))}
                  InputProps={{ startAdornment: <SearchIcon sx={{ color:'#9CA3AF', mr:1, fontSize:18 }} /> }}
                  sx={{ flex:1, minWidth:200, '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
                <FormControl size="small" sx={{ minWidth:130 }}>
                  <Select value={filter.sort} onChange={e=>setFilter(f=>({...f,sort:e.target.value}))} sx={{ borderRadius:2 }}>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="top">Most Upvoted</MenuItem>
                    <MenuItem value="unanswered">Unanswered</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowNew(true)}
                  sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:2, boxShadow:'none', whiteSpace:'nowrap' }}>
                  Ask Question
                </Button>
              </Box>
            )}
            {loading ? <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>
             : posts.length === 0 ? (
              <Box sx={{ textAlign:'center', py:8 }}>
                <Typography fontSize="3rem">🤔</Typography>
                <Typography fontWeight={700} mt={2}>No questions yet</Typography>
                <Typography color="text.secondary" mt={0.5} fontSize="0.9rem">Be the first to ask a doubt!</Typography>
              </Box>
             ) : (
              <Stack spacing={1.5}>
                {posts.map(p => <PostCard key={p.id} post={p} onClick={() => setSelectedPost(p.id)} />)}
              </Stack>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:2.5, mb:2 }}>
              <Typography fontWeight={800} mb={1.5}>📌 Forum Guidelines</Typography>
              {['Be respectful and constructive','Include your VTU subject code for subject questions','Mark your question as solved when answered','Upvote helpful answers to reward contributors','No spamming or off-topic posts'].map((g,i) => (
                <Typography key={i} fontSize="0.8rem" color="text.secondary" sx={{ mb:0.75, display:'flex', gap:0.75 }}>
                  <span style={{ color:'#10B981', fontWeight:700 }}>✓</span> {g}
                </Typography>
              ))}
            </Card>
            <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:2.5 }}>
              <Typography fontWeight={800} mb={1.5}>🏷️ Popular Tags</Typography>
              <Box sx={{ display:'flex', gap:0.75, flexWrap:'wrap' }}>
                {['DBMS','OS','CN','ML','DSA','Java','Python','C++','Algorithms','Linear Algebra','Mechanics','VLSI','Embedded C','Cloud Computing'].map(t => (
                  <Chip key={t} label={t} size="small" clickable onClick={() => setFilter(f=>({...f,search:t}))}
                    sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontSize:'0.68rem', '&:hover':{ bgcolor:'#4F46E5', color:'white' } }} />
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
