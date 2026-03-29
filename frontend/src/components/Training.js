import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, TextField, InputAdornment, Tab, Tabs, CircularProgress,
  Alert, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Skeleton, Divider, Stack, Avatar, IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FilterListIcon from '@mui/icons-material/FilterList';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CAT = {
  backlog_clearing: { label:'Backlog Clearing', color:'#EF4444', bg:'#FEF2F2', icon:<WarningIcon fontSize="small"/>, gradient:'linear-gradient(135deg,#EF444422,#EF444411)' },
  upskill:          { label:'Upskill',          color:'#7C3AED', bg:'#EDE9FE', icon:<TrendingUpIcon fontSize="small"/>, gradient:'linear-gradient(135deg,#7C3AED22,#7C3AED11)' },
  placement:        { label:'Placement Prep',   color:'#059669', bg:'#D1FAE5', icon:<BusinessCenterIcon fontSize="small"/>, gradient:'linear-gradient(135deg,#05966922,#05966911)' },
};

// Page skeleton shown while loading
function CourseSkeletons() {
  return (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card elevation={0} sx={{ border:'1px solid #E2E8F0', borderRadius:3, overflow:'hidden' }}>
            <Skeleton variant="rectangular" height={90} />
            <CardContent>
              <Skeleton height={28} sx={{ mb:1 }} />
              <Skeleton height={20} />
              <Skeleton height={20} width="70%" sx={{ mb:2 }} />
              <Box sx={{ display:'flex', gap:1 }}>
                <Skeleton height={24} width={60} sx={{ borderRadius:99 }} />
                <Skeleton height={24} width={80} sx={{ borderRadius:99 }} />
              </Box>
            </CardContent>
            <Box sx={{ px:2.5, pb:2.5 }}>
              <Skeleton height={42} sx={{ borderRadius:2 }} />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function CourseCard({ course, isEnrolled, onEnroll, onContinue }) {
  const cat = CAT[course.category] || CAT.upskill;
  const progress = course.progress || 0;

  return (
    <Card elevation={0} sx={{ border:`1px solid ${isEnrolled ? cat.color+'44' : '#E2E8F0'}`, borderRadius:'16px', height:'100%', display:'flex', flexDirection:'column', transition:'all 0.2s', '&:hover':{ transform:'translateY(-4px)', boxShadow:`0 16px 40px ${cat.color}20` } }}>
      {/* Coloured header */}
      <Box sx={{ p:2.5, background:cat.gradient, borderBottom:`1px solid ${cat.color}22`, position:'relative' }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:1 }}>
          <Chip icon={cat.icon} label={cat.label} size="small" sx={{ bgcolor:cat.bg, color:cat.color, fontWeight:700, fontSize:'0.7rem' }} />
          <Box sx={{ display:'flex', gap:0.75 }}>
            {course.is_free ? (
              <Chip label="FREE" size="small" sx={{ bgcolor:'#D1FAE5', color:'#065F46', fontWeight:800, fontSize:'0.65rem' }} />
            ) : (
              <Chip label="PREMIUM" size="small" sx={{ bgcolor:'#FEF9C3', color:'#92400E', fontWeight:700, fontSize:'0.65rem' }} />
            )}
            {isEnrolled && <Chip label="ENROLLED" size="small" sx={{ bgcolor:cat.color, color:'white', fontWeight:700, fontSize:'0.65rem' }} />}
          </Box>
        </Box>
        {course.subject_code && (
          <Chip label={course.subject_code} size="small" sx={{ bgcolor:'white', color:cat.color, fontWeight:700, fontSize:'0.7rem', border:`1px solid ${cat.color}44` }} />
        )}
      </Box>

      <CardContent sx={{ flex:1, p:2.5 }}>
        <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" mb={0.75} fontSize="0.95rem" lineHeight={1.3}>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2} lineHeight={1.65} sx={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {course.description}
        </Typography>

        {/* Meta row */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={1.5} useFlexGap>
          {course.duration_hours > 0 && (
            <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
              <AccessTimeIcon sx={{ fontSize:14, color:'#9CA3AF' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{course.duration_hours}h</Typography>
            </Box>
          )}
          {course.instructor && (
            <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
              <PersonIcon sx={{ fontSize:14, color:'#9CA3AF' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{course.instructor}</Typography>
            </Box>
          )}
          {course.department && course.department !== 'ALL' && (
            <Chip label={course.department} size="small" sx={{ height:20, fontSize:'0.65rem', bgcolor:'#F1F5F9', fontWeight:700 }} />
          )}
          {course.semester && (
            <Chip label={`Sem ${course.semester}`} size="small" sx={{ height:20, fontSize:'0.65rem', bgcolor:'#F1F5F9', fontWeight:700 }} />
          )}
        </Stack>

        {/* Certificate badge */}
        {course.has_certificate && (
          <Box sx={{ display:'flex', alignItems:'center', gap:0.75, p:1.25, bgcolor:'#F5F3FF', borderRadius:'8px', border:'1px solid #DDD6FE' }}>
            <WorkspacePremiumIcon sx={{ fontSize:16, color:'#7C3AED' }} />
            <Typography variant="caption" fontWeight={700} color="#6D28D9">Certificate on completion</Typography>
          </Box>
        )}

        {/* Progress bar for enrolled courses */}
        {isEnrolled && (
          <Box sx={{ mt:2 }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {progress === 100 ? '✅ Completed' : 'Progress'}
              </Typography>
              <Typography variant="caption" fontWeight={700} color={cat.color}>{progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress}
              sx={{ borderRadius:99, height:7, bgcolor:'#E2E8F0', '& .MuiLinearProgress-bar':{ bgcolor:cat.color, borderRadius:99 } }} />
            {course.certificate_issued && course.certificate_id && (
              <Button size="small" startIcon={<EmojiEventsIcon />} component="a" href={`/certificate/${course.certificate_id}`} target="_blank"
                sx={{ mt:1, color:'#7C3AED', fontWeight:700, textTransform:'none', fontSize:'0.75rem', p:0, '&:hover':{bgcolor:'transparent', textDecoration:'underline'} }}>
                View Certificate →
              </Button>
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p:2.5, pt:0, gap:1 }}>
        {isEnrolled ? (
          <Button fullWidth variant="contained" startIcon={<PlayCircleIcon />} onClick={() => onContinue(course)}
            sx={{ background:`linear-gradient(135deg,${cat.color},${cat.color}cc)`, fontWeight:700, borderRadius:'10px', textTransform:'none', boxShadow:'none' }}>
            {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
          </Button>
        ) : (
          <>
            <Button fullWidth variant="contained" startIcon={<PlayCircleIcon />} onClick={() => onEnroll(course)}
              sx={{ background:`linear-gradient(135deg,${cat.color},${cat.color}cc)`, fontWeight:700, borderRadius:'10px', textTransform:'none', boxShadow:'none' }}>
              {course.is_free ? 'Enroll Free' : 'Enroll Now'}
            </Button>
            {course.course_url && (
              <Tooltip title="View on external platform">
                <IconButton href={course.course_url} target="_blank" rel="noopener noreferrer" size="small"
                  sx={{ border:'1px solid #E2E8F0', borderRadius:'10px', color:cat.color, flexShrink:0 }}>
                  <OpenInNewIcon sx={{ fontSize:18 }} />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </CardActions>
    </Card>
  );
}

export default function Training() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [myCerts, setMyCerts] = useState([]);
  const [recommended, setRecommended] = useState({ failed_subjects:[], recommended_courses:[] });
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [snackMsg, setSnackMsg] = useState('');
  const [progressDialog, setProgressDialog] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, myRes, recRes, certRes] = await Promise.all([
        api.get('/training/courses'),
        api.get('/training/my-courses'),
        api.get('/training/recommended'),
        api.get('/training/my-certificates').catch(() => ({ data: [] })),
      ]);
      setCourses(allRes.data);
      setMyCourses(myRes.data);
      setRecommended(recRes.data);
      setMyCerts(certRes.data);
      setEnrolledIds(myRes.data.map(c => c.course_id));
    } catch {
      setSnackMsg('Failed to load training data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    try {
      await api.post('/training/enroll', { course_id: course.course_id });
      setSnackMsg(`Enrolled in "${course.title}"! 🎉 Start learning now.`);
      fetchAll();
    } catch {
      setSnackMsg('Enrollment failed. Please try again.');
    }
  };

  const handleUpdateProgress = async (courseId, progress) => {
    setUpdating(true);
    try {
      const res = await api.put('/training/progress', { course_id: courseId, progress });
      if (res.data.certificate_issued) {
        setSnackMsg('🏆 Course complete! Certificate issued! Check your email.');
        setProgressDialog(null);
        navigate(`/certificate/${res.data.certificate_id}`);
      } else {
        setSnackMsg(`Progress updated to ${progress}%!`);
        setProgressDialog(null);
      }
      fetchAll();
    } catch {
      setSnackMsg('Failed to update progress.');
    } finally {
      setUpdating(false);
    }
  };

  // Build enrolled map for fast lookup
  const enrolledMap = {};
  myCourses.forEach(c => { enrolledMap[c.course_id] = c; });

  let display = tab === 'my' ? myCourses
    : tab === 'recommended' ? recommended.recommended_courses
    : tab === 'certificates' ? []
    : tab === 'all' ? courses
    : courses.filter(c => c.category === tab);

  if (search) {
    const s = search.toLowerCase();
    display = display.filter(c =>
      c.title.toLowerCase().includes(s) ||
      c.description?.toLowerCase().includes(s) ||
      c.subject_code?.toLowerCase().includes(s) ||
      c.instructor?.toLowerCase().includes(s)
    );
  }

  const TABS = [
    { value:'all',          label:'All Courses',      count: courses.length },
    { value:'backlog_clearing', label:'⚠️ Backlog',   count: courses.filter(c=>c.category==='backlog_clearing').length },
    { value:'upskill',      label:'📈 Upskill',       count: courses.filter(c=>c.category==='upskill').length },
    { value:'placement',    label:'💼 Placement',     count: courses.filter(c=>c.category==='placement').length },
    { value:'my',           label:'📚 My Courses',    count: myCourses.length },
    { value:'recommended',  label:'🎯 For Me',        count: recommended.recommended_courses.length },
    { value:'certificates', label:'🏆 Certificates',  count: myCerts.length },
  ];

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />

      {/* Hero */}
      <Box sx={{ background:'linear-gradient(135deg,#312E81 0%,#4F46E5 50%,#7C3AED 100%)', py:{ xs:5, md:7 }, px:2, position:'relative', overflow:'hidden' }}>
        <Box sx={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)' }} />
        <Box sx={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)' }} />
        <Container sx={{ position:'relative' }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:3 }}>
            <Box>
              <Chip label="Campus Connect Learning" sx={{ bgcolor:'rgba(255,255,255,0.15)', color:'white', fontWeight:700, mb:2, backdropFilter:'blur(10px)' }} />
              <Typography variant="h3" fontWeight={900} fontFamily="'Space Grotesk',sans-serif" color="white" mb={1} fontSize={{ xs:'2rem', md:'2.75rem' }}>
                Training & Courses
              </Typography>
              <Typography color="rgba(255,255,255,0.8)" fontSize="1rem" mb={3} maxWidth={520} lineHeight={1.7}>
                Clear backlogs with free VTU-specific courses, upskill with industry-relevant content, and prep for placements — earn verified certificates.
              </Typography>
              {recommended.failed_subjects.length > 0 && (
                <Box sx={{ bgcolor:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.5)', borderRadius:'12px', p:2, display:'inline-flex', alignItems:'center', gap:1, cursor:'pointer' }} onClick={() => setTab('recommended')}>
                  <WarningIcon sx={{ color:'#FCA5A5', fontSize:20 }} />
                  <Typography color="white" fontWeight={700} fontSize="0.9rem">
                    {recommended.failed_subjects.length} backlog(s) detected — {recommended.recommended_courses.length} courses ready for you →
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Stats */}
            <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
              {[
                { n:courses.length, label:'Courses' },
                { n:myCourses.length, label:'Enrolled' },
                { n:myCerts.length, label:'Certificates' },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign:'center', bgcolor:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', borderRadius:'14px', px:2.5, py:2, border:'1px solid rgba(255,255,255,0.15)' }}>
                  <Typography fontFamily="'DM Mono',monospace" fontWeight={900} fontSize="1.8rem" color="white" lineHeight={1}>{s.n}</Typography>
                  <Typography color="rgba(255,255,255,0.6)" fontSize="0.72rem" textTransform="uppercase" letterSpacing="0.08em" mt={0.25}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py:4 }}>
        {/* Search */}
        <Box sx={{ display:'flex', gap:2, mb:3 }}>
          <TextField fullWidth placeholder="Search courses, subject codes, instructors..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ color:'#9CA3AF' }} /></InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'14px', bgcolor:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' } }} />
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb:3, bgcolor:'white', borderRadius:'14px', p:0.5, border:'1px solid #E2E8F0', '& .MuiTab-root':{ textTransform:'none', fontWeight:600, borderRadius:'10px', minHeight:38, py:0.75 }, '& .Mui-selected':{ bgcolor:'#4F46E5 !important', color:'white !important', fontWeight:700 }, '& .MuiTabs-indicator':{ display:'none' } }}>
          {TABS.map(t => (
            <Tab key={t.value} value={t.value}
              label={<Box sx={{ display:'flex', alignItems:'center', gap:0.75 }}>
                <span>{t.label}</span>
                {t.count > 0 && <Box sx={{ bgcolor: tab===t.value ? 'rgba(255,255,255,0.3)' : '#F1F5F9', borderRadius:'6px', px:0.75, py:0.125, fontSize:'0.65rem', fontWeight:700, color: tab===t.value ? 'white' : '#64748B', lineHeight:1.6 }}>{t.count}</Box>}
              </Box>} />
          ))}
        </Tabs>

        {/* Certificates tab */}
        {tab === 'certificates' && !loading && (
          myCerts.length === 0 ? (
            <Box sx={{ textAlign:'center', py:10 }}>
              <Typography fontSize="3rem" mb={2}>🏆</Typography>
              <Typography variant="h6" fontWeight={700} color="text.secondary">No certificates yet</Typography>
              <Typography color="text.secondary" mt={1}>Complete a course to earn your first certificate!</Typography>
              <Button variant="contained" onClick={() => setTab('all')} sx={{ mt:3, borderRadius:'12px', textTransform:'none', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'none' }}>Browse Courses</Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {myCerts.map(cert => (
                <Grid item xs={12} sm={6} md={4} key={cert.certificate_id}>
                  <Card elevation={0} sx={{ border:'1.5px solid #DDD6FE', borderRadius:'16px', p:3, bgcolor:'#F5F3FF', transition:'all 0.2s', '&:hover':{ transform:'translateY(-3px)', boxShadow:'0 12px 30px rgba(124,58,237,0.15)' } }}>
                    <Box sx={{ display:'flex', gap:2, mb:2, alignItems:'flex-start' }}>
                      <Box sx={{ width:52, height:52, borderRadius:'12px', background:'linear-gradient(135deg,#7C3AED,#4F46E5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>🏆</Box>
                      <Box>
                        <Typography fontWeight={800} fontSize="0.9rem" color="#1E1B4B" lineHeight={1.3}>{cert.title}</Typography>
                        <Typography variant="caption" color="#7C3AED" fontWeight={700} sx={{ textTransform:'uppercase', letterSpacing:'0.05em' }}>{CAT[cert.category]?.label || cert.category}</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2 }} />
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
                      <Box>
                        <Typography variant="caption" color="#9CA3AF" display="block">Completed</Typography>
                        <Typography fontWeight={700} fontSize="0.82rem" color="#374151">
                          {cert.completed_at ? new Date(cert.completed_at).toLocaleDateString('en-IN') : '—'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign:'right' }}>
                        <Typography variant="caption" color="#9CA3AF" display="block">Certificate ID</Typography>
                        <Typography fontWeight={700} fontSize="0.78rem" color="#4F46E5" fontFamily="monospace">{cert.certificate_id}</Typography>
                      </Box>
                    </Box>
                    <Button fullWidth variant="contained" startIcon={<DownloadIcon />} href={`/certificate/${cert.certificate_id}`} target="_blank"
                      sx={{ background:'linear-gradient(135deg,#7C3AED,#4F46E5)', textTransform:'none', fontWeight:700, borderRadius:'10px', boxShadow:'none' }}>
                      View & Download
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        )}

        {/* Regular course grid */}
        {tab !== 'certificates' && (
          loading ? <CourseSkeletons /> :
          display.length === 0 ? (
            <Box sx={{ textAlign:'center', py:10 }}>
              <Typography fontSize="3rem">{tab === 'my' ? '📚' : tab === 'recommended' ? '🎉' : '🔍'}</Typography>
              <Typography variant="h6" fontWeight={700} mt={2} color="text.secondary">
                {tab === 'my' ? "You haven't enrolled yet" : tab === 'recommended' ? 'No failed subjects! Keep it up!' : 'No courses found'}
              </Typography>
              <Typography color="text.secondary" mt={1} mb={3}>
                {tab === 'my' ? 'Browse all courses and enroll to start learning.' : tab !== 'recommended' ? 'Try different keywords or clear the search.' : ''}
              </Typography>
              {tab === 'my' && <Button variant="contained" onClick={() => setTab('all')} sx={{ borderRadius:'12px', textTransform:'none', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'none' }}>Browse All Courses</Button>}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {display.map(course => (
                <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                  <CourseCard
                    course={{ ...course, ...(enrolledMap[course.course_id] || {}) }}
                    isEnrolled={enrolledIds.includes(course.course_id)}
                    onEnroll={handleEnroll}
                    onContinue={c => setProgressDialog(c)}
                  />
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Container>

      {/* Progress Dialog */}
      {progressDialog && (
        <Dialog open onClose={() => setProgressDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx:{ borderRadius:'20px' } }}>
          <DialogTitle sx={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, pb:1 }}>
            Update Progress
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>{progressDialog.title}</Typography>
            <Box sx={{ p:2, bgcolor:'#EEF2FF', borderRadius:'12px', mb:3 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                <Typography variant="caption" fontWeight={700} color="#4F46E5">Current Progress</Typography>
                <Typography variant="caption" fontWeight={800} color="#4F46E5">{progressDialog.progress || 0}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressDialog.progress || 0}
                sx={{ borderRadius:99, height:8, bgcolor:'#C7D2FE', '& .MuiLinearProgress-bar':{ bgcolor:'#4F46E5' } }} />
            </Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform:'uppercase', letterSpacing:'0.06em', display:'block', mb:1.5 }}>Mark as:</Typography>
            {[25, 50, 75, 100].map(p => {
              const isHigher = p > (progressDialog.progress || 0);
              return (
                <Button key={p} fullWidth variant={p === 100 ? 'contained' : 'outlined'} disabled={updating}
                  onClick={() => handleUpdateProgress(progressDialog.course_id, p)}
                  startIcon={p === 100 ? <EmojiEventsIcon /> : null}
                  sx={{ mb:1, justifyContent:'flex-start', textTransform:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.875rem',
                    background: p === 100 ? 'linear-gradient(135deg,#10B981,#059669)' : 'transparent',
                    borderColor: p === 100 ? 'transparent' : isHigher ? '#4F46E5' : '#E2E8F0',
                    color: p === 100 ? 'white' : isHigher ? '#4F46E5' : '#9CA3AF',
                    opacity: !isHigher && p !== 100 && p !== (progressDialog.progress||0) ? 0.5 : 1
                  }}>
                  {p === 100 ? '🏆 Complete & Get Certificate (100%)' : `${p}% Complete`}
                </Button>
              );
            })}
            {updating && <Box sx={{ textAlign:'center', mt:2 }}><CircularProgress size={24} /></Box>}
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2.5 }}>
            <Button onClick={() => setProgressDialog(null)} sx={{ textTransform:'none', borderRadius:'10px' }}>Cancel</Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={!!snackMsg} autoHideDuration={4000} onClose={() => setSnackMsg('')}
        message={snackMsg} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
      <Footer />
    </Box>
  );
}
