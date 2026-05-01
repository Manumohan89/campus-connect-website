import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, Grid } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import Onboarding from './Onboarding';
import DashboardSidebar from './DashboardSidebar';
import api from '../utils/api';

// ── Cinematic number counter ──────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef();
  useEffect(() => {
    cancelAnimationFrame(frame.current);
    const target = parseFloat(value) || 0;
    const start  = performance.now();
    const step = (now) => {
      const p    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(+(target * ease).toFixed(decimals));
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, duration]);
  return <>{display}</>;
}

// ── SVG CGPA Ring ─────────────────────────────────────────────────────────────
function CGPARing({ value, max = 10, color, size = 96, label, sub, animate }) {
  const R          = (size / 2) - 8;
  const circ       = 2 * Math.PI * R;
  const pct        = Math.min((parseFloat(value) || 0) / max, 1);
  const [dash, setDash] = useState(circ);

  useEffect(() => {
    if (!animate) { setDash(circ - pct * circ); return; }
    const t = setTimeout(() => setDash(circ - pct * circ), 200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, circ, animate]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={7}/>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 80 ? 20 : 15, fontWeight: 800, color: 'white', lineHeight: 1 }}>
          {animate ? <AnimatedNumber value={parseFloat(value)||0} decimals={1}/> : (parseFloat(value)||0).toFixed(1)}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{label}</span>
        {sub && <span style={{ fontSize: 9, color, fontWeight: 700, marginTop: 1 }}>{sub}</span>}
      </div>
    </div>
  );
}

// ── Activity Heatmap ──────────────────────────────────────────────────────────
function ActivityHeatmap({ color = '#4F46E5', data = [] }) {
  const weeks  = 15;
  const cells = (Array.isArray(data) ? data : []).slice(-weeks * 7).map(item => ({
    date: new Date(item.date),
    v: Number(item.count || 0),
  }));
  while (cells.length < weeks * 7) {
    cells.unshift({ date: new Date(), v: 0 });
  }

  const max = Math.max(1, ...cells.map(c => c.v));
  const level = (v) => {
    if (v <= 0) return 0;
    const r = v / max;
    if (r < 0.25) return 1;
    if (r < 0.5) return 2;
    if (r < 0.75) return 3;
    return 4;
  };
  const opacity = [0, 0.2, 0.45, 0.7, 1];
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: weeks }, (_, w) => (
        <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Array.from({ length: 7 }, (_, d) => {
            const cell = cells[w * 7 + d];
            return (
              <div key={d} style={{
                width: 11, height: 11, borderRadius: 2,
                background: cell.v === 0 ? 'rgba(255,255,255,0.07)' : color,
                opacity: cell.v === 0 ? 1 : opacity[level(cell.v)],
                transition: 'opacity .2s' }} title={`${cell.date.toDateString()}: ${cell.v} activities`}/>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ emoji, title, desc, badge, color = '#4F46E5', on, highlight, delay = 0, visible, isDark }) {
  const [hov, setHov] = useState(false);
  const bg     = highlight ? `${color}18` : isDark ? '#1E293B' : '#FFFFFF';
  const border = highlight ? `${color}55`  : isDark ? 'rgba(255,255,255,0.08)' : '#E8EDF5';

  return (
    <div onClick={on} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: bg, 
        border: `1.5px solid ${hov ? color+'88' : border}`,
        borderRadius: 18, 
        padding: '20px 18px', 
        cursor: 'pointer', 
        height: '100%',
        position: 'relative', 
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? (hov ? 'translateY(-6px) scale(1.01)' : 'translateY(0)') : 'translateY(22px)',
        transition: `opacity .5s ease ${delay}ms, transform .28s ease, box-shadow .25s, border-color .22s`,
        boxShadow: hov 
          ? isDark 
            ? `0 20px 48px ${color}32, inset 0 1px 0 rgba(255,255,255,0.1)` 
            : `0 20px 48px ${color}28`
          : isDark
            ? '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 2px 8px rgba(0,0,0,0.06)',
        backdropFilter: isDark ? 'blur(8px)' : 'none',
      }}>
      {/* Cinematic top accent bar */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 3, 
        background: `linear-gradient(90deg,${color},${color}44,transparent)`, 
        opacity: highlight || hov ? 1 : 0.4, 
        transition: 'opacity .22s',
        boxShadow: `0 0 12px ${color}40`
      }}/>
      
      {/* Mouse beam effect */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        borderRadius: 18, 
        background: `radial-gradient(180px at 50% 50%, ${color}0a, transparent 70%)`, 
        opacity: hov ? 1 : 0, 
        transition: 'opacity .3s', 
        pointerEvents: 'none' 
      }}/>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ 
          width: 46, 
          height: 46, 
          borderRadius: 13, 
          background: `${color}18`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '1.4rem', 
          transition: 'transform .25s, filter .25s',
          transform: hov ? 'scale(1.12) rotate(-6deg)' : 'scale(1)',
          filter: hov ? `drop-shadow(0 4px 12px ${color}40)` : 'drop-shadow(none)',
          backdropFilter: 'blur(4px)',
        }}>
          {emoji}
        </div>
        {badge && <span style={{ 
          padding: '3px 9px', 
          borderRadius: 99, 
          background: `${color}18`, 
          color, 
          fontSize: '0.6rem', 
          fontWeight: 800, 
          letterSpacing: '0.07em', 
          border: `1px solid ${color}30`, 
          textTransform: 'uppercase',
          backdropFilter: 'blur(4px)',
        }}>{badge}</span>}
      </div>
      <h3 style={{ 
        fontFamily: "'Syne',sans-serif", 
        fontSize: '0.875rem', 
        fontWeight: 700, 
        color: isDark ? '#F1F5F9' : '#0F172A', 
        marginBottom: 5, 
        lineHeight: 1.35,
        transition: 'color .2s',
      }}>{title}</h3>
      <p style={{ 
        fontSize: '0.775rem', 
        color: isDark ? '#94A3B8' : '#6B7280', 
        lineHeight: 1.65, 
        margin: 0,
        transition: 'color .2s',
      }}>{desc}</p>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function Section({ label, emoji, isDark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '38px 0 18px' }}>
      <span style={{ fontSize: '1.05rem' }}>{emoji}</span>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.67rem', fontWeight: 800, color: isDark ? '#475569' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: isDark ? 'linear-gradient(90deg,rgba(255,255,255,0.08) 60%,transparent)' : 'linear-gradient(90deg,#E2E8F0 60%,transparent)' }}/>
    </div>
  );
}

// ── Quick action button ───────────────────────────────────────────────────────
function QuickAction({ emoji, label, sub, path, bg, glow, delay, vis, nav }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => nav(path)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: bg, borderRadius: 20, padding: '20px 22px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: hov ? `0 20px 48px ${glow}` : `0 8px 28px ${glow}`,
        transform: vis ? (hov ? 'translateY(-5px) scale(1.02)' : 'translateY(0)') : 'translateY(20px)',
        opacity: vis ? 1 : 0,
        transition: `all .35s ease ${delay}ms` }}>
      <div style={{ fontSize: '2rem', lineHeight: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>{emoji}</div>
      <div>
        <div style={{ color: 'white', fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: '0.92rem' }}>{label}</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', transform: hov ? 'translateX(4px)' : 'translateX(0)', transition: 'transform .2s' }}>›</div>
    </div>
  );
}

// ── Live dot ─────────────────────────────────────────────────────────────────
function LiveDot({ color = '#10B981' }) {
  return (
    <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'pulse-ring-d 1.8s ease-out infinite' }}/>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }}/>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const nav   = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data,    setData]    = useState(null);
  const [marks,   setMarks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [vis,     setVis]     = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('onboardingDone') !== 'true');

  useEffect(() => {
    Promise.all([api.get('/users/dashboard-data'), api.get('/users/marks')])
      .then(([d, m]) => { setData(d.data); setMarks(m.data || []); })
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setVis(true), 80); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failed     = marks.filter(m => m.total < 40);
  const cgpaNum    = parseFloat(data?.cgpa) || 0;
  const sgpaNum    = parseFloat(data?.sgpa) || 0;
  const cgpaColor  = cgpaNum >= 8 ? '#10B981' : cgpaNum >= 6 ? '#F59E0B' : cgpaNum > 0 ? '#EF4444' : '#64748B';
  const sgpaColor  = sgpaNum >= 8 ? '#3B82F6' : sgpaNum >= 6 ? '#A78BFA' : sgpaNum > 0 ? '#F97316' : '#64748B';
  const gradeLabel = cgpaNum >= 9 ? 'Distinction' : cgpaNum >= 8 ? '1st Class+' : cgpaNum >= 7 ? 'First Class' : cgpaNum >= 6 ? 'Second Class' : cgpaNum > 0 ? 'Pass Class' : 'Not uploaded yet';
  const today      = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const streak     = Number(data?.streak || 0);
  const activityLast15Weeks = Array.isArray(data?.activityLast15Weeks) ? data.activityLast15Weeks : [];

  const pageBg  = isDark ? '#0F172A' : '#F0F2F8';

  const ACADEMICS = [
    { emoji:'📤', title:'Upload Marks Card',   desc:'Auto-extract SGPA from your VTU PDF',          path:'/upload-marks',      color:'#4F46E5' },
    { emoji:'📊', title:'Analytics',            desc:'Visualise performance with beautiful charts',   path:'/analytics',         color:'#0EA5E9' },
    { emoji:'📈', title:'CGPA Tracker',         desc:'Semester-wise SGPA history & growth graph',    path:'/cgpa-tracker',      color:'#7C3AED', badge:'NEW' },
    { emoji:'⚠️', title:'Backlog Dashboard',    desc:'Failed subjects, revaluation & clearing plan', path:'/backlog-dashboard',  color:'#EF4444', badge: failed.length > 0 ? `${failed.length} active` : null, highlight: failed.length > 0 },
    { emoji:'🎯', title:'Rank Predictor',       desc:'Estimate your class rank & percentile',         path:'/rank-predictor',    color:'#F59E0B', badge:'NEW' },
    { emoji:'✅', title:'Attendance Tracker',   desc:'Track % per subject — alerts at 85%',           path:'/attendance',        color:'#059669' },
    { emoji:'📅', title:'Exam Timetable',       desc:'Schedule exams & set reminder alerts',          path:'/exam-timetable',    color:'#0EA5E9' },
    { emoji:'🔔', title:'Reminders',            desc:'Smart reminders for deadlines & submissions',   path:'/reminders',         color:'#6366F1' },
  ];
  const LEARNING = [
    { emoji:'▶️', title:'Training Courses',    desc:'Backlog clearing, upskill & placement prep', path:'/training',          badge:'FREE', color:'#7C3AED' },
    { emoji:'📚', title:'VTU Resources',       desc:'Notes, QPs & syllabus — all schemes',        path:'/vtu-resources',     color:'#0EA5E9' },
    { emoji:'📝', title:'Community Notes',     desc:'Student-uploaded notes with ratings',        path:'/community-notes',   badge:'NEW', color:'#059669' },
    { emoji:'📋', title:'Mock Tests',          desc:'VTU pattern MCQs with instant scoring',     path:'/mock-test',          badge:'AI',  color:'#EF4444' },
    { emoji:'💻', title:'Coding Platform',     desc:'LeetCode-style with Python, Java, C++',     path:'/coding',             badge:'NEW', color:'#10B981' },
    { emoji:'💬', title:'Peer Forum',          desc:'Ask doubts, answer questions, earn XP',     path:'/forum',              badge:'NEW', color:'#7C3AED' },
    { emoji:'🗂️', title:'Flashcards',          desc:'Spaced repetition for smarter studying',    path:'/flashcards',         badge:'NEW', color:'#4F46E5' },
    { emoji:'🤖', title:'AI Study Tutor',      desc:'Step-by-step answers to any VTU topic',     path:'/ai-tutor',           badge:'AI',  color:'#7C3AED' },
    { emoji:'📰', title:'VTU News',            desc:'Exam alerts, results & syllabus updates',   path:'/vtu-news',           color:'#0EA5E9' },
    { emoji:'🎯', title:'Interview Prep',      desc:'HR & technical mock with AI feedback',      path:'/interview-prep',     badge:'AI',  color:'#059669' },
    { emoji:'🃏', title:'Aptitude Test',       desc:'TCS, Infosys, Wipro pattern tests',         path:'/aptitude-test',      badge:'NEW', color:'#F59E0B' },
  ];
  const CAREER = [
    { emoji:'🏢', title:'Placement Drives',    desc:'Company drives with eligibility check',               path:'/placement-drives',    badge:'NEW', color:'#4F46E5' },
    { emoji:'💼', title:'Job Opportunities',   desc:'Internships & off-campus openings',                   path:'/job-opportunities',   color:'#0EA5E9' },
    { emoji:'🏫', title:'Internship Programs', desc:'Apply for curated internships, earn certificates',    path:'/internship-programs', badge:'NEW', color:'#059669' },
    { emoji:'📦', title:'Final Year Projects', desc:'Ready-made or custom projects with source code',      path:'/projects',            badge:'NEW', color:'#7C3AED' },
    { emoji:'📄', title:'Resume Builder',      desc:'ATS-ready with live preview & PDF export',            path:'/resume-builder',      badge:'NEW', color:'#7C3AED' },
    { emoji:'👥', title:'Alumni Mentorship',   desc:'Connect with seniors at top companies',               path:'/alumni-mentorship',   badge:'NEW', color:'#059669' },
    { emoji:'🔍', title:'Internship Tracker',  desc:'Track your applications status',                      path:'/internship-tracker',  color:'#0EA5E9' },
    { emoji:'🏆', title:'Leaderboard',         desc:'CGPA + coding + courses combined rank',               path:'/leaderboard',         badge:'LIVE', color:'#F59E0B' },
    { emoji:'🎓', title:'Scholarships',        desc:'Govt & private scholarships you qualify for',         path:'/scholarships',        badge:'FREE', color:'#10B981' },
  ];
  const EARN = [
    { emoji:'💰', title:'AI Data Earn',        desc:'Complete micro-tasks & earn real money',              path:'/earn',               badge:'EARN', color:'#10B981' },
  ];
  const TOOLS = [
    { emoji:'📅', title:'Study Planner',       desc:'Schedule your study sessions & track goals',         path:'/study-planner',     badge:'NEW', color:'#0EA5E9' },
    { emoji:'📤', title:'Bulk Marks Upload',   desc:'Upload marks for multiple students at once',         path:'/bulk-upload',       color:'#7C3AED' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: pageBg, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulse-ring-d{0%{transform:scale(.8);opacity:.7}70%{transform:scale(1.8);opacity:0}100%{transform:scale(1.8);opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes banner-glow{0%,100%{opacity:.5}50%{opacity:1}}
      `}</style>
      <Header />
      {showOnboarding && <Onboarding onDone={() => { localStorage.setItem('onboardingDone','true'); setShowOnboarding(false); }}/>}

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 20px 60px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={2.5}>
            <DashboardSidebar isDark={isDark} />
          </Grid>
          <Grid item xs={12} md={9.5}>

        {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ height: 220, borderRadius: 24, marginBottom: 28,
            background: 'linear-gradient(90deg,#1E293B 25%,#263348 50%,#1E293B 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease infinite'
          }}/>
        )}
        <div style={{ display: loading ? 'none' : 'block' }}>
        <div style={{
          background: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 40%,#1E3A5F 100%)',
          borderRadius: 24, padding: '36px 40px', marginBottom: 28, position: 'relative', overflow: 'hidden',
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity .5s ease, transform .5s ease' }}>
          {/* Subtle animated glow */}
          <div style={{ position: 'absolute', top: '-40%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)', animation: 'banner-glow 4s ease-in-out infinite', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', bottom: '-30%', left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,70,229,0.2) 0%,transparent 70%)', animation: 'banner-glow 5s ease-in-out infinite 1s', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }}/>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            {/* CGPA + SGPA rings */}
            <div style={{ display: 'flex', gap: 20 }}>
              <CGPARing value={cgpaNum} color={cgpaColor} size={96} label="CGPA" sub={gradeLabel} animate={vis}/>
              <CGPARing value={sgpaNum} max={10} color={sgpaColor} size={80} label="SGPA" animate={vis}/>
            </div>

            {/* Text info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>{today}</div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.1rem,2vw,1.6rem)', fontWeight: 900, color: 'white', margin: '0 0 6px', lineHeight: 1.2 }}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {data?.username || 'Student'} 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                {data?.branch ? `${data.branch} · ${data.semester || ''}` : 'Update your profile to personalise this view'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {cgpaNum === 0 && (
                  <button onClick={() => nav('/upload-marks')} style={{ padding: '8px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}>
                    📤 Upload Marks to see CGPA
                  </button>
                )}
                <button onClick={() => nav('/coding')} style={{ padding: '8px 18px', borderRadius: 10, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#6EE7B7', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  💻 Start Coding
                </button>
              </div>
            </div>

            {/* Streak + activity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 18px', textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>🔥</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.4rem', fontWeight: 900, color: '#FBBF24', lineHeight: 1, marginTop: 4 }}>{streak}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: 500 }}>day streak</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LiveDot/>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Active users online</span>
              </div>
            </div>
          </div>

          {/* Activity heatmap */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your activity — last 15 weeks</div>
            <ActivityHeatmap color="#4F46E5" data={activityLast15Weeks}/>
          </div>
        </div>

        {/* ── QUICK ACTIONS ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 8 }}>
          {[
            { emoji:'📤', label:'Upload Marks', sub:'Auto-extract SGPA from PDF', path:'/upload-marks', bg:'linear-gradient(135deg,#4F46E5,#6366F1)', glow:'rgba(79,70,229,0.35)', delay:0 },
            { emoji:'💻', label:'Solve a Problem', sub:'LeetCode-style coding', path:'/coding', bg:'linear-gradient(135deg,#059669,#10B981)', glow:'rgba(16,185,129,0.35)', delay:60 },
            { emoji:'🤖', label:'Ask AI Tutor', sub:'Instant VTU answers', path:'/ai-tutor', bg:'linear-gradient(135deg,#7C3AED,#8B5CF6)', glow:'rgba(124,58,237,0.35)', delay:120 },
            { emoji:'🏆', label:'View Leaderboard', sub:'See your rank', path:'/leaderboard', bg:'linear-gradient(135deg,#B45309,#F59E0B)', glow:'rgba(245,158,11,0.35)', delay:180 },
          ].map(a => <QuickAction key={a.path} {...a} vis={vis} nav={nav}/>)}
        </div>

        {/* ── ACADEMICS ────────────────────────────────────────────────────── */}
        <Section label="Academics" emoji="🎓" isDark={isDark}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {ACADEMICS.map((c, i) => (
            <FeatureCard key={c.path} {...c} on={() => nav(c.path)} delay={i * 40} visible={vis} isDark={isDark}/>
          ))}
        </div>

        {/* ── LEARNING ─────────────────────────────────────────────────────── */}
        <Section label="Learning & Practice" emoji="📚" isDark={isDark}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {LEARNING.map((c, i) => (
            <FeatureCard key={c.path} {...c} on={() => nav(c.path)} delay={i * 40} visible={vis} isDark={isDark}/>
          ))}
        </div>

        {/* ── CAREER ───────────────────────────────────────────────────────── */}
        <Section label="Career & Placements" emoji="💼" isDark={isDark}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {CAREER.map((c, i) => (
            <FeatureCard key={c.path} {...c} on={() => nav(c.path)} delay={i * 40} visible={vis} isDark={isDark}/>
          ))}
        </div>

        {/* ── EARN ─────────────────────────────────────────────────────────── */}
        <Section label="Earn Money" emoji="💸" isDark={isDark}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {EARN.map((c, i) => (
            <FeatureCard key={c.path} {...c} on={() => nav(c.path)} delay={i * 40} visible={vis} isDark={isDark}/>
          ))}
        </div>

        {/* ── TOOLS ────────────────────────────────────────────────────────── */}
        <Section label="Tools & Utilities" emoji="🔧" isDark={isDark}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {TOOLS.map((c, i) => (
            <FeatureCard key={c.path} {...c} on={() => nav(c.path)} delay={i * 40} visible={vis} isDark={isDark}/>
          ))}
        </div>
        </div>
          </Grid>
        </Grid>
      </div>
      <Footer/>
    </div>
  );
}
