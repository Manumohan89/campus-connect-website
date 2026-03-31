import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, TextField, InputAdornment, Paper, Typography, CircularProgress,
  Divider, Chip, Modal
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ICON = {
  course:     <PlayCircleIcon sx={{ fontSize:18, color:'#7C3AED' }} />,
  resource:   <MenuBookIcon   sx={{ fontSize:18, color:'#0EA5E9' }} />,
  placement:  <WorkIcon       sx={{ fontSize:18, color:'#059669' }} />,
  alumni:     <PeopleIcon     sx={{ fontSize:18, color:'#F59E0B' }} />,
  page:       <BarChartIcon   sx={{ fontSize:18, color:'#4F46E5' }} />,
};

const STATIC_PAGES = [
  { title:'Dashboard',        path:'/dashboard',        type:'page', desc:'Your academic overview' },
  { title:'Upload Marks',     path:'/upload-marks',     type:'page', desc:'Calculate SGPA from PDF' },
  { title:'CGPA Tracker',     path:'/cgpa-tracker',     type:'page', desc:'Semester-wise CGPA trend' },
  { title:'Analytics',        path:'/analytics',        type:'page', desc:'Subject-wise performance charts' },
  { title:'Backlog Dashboard',path:'/backlog-dashboard', type:'page', desc:'Manage failed subjects' },
  { title:'Training Courses', path:'/training',         type:'page', desc:'Free VTU courses' },
  { title:'VTU Resources',    path:'/vtu-resources',    type:'page', desc:'Notes & question papers' },
  { title:'Placement Drives', path:'/placement-drives', type:'page', desc:'Campus & off-campus drives' },
  { title:'Resume Builder',   path:'/resume-builder',   type:'page', desc:'ATS-friendly resume' },
  { title:'Mock Test',        path:'/mock-test',        type:'page', desc:'Subject-wise practice tests' },
  { title:'Aptitude Test',    path:'/aptitude-test',    type:'page', desc:'Placement aptitude practice' },
  { title:'Alumni Mentorship',path:'/alumni-mentorship',type:'page', desc:'Connect with working alumni' },
  { title:'Study Planner',    path:'/study-planner',    type:'page', desc:'Weekly study schedule' },
  { title:'Attendance',       path:'/attendance',       type:'page', desc:'Track subject attendance' },
  { title:'SGPA Calculator',  path:'/sgpa-calculator',  type:'page', desc:'Free public SGPA tool' },
  { title:'VTU Result Checker',path:'/vtu-result',      type:'page', desc:'Check VTU exam results' },
  { title:'Profile',          path:'/profile',          type:'page', desc:'View & edit your profile' },
  { title:'Settings',         path:'/settings',         type:'page', desc:'Password & account settings' },
];

function useDebounce(val, ms) {
  const [dv, setDv] = useState(val);
  useEffect(() => { const t = setTimeout(() => setDv(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return dv;
}

export default function GlobalSearch({ onClose }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQ = useDebounce(query, 220);

  // Focus on mount
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }

    // Static page matches (instant)
    const pageHits = STATIC_PAGES.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.desc.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 4);

    setResults(pageHits);
    setSelected(0);
    setLoading(true);

    // Live API search
    try {
      const [coursesRes, resourcesRes, placementsRes, alumniRes] = await Promise.allSettled([
        api.get('/training/courses', { params: { search: q } }),
        api.get('/resources/list',   { params: { search: q } }),
        api.get('/features/placements', { params: { search: q } }),
        api.get('/features/alumni',  { params: { search: q } }),
      ]);

      const courses   = (coursesRes.value?.data || []).slice(0, 3).map(c => ({ title:c.title,        path:`/training`,          type:'course',    desc:c.description?.slice(0,60) + '...' }));
      const resources = (resourcesRes.value?.data || []).slice(0, 3).map(r => ({ title:r.title,       path:`/vtu-resources`,     type:'resource',  desc:`${r.subject_code || ''} · ${r.resource_type}` }));
      const placements= (placementsRes.value?.data || []).slice(0, 2).map(d => ({ title:d.company_name, path:`/placement-drives`,  type:'placement', desc:`${d.role} · ${d.drive_type}` }));
      const alumni    = (alumniRes.value?.data || []).slice(0, 2).map(a => ({ title:a.full_name,       path:`/alumni-mentorship`, type:'alumni',    desc:`${a.current_role} at ${a.current_company}` }));

      setResults([...pageHits, ...courses, ...resources, ...placements, ...alumni]);
    } catch {
      // Keep static results
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search(debouncedQ); }, [debouncedQ, search]);

  const goTo = (path) => { navigate(path); onClose(); };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s+1, results.length-1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s-1, 0)); }
      if (e.key === 'Enter' && results[selected]) goTo(results[selected].path);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [results, selected, onClose]);

  return (
    <Modal open onClose={onClose} sx={{ display:'flex', alignItems:'flex-start', justifyContent:'center', pt:{ xs:4, md:10 }, px:2 }}>
      <Paper elevation={24} sx={{ width:'100%', maxWidth:600, borderRadius:'20px', overflow:'hidden', outline:'none' }}>
        <TextField
          inputRef={inputRef}
          fullWidth value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search pages, courses, resources, placements..."
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color:'#9CA3AF' }}/></InputAdornment>,
            endAdornment: loading ? <InputAdornment position="end"><CircularProgress size={18} /></InputAdornment> : null,
            disableUnderline: true,
            sx: { fontSize:'1rem', px:2, py:1.5 },
          }}
          variant="standard"
          sx={{ '& .MuiInput-root':{ px:2, py:1.5, '&:before':{ display:'none' }, '&:after':{ display:'none' } } }}
        />

        {results.length > 0 && (
          <>
            <Divider />
            <Box sx={{ maxHeight:400, overflowY:'auto' }}>
              {/* Group by type */}
              {['page','course','resource','placement','alumni'].map(type => {
                const group = results.filter(r => r.type === type);
                if (!group.length) return null;
                const typeLabel = { page:'Pages', course:'Courses', resource:'Resources', placement:'Placement Drives', alumni:'Alumni' }[type];
                return (
                  <Box key={type}>
                    <Typography sx={{ px:2.5, py:1, fontSize:'0.7rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em', bgcolor:'#F9FAFB' }}>{typeLabel}</Typography>
                    {group.map((r, ri) => {
                      const globalIdx = results.indexOf(r);
                      return (
                        <Box key={ri} onClick={() => goTo(r.path)}
                          sx={{ px:2.5, py:1.5, display:'flex', alignItems:'center', gap:2, cursor:'pointer', bgcolor: globalIdx===selected ? '#EEF2FF':'white', '&:hover':{ bgcolor:'#F8F9FF' }, transition:'background 0.1s' }}>
                          <Box sx={{ width:32, height:32, borderRadius:'8px', bgcolor:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {ICON[type]}
                          </Box>
                          <Box sx={{ flex:1, minWidth:0 }}>
                            <Typography fontWeight={700} fontSize="0.875rem" noWrap>{r.title}</Typography>
                            {r.desc && <Typography variant="caption" color="text.secondary" noWrap>{r.desc}</Typography>}
                          </Box>
                          {globalIdx === selected && <KeyboardReturnIcon sx={{ fontSize:16, color:'#9CA3AF', flexShrink:0 }} />}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {query && !loading && results.length === 0 && (
          <Box sx={{ p:4, textAlign:'center', color:'#9CA3AF' }}>
            <SearchIcon sx={{ fontSize:32, mb:1, opacity:0.4 }} />
            <Typography fontSize="0.875rem">No results for "{query}"</Typography>
          </Box>
        )}

        {!query && (
          <Box sx={{ px:3, py:2.5 }}>
            <Typography fontSize="0.75rem" fontWeight={700} color="#9CA3AF" mb={1} sx={{ textTransform:'uppercase', letterSpacing:'0.08em' }}>Quick navigation</Typography>
            <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.75, mt:1 }}>
              {STATIC_PAGES.slice(0,8).map(p => (
                <Chip key={p.path} label={p.title} size="small" onClick={() => goTo(p.path)} clickable
                  sx={{ fontWeight:600, fontSize:'0.75rem', bgcolor:'#F1F5F9', '&:hover':{ bgcolor:'#EEF2FF', color:'#4F46E5' } }} />
              ))}
            </Box>
            <Typography variant="caption" color="#CBD5E1" sx={{ display:'block', mt:2, textAlign:'center' }}>↑↓ navigate · Enter to open · Esc to close</Typography>
          </Box>
        )}
      </Paper>
    </Modal>
  );
}
