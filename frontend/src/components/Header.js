import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Button, Box, Drawer, List,
  ListItem, ListItemIcon, ListItemText, Avatar, Divider,
  Typography, Chip, Collapse, Badge
} from '@mui/material';
import MenuIcon           from '@mui/icons-material/Menu';
import CloseIcon          from '@mui/icons-material/Close';
import ExpandMoreIcon     from '@mui/icons-material/ExpandMore';
import DashboardIcon      from '@mui/icons-material/Dashboard';
import UploadFileIcon     from '@mui/icons-material/UploadFile';
import AnalyticsIcon      from '@mui/icons-material/Analytics';
import TrendingUpIcon     from '@mui/icons-material/TrendingUp';
import WarningIcon        from '@mui/icons-material/Warning';
import EmojiEventsIcon    from '@mui/icons-material/EmojiEvents';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import StyleIcon          from '@mui/icons-material/Style';
import AnnouncementIcon   from '@mui/icons-material/Announcement';
import StarIcon           from '@mui/icons-material/Star';
import AutoAwesomeIcon   from '@mui/icons-material/AutoAwesome';
import CodeIcon from '@mui/icons-material/Code';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PlayCircleIcon     from '@mui/icons-material/PlayCircle';
import MenuBookIcon       from '@mui/icons-material/MenuBook';
import GroupIcon          from '@mui/icons-material/Group';
import QuizIcon           from '@mui/icons-material/Quiz';
import WorkIcon           from '@mui/icons-material/Work';
import DescriptionIcon    from '@mui/icons-material/Description';
import PeopleIcon         from '@mui/icons-material/People';
import EventIcon          from '@mui/icons-material/Event';
import CheckBoxIcon       from '@mui/icons-material/CheckBox';
import NotificationsIcon  from '@mui/icons-material/Notifications';
import PersonIcon         from '@mui/icons-material/Person';
import SchoolIcon         from '@mui/icons-material/School';
import SearchIcon         from '@mui/icons-material/Search';
import LogoutIcon         from '@mui/icons-material/Logout';
import SettingsIcon       from '@mui/icons-material/Settings';
import CalendarMonthIcon  from '@mui/icons-material/CalendarMonth';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import api from '../utils/api';
import GlobalSearch from './GlobalSearch';
import { useThemeMode } from '../ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const AVATAR_COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];

const NAV_GROUPS = [
  { label:'Academics', color:'#4F46E5', items:[
    { label:'Dashboard',          path:'/dashboard',         icon:<DashboardIcon   fontSize="small"/> },
    { label:'Upload Marks',       path:'/upload-marks',      icon:<UploadFileIcon  fontSize="small"/> },
    { label:'Analytics',          path:'/analytics',         icon:<AnalyticsIcon   fontSize="small"/> },
    { label:'CGPA Tracker',       path:'/cgpa-tracker',      icon:<TrendingUpIcon  fontSize="small"/> },
    { label:'Backlog Dashboard',  path:'/backlog-dashboard', icon:<WarningIcon     fontSize="small"/> },
    { label:'Rank Predictor',     path:'/rank-predictor',    icon:<EmojiEventsIcon fontSize="small"/> },
  ]},
  { label:'Learning', color:'#7C3AED', items:[
    { label:'Training Courses',   path:'/training',          icon:<PlayCircleIcon  fontSize="small"/>, badge:'FREE' },
    { label:'VTU Resources',      path:'/vtu-resources',     icon:<MenuBookIcon    fontSize="small"/> },
    { label:'Community Notes',    path:'/community-notes',   icon:<GroupIcon       fontSize="small"/> },
    { label:'Mock Test',          path:'/mock-test',         icon:<QuizIcon        fontSize="small"/> },
    { label:'Coding Platform',    path:'/coding',            icon:<CodeIcon        fontSize="small"/>, badge:'NEW' },
    { label:'Peer Forum',         path:'/forum',             icon:<QuestionAnswerIcon fontSize="small"/>, badge:'NEW' },
    { label:'Flashcards',         path:'/flashcards',        icon:<StyleIcon       fontSize="small"/> },
    { label:'AI Study Tutor',     path:'/ai-tutor',          icon:<AutoAwesomeIcon fontSize="small"/>, badge:'AI' },
    { label:'VTU News & Alerts',  path:'/vtu-news',          icon:<AnnouncementIcon fontSize="small"/> },
  ]},
  { label:'Career', color:'#059669', items:[
    { label:'Placement Drives',     path:'/placement-drives',     icon:<WorkIcon        fontSize="small"/> },
    { label:'Job Opportunities',    path:'/job-opportunities',    icon:<WorkIcon        fontSize="small"/> },
    { label:'Internship Programs',  path:'/internship-programs',  icon:<SchoolIcon      fontSize="small"/>, badge:'NEW' },
    { label:'Final Year Projects',  path:'/projects',             icon:<CodeIcon        fontSize="small"/>, badge:'NEW' },
    { label:'Resume Builder',       path:'/resume-builder',       icon:<DescriptionIcon fontSize="small"/> },
    { label:'Alumni Mentorship',    path:'/alumni-mentorship',    icon:<PeopleIcon      fontSize="small"/> },
    { label:'Internship Tracker',   path:'/internship-tracker',   icon:<WorkIcon        fontSize="small"/> },
    { label:'Interview Prep',       path:'/interview-prep',       icon:<AutoAwesomeIcon fontSize="small"/>, badge:'AI' },
    { label:'Scholarships',         path:'/scholarships',         icon:<EmojiEventsIcon fontSize="small"/>, badge:'FREE' },
    { label:'Leaderboard',          path:'/leaderboard',          icon:<LeaderboardIcon fontSize="small"/> },
    { label:'Go Premium',           path:'/premium',              icon:<StarIcon        fontSize="small"/>, badge:'⭐' },
  ]},
  { label:'Tools', color:'#0EA5E9', items:[
    { label:'Study Planner',      path:'/study-planner',     icon:<CalendarMonthIcon fontSize="small"/>, badge:'NEW' },
    { label:'Aptitude Test',      path:'/aptitude-test',     icon:<BusinessCenterIcon fontSize="small"/>, badge:'NEW' },
    { label:'Bulk Marks Upload',  path:'/bulk-upload',        icon:<UploadFileIcon  fontSize="small"/> },
    { label:'Attendance',         path:'/attendance',        icon:<CheckBoxIcon    fontSize="small"/> },
    { label:'Exam Timetable',     path:'/exam-timetable',    icon:<EventIcon       fontSize="small"/> },
    { label:'Reminders',          path:'/reminders',         icon:<NotificationsIcon fontSize="small"/> },
  ]},
];

const TOP_NAV = [
  { label:'Dashboard',  path:'/dashboard' },
  { label:'Upload Marks', path:'/upload-marks' },
  { label:'CGPA Tracker', path:'/cgpa-tracker' },
  { label:'Training',   path:'/training', badge:'FREE' },
  { label:'Placements', path:'/placement-drives' },
  { label:'Resume',     path:'/resume-builder' },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { mode, toggleMode } = useThemeMode();
  const [openGroup,   setOpenGroup]   = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userInfo,    setUserInfo]    = useState({ initials:'U', avatarUrl:null, username:'', color:AVATAR_COLORS[0] });

  // Ctrl+K opens global search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load profile on mount only; reload notifications on every nav
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/users/profile').then(r => {
      const d = r.data;
      const name = d.full_name || d.username || 'U';
      const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
      const color = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];
      // Handle Cloudinary URLs, base64 data URLs, and old relative /uploads/ paths
      const BACKEND = (process.env.REACT_APP_API_URL || '').replace('/api', '');
      const raw = d.profile_avatar || null;
      const avatarUrl = raw
        ? (raw.startsWith('http') || raw.startsWith('data:') ? raw : BACKEND + raw)
        : null;
      setUserInfo({ initials, avatarUrl, username: d.username || '', color });
    }).catch(() => {});

  }, []); // run once on mount

  // Refresh notification count on every page navigation
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/users/notifications')
      .then(r => setUnreadCount((r.data || []).filter(n => !n.is_read).length))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };
  const isActive    = path  => location.pathname === path;
  const toggleGroup = label => setOpenGroup(g => g === label ? null : label);

  const AvatarEl = (
    <Avatar
      src={userInfo.avatarUrl || undefined}
      sx={{ width:32, height:32, bgcolor:userInfo.color, fontSize:'0.82rem', fontWeight:800 }}
    >
      {!userInfo.avatarUrl && userInfo.initials}
    </Avatar>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0}
        sx={{ background:'linear-gradient(145deg,#0A0818 0%,#1E1B4B 40%,#16103F 100%)', borderBottom:'1px solid rgba(99,102,241,0.15)', boxShadow:'0 4px 24px rgba(0,0,0,0.3)' }}>
        <Toolbar sx={{ justifyContent:'space-between', px:{ xs:2, md:3 }, minHeight:'62px' }}>

          {/* Logo */}
          <Box onClick={() => navigate('/dashboard')} sx={{ display:'flex', alignItems:'center', gap:1.5, cursor:'pointer', flexShrink:0 }}>
            <Box sx={{ width:34, height:34, borderRadius:'9px', background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <SchoolIcon sx={{ color:'white', fontSize:20 }} />
            </Box>
            <Typography sx={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'1rem', color:'white', letterSpacing:'-0.3px', display:{ xs:'none', sm:'block' } }}>
              Campus Connect
            </Typography>
          </Box>

          {/* Desktop top nav */}
          <Box sx={{ display:{ xs:'none', xl:'flex' }, gap:0.25, alignItems:'center' }}>
            {TOP_NAV.map(item => (
              <Box key={item.path}>
                <Button onClick={() => navigate(item.path)} sx={{ color: isActive(item.path) ? '#FDE68A':'rgba(255,255,255,0.82)', textTransform:'none', fontSize:'0.82rem', fontWeight: isActive(item.path)?700:500, px:1.2, py:0.7, borderRadius:'7px', bgcolor: isActive(item.path)?'rgba(255,255,255,0.14)':'transparent', '&:hover':{ bgcolor:'rgba(255,255,255,0.1)', color:'white' }, minWidth:0 }}>
                  {item.label}
                  {item.badge && <Chip label={item.badge} size="small" sx={{ ml:0.5, height:15, fontSize:'0.55rem', bgcolor:'#F59E0B', color:'white', fontWeight:700 }} />}
                </Button>
              </Box>
            ))}
          </Box>

          {/* Right actions */}
          <Box sx={{ display:'flex', alignItems:'center', gap:0.75 }}>
            {/* Notification bell */}
            <IconButton onClick={() => navigate('/notifications')} sx={{ color:'rgba(255,255,255,0.8)', display:{ xs:'none', md:'flex' } }}>
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={9}
                sx={{ '& .MuiBadge-badge':{ fontSize:'0.6rem', height:16, minWidth:16 } }}>
                <NotificationsIcon sx={{ fontSize:22 }} />
              </Badge>
            </IconButton>

            {/* Dark mode toggle */}
            <IconButton onClick={toggleMode} sx={{ color:'rgba(255,255,255,0.7)', display:{ xs:'none', md:'flex' } }} title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {mode === 'dark' ? <LightModeIcon sx={{ fontSize:20 }} /> : <DarkModeIcon sx={{ fontSize:20 }} />}
            </IconButton>

            {/* Search button */}
            <IconButton onClick={() => setSearchOpen(true)} sx={{ color:'rgba(255,255,255,0.6)', display:{ xs:'none', md:'flex' } }} title="Search (Ctrl+K)">
              <SearchIcon sx={{ fontSize:20 }} />
            </IconButton>

            {/* Real profile avatar */}
            <IconButton onClick={() => navigate('/profile')} sx={{ display:{ xs:'none', md:'flex' }, p:0.5 }}>
              {AvatarEl}
            </IconButton>

            {/* Settings */}
            <IconButton onClick={() => navigate('/settings')} sx={{ color:'rgba(255,255,255,0.6)', display:{ xs:'none', md:'flex' } }}>
              <SettingsIcon sx={{ fontSize:19 }} />
            </IconButton>

            <Button onClick={handleLogout} size="small"
              sx={{ color:'rgba(255,255,255,0.8)', textTransform:'none', fontSize:'0.82rem', display:{ xs:'none', md:'flex' }, border:'1px solid rgba(255,255,255,0.2)', borderRadius:'7px', px:1.5, '&:hover':{ bgcolor:'rgba(255,255,255,0.1)' } }}>
              Logout
            </Button>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color:'white', display:{ xs:'flex', xl:'none' } }}>
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={9}>
                <MenuIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
        PaperProps={{ sx:{ width:{ xs:'85vw', sm:300 }, maxWidth:320, display:'flex', flexDirection:'column' } }}>
        <Box sx={{ background:'linear-gradient(135deg,#1E1B4B,#4F46E5)', p:2, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
            {AvatarEl}
            <Box>
              <Typography fontWeight={700} color="white" fontSize="0.9rem">{userInfo.username}</Typography>
              <Typography color="rgba(255,255,255,0.6)" fontSize="0.72rem">Student</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color:'white' }}><CloseIcon /></IconButton>
        </Box>

        <Box sx={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {NAV_GROUPS.map(group => (
            <Box key={group.label}>
              <ListItem button onClick={() => toggleGroup(group.label)} sx={{ bgcolor: openGroup===group.label ? `${group.color}12`:'white', py:1.5 }}>
                <ListItemText primary={group.label} primaryTypographyProps={{ fontWeight:700, color:group.color, fontSize:'0.875rem' }} />
                <ExpandMoreIcon sx={{ color:group.color, fontSize:18, transform: openGroup===group.label?'rotate(180deg)':'none', transition:'0.2s' }} />
              </ListItem>
              <Collapse in={openGroup===group.label}>
                <List disablePadding sx={{ bgcolor:'#FAFAFA' }}>
                  {group.items.map(item => (
                    <ListItem button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} sx={{ pl:3, py:1, bgcolor: isActive(item.path)?`${group.color}12`:'transparent' }}>
                      <ListItemIcon sx={{ color: isActive(item.path)?group.color:'#64748B', minWidth:32 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize:'0.85rem', fontWeight: isActive(item.path)?600:400 }} />
                      {item.badge && <Chip label={item.badge} size="small" sx={{ height:16, fontSize:'0.55rem', bgcolor:group.color, color:'white', fontWeight:700 }} />}
                    </ListItem>
                  ))}
                </List>
              </Collapse>
              <Divider />
            </Box>
          ))}
        </Box>

        <Box sx={{ p:2, borderTop:'1px solid #E2E8F0', flexShrink:0 }}>
          <Button fullWidth variant="outlined" onClick={toggleMode}
            startIcon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            sx={{ textTransform:'none', borderRadius:'10px', mb:1, justifyContent:'flex-start', color:'#374151', borderColor:'#E2E8F0' }}>
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button fullWidth variant="outlined" onClick={() => { navigate('/notifications'); setMobileOpen(false); }}
            startIcon={<Badge badgeContent={unreadCount||null} color="error"><NotificationsIcon /></Badge>}
            sx={{ textTransform:'none', borderRadius:2, mb:1, justifyContent:'flex-start', color:'#374151', borderColor:'#E2E8F0' }}>
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          <Button fullWidth variant="outlined" onClick={() => { navigate('/profile'); setMobileOpen(false); }} startIcon={<PersonIcon />} sx={{ textTransform:'none', borderRadius:2, mb:1, justifyContent:'flex-start', color:'#374151', borderColor:'#E2E8F0' }}>Profile</Button>
          <Button fullWidth variant="outlined" onClick={() => { navigate('/settings'); setMobileOpen(false); }} startIcon={<SettingsIcon />} sx={{ textTransform:'none', borderRadius:2, mb:1, justifyContent:'flex-start', color:'#374151', borderColor:'#E2E8F0' }}>Settings</Button>
          <Button fullWidth variant="contained" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ textTransform:'none', borderRadius:2, bgcolor:'#EF4444', '&:hover':{ bgcolor:'#DC2626' }, justifyContent:'flex-start' }}>Logout</Button>
        </Box>
      </Drawer>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
