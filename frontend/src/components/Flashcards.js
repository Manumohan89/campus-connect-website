import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Button, Grid, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar,
  Stack, LinearProgress, Alert, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FlipIcon from '@mui/icons-material/Flip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const QUALITY_BUTTONS = [
  { q:0, label:'Again', color:'#EF4444', bg:'#FEF2F2', desc:'Complete blank' },
  { q:2, label:'Hard',  color:'#F59E0B', bg:'#FFFBEB', desc:'Got it with effort' },
  { q:3, label:'Good',  color:'#10B981', bg:'#F0FDF4', desc:'Remembered' },
  { q:4, label:'Easy',  color:'#4F46E5', bg:'#EEF2FF', desc:'Perfect recall' },
];

function DeckCard({ deck, onStudy, onView }) {
  return (
    <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:2.5, cursor:'pointer', transition:'all 0.15s', '&:hover':{ transform:'translateY(-3px)', boxShadow:'0 8px 20px rgba(79,70,229,0.1)', borderColor:'#4F46E5' } }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:1.5 }}>
        <Typography fontWeight={700} fontSize="0.95rem">{deck.title}</Typography>
        {deck.due_count > 0 && <Chip label={`${deck.due_count} due`} size="small" sx={{ bgcolor:'#FEF2F2', color:'#EF4444', fontWeight:700, fontSize:'0.65rem' }} />}
      </Box>
      {deck.subject_code && <Chip label={deck.subject_code} size="small" sx={{ bgcolor:'#EEF2FF', color:'#4F46E5', fontSize:'0.68rem', mb:1.5 }} />}
      <Typography fontSize="0.78rem" color="text.secondary" mb={2}>{deck.card_count} cards</Typography>
      <Box sx={{ display:'flex', gap:1 }}>
        <Button size="small" variant="contained" onClick={() => onStudy(deck.id)} disabled={deck.due_count === 0}
          sx={{ flex:1, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:2, boxShadow:'none', fontSize:'0.78rem' }}>
          Study ({deck.due_count})
        </Button>
        <Button size="small" variant="outlined" onClick={() => onView(deck.id)}
          sx={{ textTransform:'none', borderRadius:2, fontSize:'0.78rem', borderColor:'#E2E8F0' }}>
          View All
        </Button>
      </Box>
    </Card>
  );
}

function StudySession({ deckId, onDone }) {
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again:0, hard:0, good:0, easy:0 });

  useEffect(() => {
    api.get(`/flashcards/decks/${deckId}/review`).then(r => setCards(r.data.cards || [])).catch(() => {});
  }, [deckId]);

  const review = async (quality) => {
    const card = cards[current];
    try { await api.post(`/flashcards/${card.id}/review`, { quality }); } catch {}
    const qLabel = ['again','again','hard','good','easy'][quality];
    setStats(s => ({ ...s, [qLabel]: (s[qLabel]||0)+1 }));
    if (current + 1 >= cards.length) { setDone(true); }
    else { setCurrent(c => c+1); setFlipped(false); }
  };

  if (cards.length === 0) return (
    <Box sx={{ textAlign:'center', py:8 }}>
      <CircularProgress sx={{ color:'#4F46E5' }} />
    </Box>
  );

  if (done) return (
    <Card elevation={0} sx={{ border:'1.5px solid #10B981', borderRadius:3, p:4, textAlign:'center' }}>
      <Typography fontSize="3rem" mb={2}>🎉</Typography>
      <Typography fontWeight={800} fontSize="1.3rem" mb={1}>Session Complete!</Typography>
      <Typography color="text.secondary" mb={3}>You reviewed {cards.length} cards</Typography>
      <Box sx={{ display:'flex', gap:2, justifyContent:'center', mb:3 }}>
        {[['Again','#EF4444',stats.again],['Hard','#F59E0B',stats.hard],['Good','#10B981',stats.good],['Easy','#4F46E5',stats.easy]].map(([l,c,v]) => (
          <Box key={l} sx={{ textAlign:'center' }}>
            <Typography fontWeight={900} fontSize="1.5rem" color={c}>{v}</Typography>
            <Typography fontSize="0.72rem" color="text.secondary">{l}</Typography>
          </Box>
        ))}
      </Box>
      <Button variant="contained" onClick={onDone} sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:2, boxShadow:'none' }}>
        Back to Decks
      </Button>
    </Card>
  );

  const card = cards[current];
  const progress = ((current) / cards.length) * 100;

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onDone} sx={{ textTransform:'none', color:'#4F46E5' }}>Back</Button>
        <Typography fontSize="0.82rem" color="text.secondary">{current+1} / {cards.length}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ mb:3, borderRadius:2, bgcolor:'#F1F5F9', height:6, '& .MuiLinearProgress-bar':{ bgcolor:'#4F46E5' } }} />

      {/* Flashcard */}
      <Box onClick={() => setFlipped(f => !f)} sx={{ cursor:'pointer', mb:3 }}>
        <Card elevation={0} sx={{ border:'2px solid #4F46E5', borderRadius:4, minHeight:220, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', p:4, textAlign:'center', transition:'all 0.2s', '&:hover':{ boxShadow:'0 8px 24px rgba(79,70,229,0.15)' } }}>
          <Chip label={flipped ? 'Answer' : 'Question'} size="small" sx={{ mb:2, bgcolor:flipped?'#10B98122':'#4F46E522', color:flipped?'#10B981':'#4F46E5', fontWeight:700 }} />
          <Typography fontSize="1.1rem" fontWeight={flipped ? 500 : 700} lineHeight={1.6} sx={{ maxWidth:500 }}>
            {flipped ? card.back : card.front}
          </Typography>
          {!flipped && <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mt:2, color:'#9CA3AF' }}>
            <FlipIcon sx={{ fontSize:16 }} /><Typography fontSize="0.72rem">Click to reveal answer</Typography>
          </Box>}
        </Card>
      </Box>

      {/* Rating buttons */}
      {flipped && (
        <Box>
          <Typography fontSize="0.78rem" color="text.secondary" textAlign="center" mb={1.5}>How well did you know this?</Typography>
          <Grid container spacing={1.5}>
            {QUALITY_BUTTONS.map(({ q, label, color, bg, desc }) => (
              <Grid item xs={6} sm={3} key={q}>
                <Button fullWidth variant="outlined" onClick={() => review(q)}
                  sx={{ borderColor:color, color, bgcolor:bg, textTransform:'none', borderRadius:2, py:1.5, fontWeight:700, fontSize:'0.82rem', flexDirection:'column', gap:0.3,
                        '&:hover':{ bgcolor:color+'22', borderColor:color } }}>
                  {label}
                  <Typography fontSize="0.65rem" color="inherit" sx={{ opacity:0.7 }}>{desc}</Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default function Flashcards() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studying, setStudying] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [snack, setSnack] = useState('');
  const [newDeck, setNewDeck] = useState({ title:'', subject_code:'' });
  const [newCards, setNewCards] = useState('');
  const [todayCount, setTodayCount] = useState(0);

  const load = () => {
    Promise.all([
      api.get('/flashcards/decks'),
      api.get('/flashcards/today'),
    ]).then(([d, t]) => {
      setDecks(d.data || []);
      setTodayCount(t.data.count || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const createDeck = async () => {
    if (!newDeck.title.trim()) return;
    // Parse card pairs: "Q: ... A: ..." format
    const cards = [];
    const pairs = newCards.split('\n\n').filter(Boolean);
    for (const pair of pairs) {
      const lines = pair.split('\n');
      const front = lines.find(l => l.startsWith('Q:'))?.replace('Q:','').trim();
      const back  = lines.find(l => l.startsWith('A:'))?.replace('A:','').trim();
      if (front && back) cards.push({ front, back });
    }
    try {
      await api.post('/flashcards/decks', { ...newDeck, cards });
      setSnack(`✅ Deck created with ${cards.length} cards!`);
      setShowNew(false); setNewDeck({ title:'', subject_code:'' }); setNewCards('');
      load();
    } catch (e) { setSnack(e.response?.data?.error || 'Failed'); }
  };

  if (studying) return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Container sx={{ py:4, flex:1 }} maxWidth="sm"><StudySession deckId={studying} onDone={() => { setStudying(null); load(); }} /></Container>
      <Footer />
    </Box>
  );

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#1E1B4B,#4F46E5)', py:5, px:2 }}>
        <Container>
          <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif" mb={1}>🃏 Flashcards</Typography>
          <Typography color="rgba(255,255,255,0.75)" mb={2}>Spaced repetition learning — review cards at the optimal time for maximum retention</Typography>
          {todayCount > 0 && (
            <Alert severity="warning" sx={{ bgcolor:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', color:'white', '& .MuiAlert-icon':{ color:'#F59E0B' } }}>
              📅 {todayCount} cards due today across all decks
            </Alert>
          )}
        </Container>
      </Box>

      <Container sx={{ py:4, flex:1 }} maxWidth="lg">
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
          <Typography fontWeight={700}>{decks.length} deck{decks.length !== 1 ? 's':''}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowNew(true)}
            sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:2, boxShadow:'none' }}>
            New Deck
          </Button>
        </Box>

        {loading ? <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>
         : decks.length === 0 ? (
          <Box sx={{ textAlign:'center', py:8 }}>
            <Typography fontSize="3rem">🃏</Typography>
            <Typography fontWeight={700} mt={2} mb={0.5}>No flashcard decks yet</Typography>
            <Typography color="text.secondary" fontSize="0.9rem" mb={3}>Create your first deck to start learning with spaced repetition</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowNew(true)}
              sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:2, boxShadow:'none' }}>
              Create First Deck
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {decks.map(d => <Grid item xs={12} sm={6} md={4} key={d.id}><DeckCard deck={d} onStudy={setStudying} onView={id => setStudying(id)} /></Grid>)}
          </Grid>
        )}
      </Container>

      {/* New Deck Dialog */}
      <Dialog open={showNew} onClose={() => setShowNew(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3 } }}>
        <DialogTitle fontWeight={800}>Create New Flashcard Deck</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt:1 }}>
            <TextField label="Deck Title *" fullWidth size="small" value={newDeck.title} onChange={e=>setNewDeck(d=>({...d,title:e.target.value}))} placeholder="e.g. DBMS Key Concepts" />
            <TextField label="Subject Code (optional)" fullWidth size="small" value={newDeck.subject_code} onChange={e=>setNewDeck(d=>({...d,subject_code:e.target.value}))} placeholder="e.g. 22CS51" />
            <Box>
              <Typography fontSize="0.82rem" fontWeight={600} mb={0.5}>Cards (optional — format: Q: question ↵ A: answer, separated by blank line)</Typography>
              <TextField fullWidth multiline rows={8} size="small" value={newCards} onChange={e=>setNewCards(e.target.value)}
                placeholder={"Q: What is normalization in DBMS?\nA: The process of organizing data to reduce redundancy and improve data integrity\n\nQ: What is a primary key?\nA: A unique identifier for each record in a table"}
                inputProps={{ style:{ fontFamily:'monospace', fontSize:'0.78rem' } }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p:3 }}>
          <Button onClick={() => setShowNew(false)} sx={{ textTransform:'none' }}>Cancel</Button>
          <Button variant="contained" onClick={createDeck} disabled={!newDeck.title.trim()}
            sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', fontWeight:700, borderRadius:2, boxShadow:'none' }}>
            Create Deck
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={()=>setSnack('')} message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
    </Box>
  );
}
