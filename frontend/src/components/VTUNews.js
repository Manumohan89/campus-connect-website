import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, Chip, Grid, Button,
  CircularProgress, Alert, Stack, Divider
} from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import api from '../utils/api';

const CAT_CONFIG = {
  exam:        { label:'Exam',        color:'#EF4444', bg:'#FEF2F2', icon:<CalendarMonthIcon fontSize="small"/> },
  results:     { label:'Results',     color:'#10B981', bg:'#F0FDF4', icon:<AssessmentIcon fontSize="small"/> },
  syllabus:    { label:'Syllabus',    color:'#4F46E5', bg:'#EEF2FF', icon:<ArticleIcon fontSize="small"/> },
  revaluation: { label:'Revaluation', color:'#F59E0B', bg:'#FFFBEB', icon:<AnnouncementIcon fontSize="small"/> },
  circular:    { label:'Circular',    color:'#7C3AED', bg:'#EDE9FE', icon:<AnnouncementIcon fontSize="small"/> },
  platform:    { label:'Platform',    color:'#0EA5E9', bg:'#EFF6FF', icon:<AnnouncementIcon fontSize="small"/> },
};

const timeAgo = d => {
  if (!d) return '';
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

function NewsCard({ item }) {
  const cfg = CAT_CONFIG[item.category] || CAT_CONFIG.circular;
  return (
    <Card elevation={0} sx={{ border:'1.5px solid #E2E8F0', borderRadius:3, p:2.5, transition:'all 0.15s', '&:hover':{ borderColor:cfg.color, transform:'translateY(-2px)', boxShadow:`0 6px 20px ${cfg.color}22` } }}>
      <Box sx={{ display:'flex', gap:1, alignItems:'center', mb:1.5 }}>
        <Box sx={{ width:32, height:32, borderRadius:2, bgcolor:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', color:cfg.color }}>
          {cfg.icon}
        </Box>
        <Chip label={cfg.label} size="small" sx={{ bgcolor:cfg.bg, color:cfg.color, fontWeight:700, fontSize:'0.65rem' }} />
        <Typography fontSize="0.72rem" color="text.secondary" ml="auto">{timeAgo(item.fetched_at)}</Typography>
      </Box>
      <Typography fontWeight={700} fontSize="0.9rem" mb={0.75} lineHeight={1.4}>{item.title}</Typography>
      {item.content && <Typography fontSize="0.78rem" color="text.secondary" mb={1.5} lineHeight={1.6} sx={{ overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{item.content}</Typography>}
      {item.url && item.url.startsWith('http') && (
        <Button size="small" endIcon={<OpenInNewIcon sx={{ fontSize:'13px !important' }} />} href={item.url} target="_blank" rel="noopener noreferrer"
          sx={{ textTransform:'none', fontSize:'0.75rem', color:cfg.color, fontWeight:700, p:0, '&:hover':{ bgcolor:'transparent', textDecoration:'underline' } }}>
          Read on VTU official site
        </Button>
      )}
    </Card>
  );
}

export default function VTUNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/news', { params: filter ? { category: filter } : {} })
      .then(r => setNews(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const counts = {};
  news.forEach(n => { counts[n.category] = (counts[n.category]||0)+1; });

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <PublicHeader />
      <Box sx={{ background:'linear-gradient(135deg,#0EA5E9,#4F46E5)', py:5, px:2 }}>
        <Container>
          <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:1 }}>
            <AnnouncementIcon sx={{ color:'white', fontSize:'2.5rem' }} />
            <Typography variant="h3" fontWeight={900} color="white" fontFamily="'Space Grotesk',sans-serif">VTU News & Alerts</Typography>
          </Box>
          <Typography color="rgba(255,255,255,0.8)" mb={2}>Exam timetables, results, syllabus updates and important VTU circulars — all in one place</Typography>
          <Alert severity="info" sx={{ bgcolor:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'white', borderRadius:2, '& .MuiAlert-icon':{ color:'rgba(255,255,255,0.8)' } }}>
            📡 We track VTU official website and update this page automatically. Always verify important dates on vtu.ac.in
          </Alert>
        </Container>
      </Box>

      <Container sx={{ py:4, flex:1 }} maxWidth="lg">
        {/* Category filters */}
        <Box sx={{ display:'flex', gap:1, mb:3, flexWrap:'wrap' }}>
          <Chip label="All" clickable onClick={()=>setFilter('')}
            sx={{ fontWeight:700, bgcolor:!filter?'#4F46E5':'#F1F5F9', color:!filter?'white':'#374151' }} />
          {Object.entries(CAT_CONFIG).map(([key, cfg]) => counts[key] && (
            <Chip key={key} label={`${cfg.label} (${counts[key]||0})`} clickable onClick={()=>setFilter(key)}
              sx={{ fontWeight:700, bgcolor:filter===key?cfg.color:cfg.bg, color:filter===key?'white':cfg.color }} />
          ))}
        </Box>

        {loading ? <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>
         : news.length === 0 ? (
          <Box sx={{ textAlign:'center', py:8 }}>
            <Typography fontSize="3rem">📭</Typography>
            <Typography fontWeight={700} mt={2}>No news items yet</Typography>
            <Typography color="text.secondary" fontSize="0.9rem" mt={0.5}>News from VTU will appear here automatically</Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {news.map(item => <Grid item xs={12} sm={6} md={4} key={item.id}><NewsCard item={item} /></Grid>)}
          </Grid>
        )}

        <Box sx={{ mt:4, p:3, bgcolor:'#EEF2FF', borderRadius:3, textAlign:'center' }}>
          <Typography fontWeight={700} mb={0.5}>📌 Official VTU Links</Typography>
          <Box sx={{ display:'flex', gap:2, justifyContent:'center', flexWrap:'wrap', mt:1 }}>
            {[['VTU Results', 'https://results.vtu.ac.in'], ['VTU Official', 'https://vtu.ac.in'], ['Syllabus', 'https://vtu.ac.in/syllabus/'], ['Revaluation', 'https://vtu.ac.in/revaluation-retotalling/']].map(([label, href]) => (
              <Button key={label} size="small" href={href} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon sx={{ fontSize:'12px !important' }} />}
                sx={{ textTransform:'none', color:'#4F46E5', fontWeight:600, fontSize:'0.8rem' }}>{label}</Button>
            ))}
          </Box>
        </Box>
      </Container>
      <PublicFooter />
    </Box>
  );
}
