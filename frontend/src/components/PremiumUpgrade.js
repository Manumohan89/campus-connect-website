import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Button, Chip, Grid,
  CircularProgress, Alert, Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const FEATURES_FREE = [
  '5 AI tutor questions per day',
  'Sem 1–4 VTU resources',
  '10 coding submissions per day',
  'Basic CGPA analytics',
  'Community forum access',
  'Placement drives listing',
];
const FEATURES_PREMIUM = [
  'Unlimited AI Study Tutor',
  'All 8 semesters — all schemes (2015–2025)',
  'Unlimited coding submissions',
  'Resume AI enhancement',
  'Priority placement alerts (instant push)',
  'College-wide leaderboard + badges',
  'AI flashcard generation',
  'Mock interview Q&A with AI feedback',
  'Export certificates as PDF',
  'Download VTU resources offline',
];

function loadRazorpay(src) {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const s = document.createElement('script');
    s.id = 'razorpay-script'; s.src = src;
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PremiumUpgrade() {
  const [plans, setPlans] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/payments/plans'),
      api.get('/payments/subscription').catch(() => ({ data: { tier:'free', is_active:false } })),
    ]).then(([p, s]) => {
      setPlans(p.data);
      setSubscription(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePay = async (planId) => {
    setError(''); setPaying(planId);
    try {
      if (!plans?.razorpay_enabled) {
        setError('Payment gateway not yet configured. Contact admin or check back soon.');
        setPaying(''); return;
      }

      const loaded = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) { setError('Failed to load payment gateway. Check your internet connection.'); setPaying(''); return; }

      const orderRes = await api.post('/payments/create-order', { plan_id: planId });
      const { order_id, amount, currency } = orderRes.data;

      const options = {
        key: plans.razorpay_key,
        amount, currency,
        name: 'Campus Connect',
        description: plans.plans[planId]?.name,
        order_id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', { ...response, plan_id: planId });
            setSuccess(`🎉 ${verifyRes.data.plan} activated until ${new Date(verifyRes.data.expires_at).toLocaleDateString('en-IN')}!`);
            setSubscription({ tier:'premium', is_active:true, expires_at:verifyRes.data.expires_at });
          } catch (e) {
            setError('Payment received but verification failed. Contact support with your payment ID: ' + response.razorpay_payment_id);
          }
        },
        prefill: { name: '', email: '' },
        theme: { color: '#4F46E5' },
        modal: { ondismiss: () => setPaying('') },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => { setError('Payment failed: ' + resp.error.description); setPaying(''); });
      rzp.open();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to initiate payment');
      setPaying('');
    }
  };

  if (loading) return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <CircularProgress />
    </Box>
  );

  const isActive = subscription?.is_active && subscription?.tier === 'premium';

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Box sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', py:6, px:2, textAlign:'center' }}>
        <Chip icon={<StarIcon sx={{ color:'#F59E0B !important', fontSize:'14px !important' }} />} label="Upgrade to Premium" sx={{ bgcolor:'rgba(255,255,255,0.15)', color:'white', fontWeight:700, mb:2 }} />
        <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">Unlock Your Full Potential</Typography>
        <Typography color="rgba(255,255,255,0.8)" mt={1} fontSize="1.1rem">Get unlimited access to all Campus Connect features</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py:6, flex:1 }}>
        {error && <Alert severity="error" sx={{ mb:3, borderRadius:2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb:3, borderRadius:2 }}>{success}</Alert>}

        {isActive && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb:4, borderRadius:2, fontSize:'0.95rem' }}>
            <strong>Premium Active</strong> — Your subscription is active until {new Date(subscription.expires_at).toLocaleDateString('en-IN')} ({subscription.days_left} days left)
          </Alert>
        )}

        <Grid container spacing={3} justifyContent="center">
          {/* Free Plan */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:4, p:3, height:'100%' }}>
              <Box sx={{ mb:2 }}>
                <Typography fontWeight={800} fontSize="1.2rem">Free</Typography>
                <Box sx={{ display:'flex', alignItems:'baseline', gap:0.5, mt:1 }}>
                  <Typography fontSize="2.5rem" fontWeight={900}>₹0</Typography>
                  <Typography color="text.secondary">/forever</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb:2 }} />
              <List dense disablePadding>
                {FEATURES_FREE.map(f => (
                  <ListItem key={f} disableGutters sx={{ py:0.5 }}>
                    <ListItemIcon sx={{ minWidth:28 }}><CheckCircleIcon sx={{ color:'#10B981', fontSize:16 }} /></ListItemIcon>
                    <ListItemText primary={f} primaryTypographyProps={{ fontSize:'0.82rem', color:'#374151' }} />
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="outlined" disabled sx={{ mt:3, borderRadius:2, textTransform:'none', fontWeight:700 }}>Current Plan</Button>
            </Card>
          </Grid>

          {/* Premium Monthly */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border:'2.5px solid #4F46E5', borderRadius:4, p:3, height:'100%', position:'relative', overflow:'visible' }}>
              <Chip label="MOST POPULAR" size="small"
                sx={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', bgcolor:'#4F46E5', color:'white', fontWeight:800, fontSize:'0.68rem' }} />
              <Box sx={{ mb:2 }}>
                <Typography fontWeight={800} fontSize="1.2rem" color="#4F46E5">Premium Monthly</Typography>
                <Box sx={{ display:'flex', alignItems:'baseline', gap:0.5, mt:1 }}>
                  <Typography fontSize="2.5rem" fontWeight={900} color="#4F46E5">₹199</Typography>
                  <Typography color="text.secondary">/month</Typography>
                </Box>
                <Typography fontSize="0.75rem" color="text.secondary">Cancel anytime</Typography>
              </Box>
              <Divider sx={{ mb:2 }} />
              <List dense disablePadding>
                {FEATURES_PREMIUM.map(f => (
                  <ListItem key={f} disableGutters sx={{ py:0.5 }}>
                    <ListItemIcon sx={{ minWidth:28 }}><StarIcon sx={{ color:'#4F46E5', fontSize:14 }} /></ListItemIcon>
                    <ListItemText primary={f} primaryTypographyProps={{ fontSize:'0.82rem', color:'#374151', fontWeight:500 }} />
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="contained" onClick={() => handlePay('premium_monthly')} disabled={paying==='premium_monthly' || isActive}
                startIcon={paying==='premium_monthly' ? <CircularProgress size={16} sx={{ color:'#fff' }} /> : <LockOpenIcon />}
                sx={{ mt:3, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:2, textTransform:'none', fontWeight:800, boxShadow:'0 4px 14px rgba(79,70,229,0.4)', py:1.5 }}>
                {isActive ? 'Already Premium' : paying==='premium_monthly' ? 'Processing...' : 'Upgrade for ₹199/month'}
              </Button>
            </Card>
          </Grid>

          {/* Premium Yearly */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border:'1.5px solid #10B981', borderRadius:4, p:3, height:'100%', position:'relative', overflow:'visible' }}>
              <Chip label="BEST VALUE — 4 MONTHS FREE" size="small"
                sx={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', bgcolor:'#10B981', color:'white', fontWeight:800, fontSize:'0.62rem', whiteSpace:'nowrap' }} />
              <Box sx={{ mb:2 }}>
                <Typography fontWeight={800} fontSize="1.2rem" color="#10B981">Premium Yearly</Typography>
                <Box sx={{ display:'flex', alignItems:'baseline', gap:0.5, mt:1 }}>
                  <Typography fontSize="2.5rem" fontWeight={900} color="#10B981">₹1,499</Typography>
                  <Typography color="text.secondary">/year</Typography>
                </Box>
                <Typography fontSize="0.75rem" color="text.secondary">₹125/month — save ₹889</Typography>
              </Box>
              <Divider sx={{ mb:2 }} />
              <List dense disablePadding>
                {[...FEATURES_PREMIUM, 'Priority email support', 'Early access to new features'].map(f => (
                  <ListItem key={f} disableGutters sx={{ py:0.5 }}>
                    <ListItemIcon sx={{ minWidth:28 }}><StarIcon sx={{ color:'#10B981', fontSize:14 }} /></ListItemIcon>
                    <ListItemText primary={f} primaryTypographyProps={{ fontSize:'0.82rem', color:'#374151', fontWeight:500 }} />
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="contained" onClick={() => handlePay('premium_yearly')} disabled={paying==='premium_yearly' || isActive}
                startIcon={paying==='premium_yearly' ? <CircularProgress size={16} sx={{ color:'#fff' }} /> : <StarIcon />}
                sx={{ mt:3, bgcolor:'#10B981', '&:hover':{ bgcolor:'#059669' }, borderRadius:2, textTransform:'none', fontWeight:800, py:1.5 }}>
                {isActive ? 'Already Premium' : paying==='premium_yearly' ? 'Processing...' : 'Upgrade for ₹1,499/year'}
              </Button>
            </Card>
          </Grid>
        </Grid>

        {/* Trust signals */}
        <Box sx={{ mt:6, textAlign:'center' }}>
          <Typography fontWeight={700} mb={2} color="text.secondary" fontSize="0.85rem">TRUSTED BY VTU STUDENTS</Typography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt:1 }}>
            {[['🔒','Secure Payments','Razorpay — India\'s most trusted gateway'],['📱','Instant Access','Premium activates immediately after payment'],['🔄','Cancel Anytime','No questions asked refund within 7 days'],['🎓','Student-Priced','Built affordable for VTU students']].map(([icon,title,desc]) => (
              <Grid item xs={12} sm={6} md={3} key={title}>
                <Box sx={{ textAlign:'center', p:2 }}>
                  <Typography fontSize="2rem" mb={0.5}>{icon}</Typography>
                  <Typography fontWeight={700} fontSize="0.88rem">{title}</Typography>
                  <Typography fontSize="0.78rem" color="text.secondary">{desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
