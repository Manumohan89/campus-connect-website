import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Button, Chip, Card,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, TextField, Tabs, Tab
} from '@mui/material';
import { useTheme } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const TASK_REWARDS = { voice: 5, image: 3, text: 2 };
const TASK_COLORS  = { voice: '#8b5cf6', image: '#0ea5e9', text: '#10b981' };
const TASK_ICONS   = { voice: '🎙️', image: '🖼️', text: '📝' };

// ─── Consent Screen ───────────────────────────────────────────────────────────
function ConsentScreen({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 540, width: '100%', p: 4, border: '1px solid', borderColor: isDark ? '#334155' : '#e2e8f0', borderRadius: '20px' }}>
        <Typography variant="h5" fontWeight={800} mb={1} color="text.primary">🤝 Before You Start Earning</Typography>
        <Typography color="text.secondary" fontSize="0.9rem" mb={3}>
          CampusConnect's AI Data Earn Platform pays you for small AI training tasks. Please read and agree before continuing.
        </Typography>

        {[
          ['📊 Data Usage', 'Your contributions will be used to train AI models by third-party AI companies.'],
          ['🔒 Anonymisation', 'All data is stripped of personal identifiers. Your name/email is never attached to any dataset.'],
          ['💰 Payments', 'You earn ₹2–₹5 per approved task. Earnings are added to your wallet after review.'],
          ['🗑️ Right to Delete', 'You can request deletion of all your submitted data at any time from your profile.'],
        ].map(([title, text]) => (
          <Box key={title} sx={{ display: 'flex', gap: 1.5, mb: 2, p: 1.5, borderRadius: '10px', bgcolor: isDark ? '#1e293b' : '#f8fafc', border: '1px solid', borderColor: isDark ? '#334155' : '#e2e8f0' }}>
            <Typography fontSize="1.1rem">{title.split(' ')[0]}</Typography>
            <Box>
              <Typography fontWeight={700} fontSize="0.82rem" color="text.primary">{title.slice(2)}</Typography>
              <Typography fontSize="0.78rem" color="text.secondary" mt={0.25}>{text}</Typography>
            </Box>
          </Box>
        ))}

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3, p: 1.5, borderRadius: '10px',
                    bgcolor: checked ? '#4F46E511' : isDark ? '#1e293b' : '#f8fafc',
                    border: `1px solid ${checked ? '#4F46E5' : isDark ? '#334155' : '#e2e8f0'}`,
                    cursor: 'pointer' }} onClick={() => setChecked(!checked)}>
          <Box sx={{ width: 20, height: 20, borderRadius: '5px', border: '2px solid', mt: 0.1, flexShrink: 0,
                      borderColor: checked ? '#4F46E5' : isDark ? '#475569' : '#94a3b8',
                      bgcolor: checked ? '#4F46E5' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {checked && <Typography sx={{ color: '#fff', fontSize: '0.75rem', lineHeight: 1 }}>✓</Typography>}
          </Box>
          <Typography fontSize="0.82rem" color="text.primary">
            I understand and agree that my task data will be used for AI training in anonymised form,
            and I consent to receive payment per approved task.
          </Typography>
        </Box>

        <Button fullWidth variant="contained" disabled={!checked} onClick={onAccept}
          sx={{ bgcolor: '#4F46E5', color: '#fff', py: 1.5, fontWeight: 700, borderRadius: '12px',
                '&:hover': { bgcolor: '#4338ca' }, '&:disabled': { opacity: 0.4 } }}>
          I Agree — Start Earning
        </Button>
      </Card>
    </Box>
  );
}

// ─── Voice Task ───────────────────────────────────────────────────────────────
function VoiceTask({ task, onSubmit, onSkip }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl,  setAudioUrl]  = useState(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorder = useRef(null);
  const chunks        = useRef([]);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch {
      alert('Microphone access denied. Please allow mic access in browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) { mediaRecorder.current.stop(); setRecording(false); }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('task_id', task.id);
    fd.append('task_type', 'voice');
    fd.append('file', audioBlob, 'recording.webm');
    try {
      await api.post('/earn/submit', fd);
      onSubmit(TASK_REWARDS.voice);
    } catch (e) { alert(e.response?.data?.error || 'Upload failed. Please try again.'); }
    setUploading(false);
  };

  return (
    <Box>
      <Box sx={{ p: 3, borderRadius: '16px', bgcolor: '#8b5cf611', border: '1px solid #8b5cf622', mb: 3 }}>
        <Typography fontWeight={700} color="#8b5cf6" mb={1} fontSize="0.8rem" textTransform="uppercase">Read aloud clearly:</Typography>
        <Typography fontSize="1.1rem" color="text.primary" fontStyle="italic" lineHeight={1.7}>
          "{task.prompt}"
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {!audioUrl ? (
          <Button variant="contained" onClick={recording ? stopRecording : startRecording}
            sx={{ bgcolor: recording ? '#ef4444' : '#8b5cf6', color: '#fff', py: 2, px: 5, borderRadius: '50px',
                  fontWeight: 700, fontSize: '1rem', animation: recording ? 'pulse 1s infinite' : 'none',
                  '&:hover': { bgcolor: recording ? '#dc2626' : '#7c3aed' } }}>
            {recording ? '⏹ Stop Recording' : '🎙️ Start Recording'}
          </Button>
        ) : (
          <Box sx={{ width: '100%' }}>
            <audio src={audioUrl} controls style={{ width: '100%', marginBottom: 16 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                sx={{ flex: 1, borderColor: isDark ? '#475569' : '#e2e8f0', color: 'text.secondary' }}>
                Re-record
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={uploading}
                sx={{ flex: 2, bgcolor: '#8b5cf6', color: '#fff', fontWeight: 700,
                      '&:hover': { bgcolor: '#7c3aed' } }}>
                {uploading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : `Submit & Earn ₹${TASK_REWARDS.voice}`}
              </Button>
            </Box>
          </Box>
        )}
        <Button onClick={onSkip} sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>Skip this task</Button>
      </Box>
      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.5)}50%{box-shadow:0 0 0 10px rgba(139,92,246,0)}}`}</style>
    </Box>
  );
}

// ─── Image Labeling Task ──────────────────────────────────────────────────────
function ImageTask({ task, onSubmit, onSkip }) {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.post('/earn/submit', { task_id: task.id, task_type: 'image', label: selected });
      onSubmit(TASK_REWARDS.image);
    } catch (e) { alert(e.response?.data?.error || 'Submission failed. Please try again.'); }
    setSubmitting(false);
  };

  return (
    <Box>
      <Box sx={{ borderRadius: '16px', overflow: 'hidden', mb: 3, maxHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9' }}>
        <img src={task.image_url || `https://picsum.photos/seed/${task.id}/600/280`} alt="label this"
          style={{ width: '100%', objectFit: 'cover', maxHeight: 280 }} />
      </Box>
      <Typography fontWeight={700} color="text.primary" mb={1.5}>{task.question || 'What does this image show?'}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {(task.options || ['Person', 'Vehicle', 'Animal', 'Object', 'Landscape', 'Food']).map(opt => (
          <Button key={opt} onClick={() => setSelected(opt)} variant={selected === opt ? 'contained' : 'outlined'}
            sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: selected === opt ? 700 : 400,
                  ...(selected === opt
                    ? { bgcolor: '#0ea5e9', color: '#fff', borderColor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' } }
                    : { borderColor: '#0ea5e955', color: '#0ea5e9', '&:hover': { bgcolor: '#0ea5e911' } }) }}>
            {opt}
          </Button>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button onClick={onSkip} sx={{ color: 'text.secondary' }}>Skip</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!selected || submitting}
          sx={{ flex: 1, bgcolor: '#0ea5e9', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#0284c7' } }}>
          {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : `Submit & Earn ₹${TASK_REWARDS.image}`}
        </Button>
      </Box>
    </Box>
  );
}

// ─── Text Classification Task ─────────────────────────────────────────────────
function TextTask({ task, onSubmit, onSkip }) {
  const [label, setLabel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSubmit = async () => {
    if (!label) return;
    setSubmitting(true);
    try {
      await api.post('/earn/submit', { task_id: task.id, task_type: 'text', label });
      onSubmit(TASK_REWARDS.text);
    } catch (e) { alert(e.response?.data?.error || 'Submission failed. Please try again.'); }
    setSubmitting(false);
  };

  const sentimentOpts = [
    { value: 'positive', label: '😊 Positive', color: '#10b981' },
    { value: 'negative', label: '😞 Negative', color: '#ef4444' },
    { value: 'neutral',  label: '😐 Neutral',  color: '#f59e0b' },
  ];

  const classifyOpts = task.options || sentimentOpts.map(o => ({ value: o.value, label: o.label, color: o.color }));

  return (
    <Box>
      <Box sx={{ p: 3, borderRadius: '16px', bgcolor: isDark ? '#1e293b' : '#f8fafc', border: '1px solid', borderColor: isDark ? '#334155' : '#e2e8f0', mb: 3 }}>
        <Typography fontWeight={700} color="text.secondary" fontSize="0.75rem" textTransform="uppercase" mb={1}>
          {task.task_subtype === 'classify' ? 'Classify this text' : 'Sentiment of this text'}
        </Typography>
        <Typography color="text.primary" fontSize="1rem" lineHeight={1.7}>{task.prompt}</Typography>
      </Box>
      <Typography fontWeight={600} color="text.secondary" fontSize="0.82rem" mb={1.5}>Select the correct label:</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {classifyOpts.map(opt => (
          <Button key={opt.value} onClick={() => setLabel(opt.value)} variant={label === opt.value ? 'contained' : 'outlined'}
            sx={{ borderRadius: '12px', textTransform: 'none', px: 2, fontWeight: label === opt.value ? 700 : 400,
                  ...(label === opt.value
                    ? { bgcolor: opt.color || '#10b981', color: '#fff', borderColor: opt.color || '#10b981', '&:hover': { bgcolor: opt.color } }
                    : { borderColor: (opt.color || '#10b981') + '55', color: opt.color || '#10b981', '&:hover': { bgcolor: (opt.color || '#10b981') + '11' } }) }}>
            {opt.label}
          </Button>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button onClick={onSkip} sx={{ color: 'text.secondary' }}>Skip</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!label || submitting}
          sx={{ flex: 1, bgcolor: '#10b981', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#059669' } }}>
          {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : `Submit & Earn ₹${TASK_REWARDS.text}`}
        </Button>
      </Box>
    </Box>
  );
}

// ─── Withdraw Dialog ──────────────────────────────────────────────────────────
function WithdrawDialog({ open, balance, onClose, onSuccess }) {
  const [amount, setAmount]   = useState('');
  const [upi,    setUpi]      = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 10) { setError('Minimum withdrawal is ₹10'); return; }
    if (amt > balance)    { setError(`You only have ₹${balance} available`); return; }
    if (!upi)             { setError('Enter your UPI ID'); return; }
    setLoading(true);
    try {
      await api.post('/earn/withdraw', { amount: amt, upi_id: upi });
      onSuccess(amt);
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Withdrawal failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: '16px', maxWidth: 400 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>💸 Withdraw Earnings</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" fontSize="0.85rem" mb={2}>
          Available balance: <Box component="span" sx={{ color: '#10b981', fontWeight: 700 }}>₹{balance}</Box>
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>}
        <TextField fullWidth label="Amount (₹)" type="number" value={amount} onChange={e => { setAmount(e.target.value); setError(''); }}
          sx={{ mb: 2 }} inputProps={{ min: 10, max: balance }} />
        <TextField fullWidth label="UPI ID (e.g. name@upi)" value={upi} onChange={e => { setUpi(e.target.value); setError(''); }} />
        <Typography color="text.secondary" fontSize="0.72rem" mt={1}>
          Withdrawals are processed within 2–3 business days.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button variant="contained" onClick={handleWithdraw} disabled={loading}
          sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#059669' } }}>
          {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Withdraw'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Earn Platform ───────────────────────────────────────────────────────
export default function EarnPlatform() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [consentGiven, setConsentGiven] = useState(() => localStorage.getItem('earnConsent') === 'true');
  const [tasks,      setTasks]      = useState([]);
  const [wallet,     setWallet]     = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [completed,  setCompleted]  = useState(0);
  const [activeTask, setActiveTask] = useState(null);
  const [tab,        setTab]        = useState(0);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // Sample tasks (in production these come from backend)
  const DEMO_TASKS = [
    { id: 1, type: 'voice',  title: 'Record a sentence', prompt: 'The quick brown fox jumps over the lazy dog near the riverside.', reward: 5, estimated_time: '30 sec' },
    { id: 2, type: 'voice',  title: 'Record a question', prompt: 'What time does the morning train arrive at Bengaluru City Junction?', reward: 5, estimated_time: '30 sec' },
    { id: 3, type: 'image',  title: 'Label an image',    question: 'What is the primary subject of this image?', options: ['Person', 'Vehicle', 'Animal', 'Building', 'Food', 'Nature'], reward: 3, estimated_time: '15 sec' },
    { id: 4, type: 'image',  title: 'Classify scene',    question: 'What type of environment does this show?', options: ['Indoor', 'Outdoor', 'Urban', 'Rural', 'Office', 'Home'], reward: 3, estimated_time: '15 sec' },
    { id: 5, type: 'text',   title: 'Sentiment analysis', prompt: 'The delivery was extremely late and the packaging was damaged. Very disappointing experience.', task_subtype: 'sentiment', options: [{value:'positive',label:'😊 Positive',color:'#10b981'},{value:'negative',label:'😞 Negative',color:'#ef4444'},{value:'neutral',label:'😐 Neutral',color:'#f59e0b'}], reward: 2, estimated_time: '10 sec' },
    { id: 6, type: 'text',   title: 'Classify intent', prompt: 'Book me a table for 4 at the Italian restaurant downtown for tomorrow evening.', task_subtype: 'classify', options: [{value:'booking',label:'📅 Booking',color:'#4F46E5'},{value:'inquiry',label:'❓ Inquiry',color:'#0ea5e9'},{value:'complaint',label:'😠 Complaint',color:'#ef4444'},{value:'feedback',label:'💬 Feedback',color:'#10b981'}], reward: 2, estimated_time: '10 sec' },
  ];

  useEffect(() => {
    if (!consentGiven) return;
    // Load wallet
    api.get('/earn/wallet').then(r => {
      setWallet(r.data.balance || 0);
      setTotalEarned(r.data.total_earned || 0);
      setCompleted(r.data.tasks_completed || 0);
      setPendingCount(r.data.pending_count || 0);
    }).catch(() => {});
    // Load tasks
    api.get('/earn/tasks').then(r => setTasks(r.data?.length ? r.data : DEMO_TASKS)).catch(() => setTasks(DEMO_TASKS)).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consentGiven]);

  const handleConsent = () => { localStorage.setItem('earnConsent', 'true'); setConsentGiven(true); };

  const handleTaskSubmit = (reward) => {
    setCompleted(c => c + 1);
    setActiveTask(null);
    setPendingCount(p => p + 1);
    setToast(`✅ Task submitted! ₹${reward} will be added after admin review.`);
    setTimeout(() => setToast(null), 5000);
    // Refresh wallet from server after a moment
    setTimeout(() => {
      api.get('/earn/wallet').then(r => {
        setWallet(r.data.balance || 0);
        setTotalEarned(r.data.total_earned || 0);
        setCompleted(r.data.tasks_completed || 0);
        setPendingCount(r.data.pending_count || 0);
      }).catch(() => {});
    }, 1500);
  };

  const handleWithdrawSuccess = (amount) => {
    setWallet(w => +(w - amount).toFixed(2));
    setToast(`₹${amount} withdrawal requested! Processing in 2–3 days.`);
    setTimeout(() => setToast(null), 5000);
  };

  if (!consentGiven) return <ConsentScreen onAccept={handleConsent} />;

  const tasksByType = { voice: tasks.filter(t => t.type === 'voice'), image: tasks.filter(t => t.type === 'image'), text: tasks.filter(t => t.type === 'text') };
  const tabTypes = ['all', 'voice', 'image', 'text'];
  const visibleTasks = tab === 0 ? tasks : tasksByType[tabTypes[tab]] || [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      {/* Toast */}
      {toast && (
        <Box sx={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, bgcolor: '#10b981', color: '#fff',
                    px: 3, py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.35)', animation: 'slideIn 0.3s ease' }}>
          {toast}
        </Box>
      )}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={900} color="text.primary">
            💰 AI Data Earn Platform
          </Typography>
          <Typography color="text.secondary" fontSize="0.9rem" mt={0.5}>
            Complete small AI training tasks and earn real money — voice, image, and text
          </Typography>
        </Box>

        {/* Wallet + Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 2, mb: 4 }}>
          {[
            { icon: '💳', label: 'Wallet Balance', value: `₹${wallet.toFixed(2)}`, color: '#10b981', highlight: true },
            { icon: '📈', label: 'Total Earned', value: `₹${totalEarned.toFixed(2)}`, color: '#4F46E5' },
            { icon: '✅', label: 'Tasks Done', value: completed, color: '#0ea5e9' },
            { icon: '📋', label: 'Available', value: tasks.length, color: '#f59e0b' },
          ].map(s => (
            <Card key={s.label} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid', position: 'relative', overflow: 'hidden',
                                       borderColor: s.highlight ? s.color + '44' : isDark ? '#334155' : '#e2e8f0' }}>
              {s.highlight && <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: s.color }} />}
              <Typography fontSize="1.5rem" mb={0.5}>{s.icon}</Typography>
              <Typography fontWeight={800} fontSize="1.5rem" color={s.color} fontFamily="monospace">{s.value}</Typography>
              <Typography fontSize="0.75rem" color="text.secondary">{s.label}</Typography>
            </Card>
          ))}
        </Box>

        {/* Withdraw button */}
        {wallet >= 10 && (
          <Box sx={{ mb: 3 }}>
            <Button variant="contained" onClick={() => setWithdrawOpen(true)}
              sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 700, px: 3, py: 1, borderRadius: '12px',
                    '&:hover': { bgcolor: '#059669' } }}>
              💸 Withdraw ₹{wallet.toFixed(2)}
            </Button>
          </Box>
        )}

        {/* Earnings note */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.82rem' }}>
          <strong>How earnings work:</strong> Submit tasks → Admin reviews (24h) → ₹ added to wallet → Withdraw via UPI.<br/>
          Voice = ₹5 · Image = ₹3 · Text = ₹2. Minimum withdrawal: ₹10. Your balance only updates after admin approval.
        </Alert>
        {pendingCount > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.82rem' }}>
            ⏳ You have <strong>{pendingCount} task{pendingCount > 1 ? 's' : ''} under review</strong>. 
            Earnings will be added to your wallet after admin approval.
          </Alert>
        )}

        {/* Task filter tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontSize: '0.85rem' },
          '& .Mui-selected': { color: '#4F46E5' }, '& .MuiTabs-indicator': { bgcolor: '#4F46E5' } }}>
          <Tab label={`All Tasks (${tasks.length})`} />
          <Tab label={`🎙️ Voice (${tasksByType.voice.length})`} />
          <Tab label={`🖼️ Image (${tasksByType.image.length})`} />
          <Tab label={`📝 Text (${tasksByType.text.length})`} />
        </Tabs>

        {/* Task cards */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#4F46E5' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 2 }}>
            {visibleTasks.map(task => (
              <Card key={task.id} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid',
                                         borderColor: isDark ? '#334155' : '#e2e8f0',
                                         cursor: 'pointer', transition: 'all 0.2s',
                                         '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${TASK_COLORS[task.type]}22`, borderColor: TASK_COLORS[task.type] + '66' } }}
                    onClick={() => setActiveTask(task)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                              bgcolor: TASK_COLORS[task.type] + '15' }}>
                    {TASK_ICONS[task.type]}
                  </Box>
                  <Chip label={`₹${task.reward}`} size="small"
                    sx={{ bgcolor: TASK_COLORS[task.type] + '18', color: TASK_COLORS[task.type], fontWeight: 800, fontSize: '0.8rem' }} />
                </Box>
                <Typography fontWeight={700} fontSize="0.9rem" color="text.primary" mb={0.5}>{task.title}</Typography>
                <Typography color="text.secondary" fontSize="0.78rem" mb={1.5} sx={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {task.prompt || task.question || 'Complete this AI labeling task'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontSize="0.72rem" color="text.secondary">⏱ {task.estimated_time}</Typography>
                  <Typography fontSize="0.72rem" sx={{ color: TASK_COLORS[task.type], fontWeight: 700 }}>
                    {task.type.charAt(0).toUpperCase() + task.type.slice(1)} task
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* Task Modal */}
        <Dialog open={!!activeTask} onClose={() => setActiveTask(null)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
          {activeTask && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                              bgcolor: TASK_COLORS[activeTask.type] + '15' }}>
                    {TASK_ICONS[activeTask.type]}
                  </Box>
                  <Box>
                    <Typography fontWeight={800}>{activeTask.title}</Typography>
                    <Typography fontSize="0.75rem" color="text.secondary">Earn ₹{activeTask.reward} on approval</Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                {activeTask.type === 'voice' && <VoiceTask task={activeTask} onSubmit={handleTaskSubmit} onSkip={() => setActiveTask(null)} />}
                {activeTask.type === 'image' && <ImageTask task={activeTask} onSubmit={handleTaskSubmit} onSkip={() => setActiveTask(null)} />}
                {activeTask.type === 'text'  && <TextTask  task={activeTask} onSubmit={handleTaskSubmit} onSkip={() => setActiveTask(null)} />}
              </DialogContent>
            </>
          )}
        </Dialog>

        <WithdrawDialog open={withdrawOpen} balance={wallet} onClose={() => setWithdrawOpen(false)} onSuccess={handleWithdrawSuccess} />
      </Container>

      <Footer />
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </Box>
  );
}
