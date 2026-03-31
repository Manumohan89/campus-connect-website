import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Box, Card, Typography, Skeleton, Grid, Alert, Stack,
  Chip, Button, Avatar, Divider, CircularProgress, IconButton,
  Tooltip, Snackbar, LinearProgress, Tab, Tabs, Paper
} from '@mui/material';
import {
  Edit, School, TrendingUp, BarChart, CameraAlt, Delete,
  WorkspacePremium, EmojiEvents, CheckCircle, Assignment,
  People, CalendarMonth, Notifications, Warning
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];

function StatBox({ label, value, color, bg, icon }) {
  return (
    <Box sx={{ textAlign:'center', p:2, borderRadius:'16px', bgcolor: bg || '#F8FAFC', border:`1.5px solid ${color}22`, flex:1 }}>
      <Box sx={{ fontSize:'1.4rem', mb:0.5 }}>{icon}</Box>
      <Typography sx={{ fontSize:'1.6rem', fontWeight:900, color, fontFamily:"'DM Mono',monospace", lineHeight:1 }}>{value}</Typography>
      <Typography sx={{ fontSize:'0.65rem', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.06em', mt:0.25 }}>{label}</Typography>
    </Box>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <Box sx={{ py:1.75, display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #F3F4F6' }}>
      <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</Typography>
      <Typography sx={{ fontSize:'0.875rem', fontWeight:600, color: color || '#111827', maxWidth:'60%', textAlign:'right' }}>{value || '—'}</Typography>
    </Box>
  );
}

const gradeFromCgpa = (cgpa) => {
  const v = parseFloat(cgpa || 0);
  if (v >= 9) return { label:'Distinction', color:'#059669', bg:'#D1FAE5' };
  if (v >= 8) return { label:'First Class with Distinction', color:'#4F46E5', bg:'#EEF2FF' };
  if (v >= 7) return { label:'First Class', color:'#7C3AED', bg:'#EDE9FE' };
  if (v >= 6) return { label:'Second Class', color:'#D97706', bg:'#FEF3C7' };
  if (v >= 5) return { label:'Pass Class', color:'#D97706', bg:'#FEF9C3' };
  return { label:'Below Pass', color:'#DC2626', bg:'#FEE2E2' };
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [marks, setMarks] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');
  const [tab, setTab] = useState(0);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    Promise.all([
      api.get('/users/profile'),
      api.get('/users/marks').catch(() => ({ data: [] })),
      api.get('/training/my-certificates').catch(() => ({ data: [] })),
    ]).then(([p, m, c]) => {
      setProfile(p.data);
      setMarks(m.data || []);
      setCerts(c.data || []);
    }).catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePhotoChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setSnack('Please select an image file.'); return; }
    if (f.size > 5 * 1024 * 1024) { setSnack('Image must be under 5MB.'); return; }
    setPhotoLoading(true);
    const fd = new FormData();
    fd.append('photo', f);
    try {
      const res = await api.post('/users/profile-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSnack('Profile photo updated! ✅');
      setProfile(p => ({ ...p, profile_avatar: res.data.photo_url }));
    } catch (err) {
      setSnack(err.response?.data?.error || 'Failed to upload photo.');
    } finally {
      setPhotoLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await api.delete('/users/profile-photo');
      setProfile(p => ({ ...p, profile_avatar: null }));
      setSnack('Profile photo removed.');
    } catch { setSnack('Failed to remove photo.'); }
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : profile?.username?.[0]?.toUpperCase() || 'U';
  const bgColor = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];
  const cgpaNum = parseFloat(profile?.cgpa || 0);
  const grade = gradeFromCgpa(cgpaNum);
  const hasPhoto = !!(profile?.profile_avatar);
  const photoSrc = hasPhoto ? (profile.profile_avatar.startsWith('http') ? profile.profile_avatar : profile.profile_avatar) : null;
  const failedSubjects = marks.filter(m => m.total < 40);
  const passedSubjects = marks.filter(m => m.total >= 40);
  const cgpaPct = Math.min((cgpaNum / 10) * 100, 100);

  if (loading) return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />
      <Container sx={{ py:4, flex:1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={520} sx={{ borderRadius:'20px' }} /></Grid>
          <Grid item xs={12} md={8}><Skeleton variant="rectangular" height={520} sx={{ borderRadius:'20px' }} /></Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      <Header />

      {/* Hero banner */}
      <Box sx={{ background:'linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#4F46E5 100%)', pt:5, pb:8, px:2, position:'relative', overflow:'hidden' }}>
        <Box sx={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)' }} />
        <Box sx={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', bgcolor:'rgba(124,58,237,0.15)' }} />
        <Container sx={{ position:'relative' }}>
          <Box sx={{ display:'flex', gap:3, alignItems:'flex-end', flexWrap:'wrap' }}>
            {/* Avatar */}
            <Box sx={{ position:'relative', flexShrink:0 }}>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              <Avatar
                src={photoSrc || undefined}
                sx={{ width:110, height:110, bgcolor:bgColor, fontSize:'2.5rem', fontWeight:900,
                  border:'4px solid rgba(255,255,255,0.2)', boxShadow:`0 12px 40px ${bgColor}66` }}
              >
                {!hasPhoto && initials}
              </Avatar>
              <Tooltip title={hasPhoto ? 'Change photo' : 'Add photo'}>
                <IconButton onClick={() => fileRef.current?.click()} disabled={photoLoading}
                  sx={{ position:'absolute', bottom:0, right:0, width:32, height:32, bgcolor:'white', border:`2px solid ${bgColor}`,
                    '&:hover':{ bgcolor:'#EEF2FF' } }}>
                  {photoLoading ? <CircularProgress size={14} sx={{ color:bgColor }} /> : <CameraAlt sx={{ fontSize:14, color:bgColor }} />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Name + info */}
            <Box sx={{ flex:1, minWidth:200 }}>
              <Typography sx={{ fontSize:{ xs:'1.75rem', md:'2.25rem' }, fontWeight:900, color:'white', fontFamily:"'Space Grotesk',sans-serif", lineHeight:1.1 }}>
                {profile?.full_name || profile?.username || 'Student'}
              </Typography>
              <Box sx={{ display:'flex', gap:1.5, mt:1, flexWrap:'wrap', alignItems:'center' }}>
                {profile?.branch && <Chip label={profile.branch} size="small" sx={{ bgcolor:'rgba(255,255,255,0.15)', color:'white', fontWeight:700, backdropFilter:'blur(10px)' }} />}
                {profile?.semester && <Chip label={`Semester ${profile.semester}`} size="small" sx={{ bgcolor:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.85)', fontWeight:600 }} />}
                {profile?.year_scheme && <Chip label={`${profile.year_scheme} Scheme`} size="small" sx={{ bgcolor:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.85)', fontWeight:600 }} />}
              </Box>
              {profile?.college && (
                <Typography sx={{ color:'rgba(255,255,255,0.65)', fontSize:'0.875rem', mt:1, display:'flex', alignItems:'center', gap:0.75 }}>
                  <School sx={{ fontSize:16 }} />{profile.college}
                </Typography>
              )}
            </Box>

            {/* CGPA pill */}
            {cgpaNum > 0 && (
              <Box sx={{ textAlign:'center', bgcolor:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)', borderRadius:'16px', px:3, py:2, border:'1px solid rgba(255,255,255,0.15)', flexShrink:0 }}>
                <Typography sx={{ fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Overall CGPA</Typography>
                <Typography sx={{ fontSize:'2.5rem', fontWeight:900, color:'white', fontFamily:"'DM Mono',monospace", lineHeight:1.1 }}>{cgpaNum.toFixed(2)}</Typography>
                <Chip label={grade.label} size="small" sx={{ bgcolor:grade.color, color:'white', fontWeight:700, fontSize:'0.65rem', mt:0.5 }} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Stats bar — floats over banner */}
      <Container sx={{ mt:-3, mb:3, position:'relative', zIndex:1 }}>
        <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'16px', p:2.5, bgcolor:'white' }}>
          <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
            <StatBox icon="📚" label="Subjects" value={marks.length || '—'} color="#4F46E5" bg="#EEF2FF" />
            <StatBox icon="⚠️" label="Backlogs" value={failedSubjects.length} color={failedSubjects.length ? '#DC2626' : '#059669'} bg={failedSubjects.length ? '#FEE2E2' : '#D1FAE5'} />
            <StatBox icon="🏆" label="Certificates" value={certs.length} color="#7C3AED" bg="#EDE9FE" />
            <StatBox icon="✅" label="Cleared" value={passedSubjects.length} color="#059669" bg="#D1FAE5" />
          </Stack>
        </Card>
      </Container>

      <Container sx={{ pb:5 }}>
        {error && <Alert severity="error" sx={{ mb:3, borderRadius:'12px' }}>{error}</Alert>}
        {failedSubjects.length > 0 && (
          <Alert severity="warning" sx={{ mb:3, borderRadius:'12px' }} icon={<Warning />}>
            <strong>{failedSubjects.length} backlog(s):</strong> {failedSubjects.map(s => s.subject_code).join(', ')} —{' '}
            <span onClick={() => navigate('/training')} style={{ cursor:'pointer', fontWeight:700, textDecoration:'underline' }}>Free clearing courses →</span>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left: Photo actions + Academic info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              {/* Academic info card */}
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'20px', p:3 }}>
                <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" mb={2}>Academic Info</Typography>
                <InfoRow label="Full Name" value={profile?.full_name} />
                <InfoRow label="Username" value={profile?.username} />
                <InfoRow label="Branch" value={profile?.branch} />
                <InfoRow label="Semester" value={profile?.semester ? `Semester ${profile.semester}` : null} />
                <InfoRow label="Year Scheme" value={profile?.year_scheme} />
                <InfoRow label="College" value={profile?.college} />
                <InfoRow label="CGPA" value={cgpaNum > 0 ? `${cgpaNum.toFixed(2)} / 10` : null} color={grade.color} />
                <InfoRow label="Latest SGPA" value={profile?.sgpa ? `${parseFloat(profile.sgpa).toFixed(2)} / 10` : null} />
                <InfoRow label="Grade" value={cgpaNum > 0 ? grade.label : null} color={grade.color} />

                {/* CGPA progress bar */}
                {cgpaNum > 0 && (
                  <Box sx={{ mt:2.5 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.75 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">CGPA Progress</Typography>
                      <Typography variant="caption" fontWeight={800} color={grade.color}>{cgpaNum.toFixed(2)}/10.0</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={cgpaPct}
                      sx={{ height:8, borderRadius:99, bgcolor:`${grade.color}22`, '& .MuiLinearProgress-bar':{ bgcolor:grade.color, borderRadius:99 } }} />
                    <Box sx={{ display:'flex', justifyContent:'space-between', mt:0.5 }}>
                      <Typography variant="caption" color="text.secondary">0</Typography>
                      <Typography variant="caption" color="text.secondary">10</Typography>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my:2.5 }} />

                {/* Photo actions */}
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform:'uppercase', letterSpacing:'0.08em', display:'block', mb:1.5 }}>Profile Photo</Typography>
                <Box sx={{ display:'flex', gap:1 }}>
                  <Button fullWidth size="small" variant="outlined" startIcon={<CameraAlt />}
                    onClick={() => fileRef.current?.click()} disabled={photoLoading}
                    sx={{ textTransform:'none', borderRadius:'10px', borderColor:'#4F46E5', color:'#4F46E5', fontWeight:600, fontSize:'0.78rem' }}>
                    {hasPhoto ? 'Change' : 'Add Photo'}
                  </Button>
                  {hasPhoto && (
                    <Tooltip title="Remove photo">
                      <IconButton size="small" onClick={handleRemovePhoto}
                        sx={{ color:'#EF4444', border:'1px solid #FEE2E2', borderRadius:'10px', px:1.5 }}>
                        <Delete sx={{ fontSize:16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display:'block', textAlign:'center', mt:0.75 }}>
                  JPG, PNG · max 5MB
                </Typography>
              </Card>

              {/* Quick actions */}
              <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'20px', p:3 }}>
                <Typography fontWeight={800} fontFamily="'Space Grotesk',sans-serif" mb={2}>Quick Actions</Typography>
                <Stack spacing={1.25}>
                  {[
                    { icon:<Edit />, label:'Edit Profile', path:'/update-profile', color:'#4F46E5', bg:'#EEF2FF' },
                    { icon:<TrendingUp />, label:'CGPA Tracker', path:'/cgpa-tracker', color:'#7C3AED', bg:'#EDE9FE' },
                    { icon:<BarChart />, label:'Analytics', path:'/analytics', color:'#0EA5E9', bg:'#EFF6FF' },
                    { icon:<Assignment />, label:'Upload Marks', path:'/upload-marks', color:'#10B981', bg:'#F0FDF4' },
                    { icon:<CalendarMonth />, label:'Study Planner', path:'/study-planner', color:'#F59E0B', bg:'#FFFBEB' },
                    { icon:<Notifications />, label:'Notifications', path:'/notifications', color:'#EF4444', bg:'#FEF2F2' },
                  ].map((a, i) => (
                    <Box key={i} onClick={() => navigate(a.path)}
                      sx={{ display:'flex', alignItems:'center', gap:1.5, p:1.5, bgcolor:a.bg, borderRadius:'12px', cursor:'pointer', transition:'all 0.15s', '&:hover':{ transform:'translateX(4px)', boxShadow:`2px 0 0 ${a.color} inset` } }}>
                      {React.cloneElement(a.icon, { sx:{ fontSize:18, color:a.color } })}
                      <Typography fontWeight={700} fontSize="0.85rem" color={a.color}>{a.label}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid>

          {/* Right: Tabs - Marks / Certificates */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border:'1px solid #E5E7EB', borderRadius:'20px', overflow:'hidden' }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{ px:3, pt:2, borderBottom:'1px solid #F3F4F6', '& .Mui-selected':{ color:'#4F46E5', fontWeight:700 }, '& .MuiTabs-indicator':{ bgcolor:'#4F46E5' }, '& .MuiTab-root':{ textTransform:'none', fontWeight:600 } }}>
                <Tab label={`📊 Subjects (${marks.length})`} />
                <Tab label={`🏆 Certificates (${certs.length})`} />
                <Tab label="🎯 Progress" />
              </Tabs>

              {/* Tab 0: Marks table */}
              {tab === 0 && (
                <Box>
                  {marks.length === 0 ? (
                    <Box sx={{ p:6, textAlign:'center' }}>
                      <Typography fontSize="3rem" mb={1}>📤</Typography>
                      <Typography fontWeight={700} color="#374151">No marks uploaded yet</Typography>
                      <Typography color="text.secondary" fontSize="0.875rem" mb={3}>Upload your VTU marks card PDF to see subject-wise data</Typography>
                      <Button variant="contained" onClick={() => navigate('/upload-marks')}
                        sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', textTransform:'none', borderRadius:'10px', fontWeight:700, boxShadow:'none' }}>
                        Upload Marks Card
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                        <thead>
                          <tr style={{ background:'#F9FAFB', borderBottom:'2px solid #E5E7EB' }}>
                            {['Code','Subject','Internal','External','Total','Credits','GP','Grade'].map(h => (
                              <th key={h} style={{ padding:'12px 16px', textAlign: h==='Code'||h==='Subject'?'left':'center', fontWeight:700, color:'#6B7280', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...marks].sort((a,b) => (a.subject_code||'').localeCompare(b.subject_code||'')).map((m, i) => {
                            const failed = m.total < 40;
                            const gpColor = m.grade_points >= 9 ? '#059669' : m.grade_points >= 7 ? '#4F46E5' : m.grade_points >= 5 ? '#D97706' : '#DC2626';
                            return (
                              <tr key={i} style={{ borderBottom:'1px solid #F3F4F6', background: failed ? '#FFF5F5' : i%2===0 ? 'white' : '#FAFAFA' }}>
                                <td style={{ padding:'12px 16px', fontWeight:700, color:'#4F46E5', fontFamily:'monospace' }}>{m.subject_code}</td>
                                <td style={{ padding:'12px 16px', color:'#374151', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.subject_name || m.subject_code}</td>
                                <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:600 }}>{m.internal_marks}</td>
                                <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:600 }}>{m.external_marks}</td>
                                <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:800, color: failed?'#DC2626':'#111827' }}>{m.total}</td>
                                <td style={{ padding:'12px 16px', textAlign:'center' }}>{m.credits}</td>
                                <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:800, color:gpColor }}>{m.grade_points}</td>
                                <td style={{ padding:'12px 16px', textAlign:'center' }}>
                                  <Box component="span" sx={{ bgcolor: failed?'#FEE2E2':m.grade_points>=9?'#D1FAE5':m.grade_points>=7?'#EEF2FF':'#FEF9C3', color: failed?'#991B1B':m.grade_points>=9?'#065F46':m.grade_points>=7?'#1E40AF':'#92400E', fontWeight:800, px:1, py:0.25, borderRadius:'6px', fontSize:'0.75rem' }}>
                                    {m.total>=90?'S':m.total>=80?'A':m.total>=70?'B':m.total>=60?'C':m.total>=50?'D':m.total>=40?'E':'F'}
                                  </Box>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Box>
                  )}
                </Box>
              )}

              {/* Tab 1: Certificates */}
              {tab === 1 && (
                <Box sx={{ p:3 }}>
                  {certs.length === 0 ? (
                    <Box sx={{ textAlign:'center', py:5 }}>
                      <Typography fontSize="3rem" mb={1}>🏆</Typography>
                      <Typography fontWeight={700} color="#374151">No certificates yet</Typography>
                      <Typography color="text.secondary" fontSize="0.875rem" mb={3}>Complete a training course to earn verified certificates</Typography>
                      <Button variant="contained" onClick={() => navigate('/training')}
                        sx={{ background:'linear-gradient(135deg,#7C3AED,#4F46E5)', textTransform:'none', borderRadius:'10px', fontWeight:700, boxShadow:'none' }}>
                        Browse Courses
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {certs.map((cert, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <Paper elevation={0} sx={{ p:2.5, border:'1.5px solid #DDD6FE', borderRadius:'14px', bgcolor:'#F5F3FF', cursor:'pointer', transition:'all 0.2s', '&:hover':{ transform:'translateY(-2px)', boxShadow:'0 8px 24px rgba(124,58,237,0.15)' } }}
                            onClick={() => navigate(`/certificate/${cert.certificate_id}`)}>
                            <Box sx={{ display:'flex', gap:1.5, alignItems:'flex-start', mb:1.5 }}>
                              <Box sx={{ width:40, height:40, borderRadius:'10px', background:'linear-gradient(135deg,#7C3AED,#4F46E5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🏆</Box>
                              <Box sx={{ flex:1, minWidth:0 }}>
                                <Typography fontWeight={800} fontSize="0.85rem" color="#1E1B4B" sx={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cert.title}</Typography>
                                <Typography variant="caption" color="#7C3AED" fontWeight={700}>{cert.instructor}</Typography>
                              </Box>
                            </Box>
                            <Divider sx={{ mb:1.5 }} />
                            <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                              <Box>
                                <Typography variant="caption" color="#9CA3AF" display="block">Completed</Typography>
                                <Typography fontWeight={700} fontSize="0.78rem">{cert.completed_at ? new Date(cert.completed_at).toLocaleDateString('en-IN') : '—'}</Typography>
                              </Box>
                              <Box sx={{ textAlign:'right' }}>
                                <Typography variant="caption" color="#9CA3AF" display="block">ID</Typography>
                                <Typography fontWeight={700} fontSize="0.72rem" color="#4F46E5" fontFamily="monospace">{cert.certificate_id}</Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* Tab 2: Progress / Goals */}
              {tab === 2 && (
                <Box sx={{ p:3 }}>
                  {/* CGPA target */}
                  <Box sx={{ p:3, bgcolor:'#EEF2FF', borderRadius:'14px', mb:3 }}>
                    <Typography fontWeight={800} mb={0.5}>🎯 CGPA Goal Calculator</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>Based on your current CGPA, here's what you need next semester:</Typography>
                    {cgpaNum > 0 ? (
                      [8.0, 8.5, 9.0].map(target => {
                        const semsLeft = Math.max(1, 8 - parseInt(profile?.semester || 4));
                        const earnedCredits = marks.length * 3.5; // estimate
                        const neededGP = target * (earnedCredits + semsLeft * 20) - cgpaNum * earnedCredits;
                        const neededSgpa = Math.min(neededGP / (semsLeft * 20), 10);
                        const achievable = neededSgpa <= 10 && neededSgpa > 0;
                        return (
                          <Box key={target} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', py:1, borderBottom:'1px solid #C7D2FE' }}>
                            <Typography fontWeight={700} fontSize="0.875rem">Target CGPA {target}</Typography>
                            <Chip
                              label={!achievable ? 'Already achieved!' : `Need ${neededSgpa.toFixed(2)} SGPA/sem`}
                              size="small"
                              sx={{ bgcolor: !achievable||neededSgpa<=cgpaNum ? '#D1FAE5':'#EEF2FF', color: !achievable||neededSgpa<=cgpaNum?'#065F46':'#4338CA', fontWeight:700, fontSize:'0.72rem' }}
                            />
                          </Box>
                        );
                      })
                    ) : (
                      <Typography color="text.secondary" fontSize="0.875rem">Upload marks to see your goal projections</Typography>
                    )}
                    <Button size="small" onClick={() => navigate('/cgpa-tracker')} sx={{ mt:2, textTransform:'none', fontWeight:700, color:'#4F46E5' }}>
                      Open full CGPA Tracker →
                    </Button>
                  </Box>

                  {/* Performance breakdown */}
                  {marks.length > 0 && (
                    <Box>
                      <Typography fontWeight={800} mb={2}>📊 Grade Distribution</Typography>
                      {[['S (≥90)', marks.filter(m=>m.total>=90).length, '#059669'],
                        ['A (80-89)', marks.filter(m=>m.total>=80&&m.total<90).length, '#4F46E5'],
                        ['B (70-79)', marks.filter(m=>m.total>=70&&m.total<80).length, '#7C3AED'],
                        ['C (60-69)', marks.filter(m=>m.total>=60&&m.total<70).length, '#D97706'],
                        ['D/E (40-59)', marks.filter(m=>m.total>=40&&m.total<60).length, '#F59E0B'],
                        ['F (<40)', marks.filter(m=>m.total<40).length, '#DC2626'],
                      ].map(([label, count, color]) => count > 0 && (
                        <Box key={label} sx={{ mb:1.5 }}>
                          <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                            <Typography variant="caption" fontWeight={700}>{label}</Typography>
                            <Typography variant="caption" fontWeight={700} color={color}>{count} subject{count!==1?'s':''}</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={(count/marks.length)*100}
                            sx={{ height:7, borderRadius:99, bgcolor:`${color}22`, '& .MuiLinearProgress-bar':{ bgcolor:color } }} />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'center' }} />
      <Footer />
    </Box>
  );
}
