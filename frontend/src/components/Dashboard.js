import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Onboarding from './Onboarding';
import api from '../utils/api';

/* ── Animated counter ─────────────────────────────────────────────────────── */
function AnimatedNumber({ value, decimals = 0, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef();
  useEffect(() => {
    const target = parseFloat(value) || 0;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(+(target * ease).toFixed(decimals));
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [value, decimals, duration]);
  return <>{display}</>;
}

/* ── Feature card ─────────────────────────────────────────────────────────── */
function FeatureCard({ emoji, title, desc, badge, color = '#4F46E5', on, highlight, delay = 0 }) {
  const [vis, setVis] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      ref={ref}
      onClick={on}
      style={{
        background: highlight ? `${color}08` : 'white',
        border: `1.5px solid ${highlight ? color + '50' : '#E8EDF5'}`,
        borderRadius: 18, padding: '20px 18px', cursor: 'pointer',
        height: '100%', position: 'relative', overflow: 'hidden',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms, box-shadow 0.2s, border-color 0.2s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
        e.currentTarget.style.boxShadow = `0 20px 48px ${color}20`;
        e.currentTarget.style.borderColor = color + '60';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = highlight ? color + '50' : '#E8EDF5';
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},${color}44,transparent)`, opacity: highlight ? 1 : 0.6 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', transition: 'transform 0.2s' }}>
          {emoji}
        </div>
        {badge && (
          <span style={{ padding: '3px 10px', borderRadius: 99, background: `${color}18`, color, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.07em', border: `1px solid ${color}30`, textTransform: 'uppercase' }}>
            {badge}
          </span>
        )}
      </div>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: 5, lineHeight: 1.35 }}>{title}</h3>
      <p style={{ fontSize: '0.775rem', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  );
}

/* ── Section divider ──────────────────────────────────────────────────────── */
function Section({ label, emoji }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '36px 0 16px' }}>
      <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#E2E8F0 60%,transparent)' }} />
    </div>
  );
}

/* ── Skeleton loader ──────────────────────────────────────────────────────── */
function Skeleton({ h = 120, r = 16, delay = 0 }) {
  return <div style={{ height: h, borderRadius: r, background: 'linear-gradient(90deg,#E2E8F0 0%,#F1F5F9 50%,#E2E8F0 100%)', backgroundSize: '200% 100%', animation: `shimmer 1.5s ease ${delay}ms infinite` }} />;
}

export default function Dashboard() {
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('onboardingDone') !== 'true');
  const [headerVis, setHeaderVis] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/users/dashboard-data'), api.get('/users/marks')])
      .then(([d, m]) => { setData(d.data); setMarks(m.data || []); })
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setHeaderVis(true), 50); });
  }, []);

  const failed = marks.filter(m => m.total < 40);
  const cgpaNum = parseFloat(data?.cgpa) || 0;
  const sgpaNum = parseFloat(data?.sgpa) || 0;
  const cgpaColor = cgpaNum >= 8 ? '#10B981' : cgpaNum >= 6 ? '#F59E0B' : cgpaNum > 0 ? '#EF4444' : '#94A3B8';
  const gradeLabel = cgpaNum >= 9 ? 'Distinction' : cgpaNum >= 8 ? '1st Class Dist.' : cgpaNum >= 7 ? 'First Class' : cgpaNum >= 6 ? 'Second Class' : cgpaNum > 0 ? 'Pass Class' : 'Not uploaded';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const ACADEMICS = [
    { emoji: '📤', title: 'Upload Marks Card', desc: 'Auto-extract SGPA from your VTU PDF in seconds', path: '/upload-marks', color: '#4F46E5' },
    { emoji: '📊', title: 'Analytics', desc: 'Visualise subject performance with beautiful charts', path: '/analytics', color: '#0EA5E9' },
    { emoji: '📈', title: 'CGPA Tracker', desc: 'Semester-wise SGPA history & growth graph', path: '/cgpa-tracker', badge: 'NEW', color: '#7C3AED' },
    { emoji: '⚠️', title: 'Backlog Dashboard', desc: 'Failed subjects, revaluation & clearing plan', path: '/backlog-dashboard', badge: failed.length > 0 ? `${failed.length} active` : null, color: '#EF4444', highlight: failed.length > 0 },
    { emoji: '🎯', title: 'Rank Predictor', desc: 'Estimate your class rank & percentile', path: '/rank-predictor', badge: 'NEW', color: '#F59E0B' },
    { emoji: '✅', title: 'Attendance Tracker', desc: 'Track % per subject — alerts at 85%', path: '/attendance', color: '#059669' },
    { emoji: '📅', title: 'Exam Timetable', desc: 'Schedule exams & set reminder alerts', path: '/exam-timetable', color: '#0EA5E9' },
    { emoji: '🔔', title: 'Reminders', desc: 'Smart reminders for deadlines & submissions', path: '/reminders', color: '#6366F1' },
  ];

  const LEARNING = [
    { emoji: '▶️', title: 'Training Courses', desc: 'Backlog clearing, upskill & placement prep', path: '/training', badge: 'FREE', color: '#7C3AED' },
    { emoji: '📚', title: 'VTU Resources', desc: 'Notes, QPs & syllabus — all schemes & sems', path: '/vtu-resources', color: '#0EA5E9' },
    { emoji: '📝', title: 'Community Notes', desc: 'Student-uploaded notes with ratings', path: '/community-notes', badge: 'NEW', color: '#059669' },
    { emoji: '📋', title: 'Mock Tests', desc: 'VTU pattern MCQs with instant scoring', path: '/mock-test', badge: 'AI', color: '#EF4444' },
    { emoji: '💻', title: 'Coding Platform', desc: 'LeetCode-style with Python, Java, C, C#', path: '/coding', badge: 'NEW', color: '#10B981' },
    { emoji: '💬', title: 'Peer Forum', desc: 'Ask doubts, answer questions, earn XP', path: '/forum', badge: 'NEW', color: '#7C3AED' },
    { emoji: '🗂️', title: 'Flashcards', desc: 'Spaced repetition for smarter studying', path: '/flashcards', badge: 'NEW', color: '#4F46E5' },
    { emoji: '🤖', title: 'AI Study Tutor', desc: 'Step-by-step answers to any VTU topic', path: '/ai-tutor', badge: 'AI', color: '#7C3AED' },
    { emoji: '📰', title: 'VTU News', desc: 'Exam alerts, results & syllabus updates', path: '/vtu-news', color: '#0EA5E9' },
    { emoji: '🎯', title: 'Interview Prep', desc: 'HR & technical mock with AI feedback', path: '/interview-prep', badge: 'AI', color: '#059669' },
  ];

  const CAREER = [
    { emoji: '🏢', title: 'Placement Drives', desc: 'Company drives with eligibility auto-check', path: '/placement-drives', badge: 'NEW', color: '#4F46E5' },
    { emoji: '📄', title: 'Resume Builder', desc: 'ATS-ready with live preview & PDF export', path: '/resume-builder', badge: 'NEW', color: '#7C3AED' },
    { emoji: '👥', title: 'Alumni Mentorship', desc: 'Connect with seniors at top companies', path: '/alumni-mentorship', badge: 'NEW', color: '#059669' },
    { emoji: '💼', title: 'Job Opportunities', desc: 'Internships & off-campus openings', path: '/job-opportunities', color: '#0EA5E9' },
    { emoji: '📋', title: 'Internship Tracker', desc: 'Track every application from applied → offer', path: '/internship-tracker', badge: 'NEW', color: '#F59E0B' },
    { emoji: '🏆', title: 'Leaderboard', desc: 'CGPA + coding + courses combined rank', path: '/leaderboard', badge: 'LIVE', color: '#F59E0B' },
    { emoji: '🎓', title: 'Scholarships', desc: 'Govt & private scholarships you qualify for', path: '/scholarships', badge: 'FREE', color: '#10B981' },
    { emoji: '⭐', title: 'Go Premium', desc: 'Unlimited AI, all resources & coding tools', path: '/premium', badge: '⭐', color: '#4F46E5' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F4F6FB' }}>
      <Header />
      <div style={{ flex: 1, maxWidth: 1300, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <Skeleton h={220} r={24} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginTop: 28 }}>
          {Array(12).fill(0).map((_, i) => <Skeleton key={i} h={130} r={18} delay={i * 60} />)}
        </div>
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F4F6FB', fontFamily: "'Outfit', sans-serif" }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 1300, margin: '0 auto', padding: '28px 24px 60px', width: '100%' }}>

        {/* ── Hero Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #06030F 0%, #1E1B4B 45%, #0D1B35 100%)',
          borderRadius: 28, padding: '36px 40px', marginBottom: 24,
          position: 'relative', overflow: 'hidden',
          opacity: headerVis ? 1 : 0, transform: headerVis ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'opacity 0.55s ease, transform 0.55s ease',
          boxShadow: '0 32px 80px rgba(6,3,15,0.35)',
        }}>
          {/* Animated orbs */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)', animation: 'float1 8s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: '25%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)', animation: 'float2 10s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '40%', left: '55%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)', animation: 'float3 7s ease-in-out infinite', pointerEvents: 'none' }} />
          {/* Grid pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                  📅 {today}
                </p>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem,3.5vw,2.2rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
                  Hey {data?.full_name?.split(' ')[0] || data?.username || 'Student'}! 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.9rem', marginTop: 8 }}>
                  Your VTU academic command centre
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <button onClick={() => nav('/upload-marks')}
                  style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', cursor: 'pointer', padding: '11px 22px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Outfit',sans-serif", transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}>
                  📤 Upload Marks
                </button>
                <button onClick={() => nav('/analytics')}
                  style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', cursor: 'pointer', padding: '11px 22px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700, fontFamily: "'Outfit',sans-serif", boxShadow: '0 4px 20px rgba(79,70,229,0.45)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.55)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.45)'; }}>
                  📊 My Analytics
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>
              {[
                { label: 'Semester', value: data?.semester || '—', icon: '📅', color: '#818CF8', sub: null, animate: false },
                { label: 'CGPA', value: cgpaNum > 0 ? cgpaNum : '—', icon: '🎯', color: cgpaColor, sub: gradeLabel, animate: cgpaNum > 0, decimals: 2 },
                { label: 'SGPA', value: sgpaNum > 0 ? sgpaNum : '—', icon: '📈', color: '#38BDF8', sub: 'Last semester', animate: sgpaNum > 0, decimals: 2 },
                { label: 'Subjects', value: marks.length || '—', icon: '📚', color: '#A78BFA', sub: null, animate: marks.length > 0 },
                { label: 'Backlogs', value: failed.length, icon: failed.length > 0 ? '⚠️' : '✅', color: failed.length > 0 ? '#F87171' : '#34D399', sub: failed.length > 0 ? 'Needs clearing' : 'All clear!', animate: false },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
                  border: `1px solid rgba(255,255,255,${s.label === 'Backlogs' && failed.length > 0 ? '0.2' : '0.08'})`,
                  borderRadius: 16, padding: '16px', transition: 'all 0.2s',
                  cursor: 'default',
                }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.1rem,2vw,1.55rem)', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                    {s.animate ? <AnimatedNumber value={s.value} decimals={s.decimals || 0} /> : s.value}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
                  {s.sub && <div style={{ fontSize: '0.62rem', color: s.color, marginTop: 3, fontWeight: 600 }}>{s.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Backlog Alert ── */}
        {failed.length > 0 && (
          <div onClick={() => nav('/backlog-dashboard')}
            style={{ background: 'linear-gradient(135deg,#FFF5F5,#FEF2F2)', border: '1.5px solid #FECACA', borderRadius: 18, padding: '16px 22px', marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s', boxShadow: '0 2px 16px rgba(239,68,68,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(239,68,68,0.16)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(239,68,68,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, animation: 'pulse-ring 2s ease infinite' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#DC2626', fontSize: '0.92rem', margin: '0 0 3px' }}>
                {failed.length} backlog{failed.length > 1 ? 's' : ''} detected: {failed.slice(0, 3).map(s => s.subject_code).join(', ')}{failed.length > 3 ? '...' : ''}
              </p>
              <p style={{ color: '#EF4444', fontSize: '0.78rem', margin: 0, opacity: 0.8 }}>Free clearing courses available! Click to view your backlog dashboard →</p>
            </div>
            <div style={{ color: '#EF4444', fontSize: '1.3rem', flexShrink: 0, transition: 'transform 0.2s' }}>›</div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 8 }}>
          {[
            { emoji: '🚀', label: 'Upload Marks', sub: 'Calculate SGPA instantly', path: '/upload-marks', bg: 'linear-gradient(135deg,#4F46E5,#7C3AED)', glow: 'rgba(79,70,229,0.4)' },
            { emoji: '📊', label: 'View Analytics', sub: 'Charts & performance insights', path: '/analytics', bg: 'linear-gradient(135deg,#0EA5E9,#0284C7)', glow: 'rgba(14,165,233,0.4)' },
            { emoji: '▶️', label: 'Start Learning', sub: 'Free courses — all VTU topics', path: '/training', bg: 'linear-gradient(135deg,#10B981,#059669)', glow: 'rgba(16,185,129,0.4)' },
            { emoji: '🤖', label: 'Ask AI Tutor', sub: 'Instant VTU topic answers', path: '/ai-tutor', bg: 'linear-gradient(135deg,#F59E0B,#D97706)', glow: 'rgba(245,158,11,0.4)' },
          ].map((q, i) => (
            <div key={i} onClick={() => nav(q.path)}
              style={{ background: q.bg, borderRadius: 18, padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, boxShadow: `0 8px 24px ${q.glow}`, transition: 'all 0.22s', opacity: headerVis ? 1 : 0, transform: headerVis ? 'translateY(0)' : 'translateY(16px)', transitionDelay: `${i * 80 + 200}ms` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 16px 40px ${q.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = `0 8px 24px ${q.glow}`; }}>
              <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{q.emoji}</div>
              <div>
                <div style={{ color: 'white', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.88rem' }}>{q.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', marginTop: 2 }}>{q.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Academics ── */}
        <Section label="Academics" emoji="📊" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {ACADEMICS.map((c, i) => <FeatureCard key={c.path} {...c} on={() => nav(c.path)} delay={i * 50} />)}
        </div>

        {/* ── Recent marks mini-table ── */}
        {marks.length > 0 && (
          <div style={{ background: 'white', borderRadius: 22, border: '1px solid #E8EDF5', overflow: 'hidden', marginTop: 28 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg,#F8FAFC,white)' }}>
              <div>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>📋 Latest Marks</span>
                <span style={{ marginLeft: 10, padding: '2px 9px', borderRadius: 99, background: '#EEF2FF', color: '#4F46E5', fontSize: '0.68rem', fontWeight: 700 }}>{marks.length} subjects</span>
                {failed.length > 0 && <span style={{ marginLeft: 6, padding: '2px 9px', borderRadius: 99, background: '#FEE2E2', color: '#DC2626', fontSize: '0.68rem', fontWeight: 700 }}>{failed.length} failed</span>}
              </div>
              <button onClick={() => nav('/analytics')}
                style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white', border: 'none', cursor: 'pointer', padding: '7px 16px', borderRadius: 9, fontSize: '0.76rem', fontWeight: 700, fontFamily: "'Outfit',sans-serif", transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.3)'; }}>
                Full Analytics →
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#FAFBFC' }}>
                    {['Code', 'Subject', 'Internal', 'External', 'Total', 'Credits', 'Grade Points', 'Grade'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E8EDF5', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marks.slice(0, 8).map((m, i) => {
                    const gp = m.grade_points;
                    const grade = gp >= 10 ? 'S' : gp >= 9 ? 'A' : gp >= 8 ? 'B' : gp >= 7 ? 'C' : gp >= 6 ? 'D' : gp >= 4 ? 'E' : 'F';
                    const gradeColor = gp >= 8 ? '#10B981' : gp >= 6 ? '#F59E0B' : '#EF4444';
                    const fail = m.total < 40;
                    return (
                      <tr key={i}
                        style={{ borderBottom: '1px solid #F4F6FB', background: fail ? '#FFF8F8' : 'white', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = fail ? '#FEECEC' : '#F8FAFF'}
                        onMouseLeave={e => e.currentTarget.style.background = fail ? '#FFF8F8' : 'white'}>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#4F46E5', fontSize: '0.78rem' }}>{m.subject_code}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'left', color: '#374151', maxWidth: 170 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject_name || '—'}</span></td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', color: '#64748B' }}>{m.internal_marks}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', color: '#64748B' }}>{m.external_marks}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontWeight: 800, color: fail ? '#EF4444' : '#0F172A' }}>{m.total}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', color: '#64748B' }}>{m.credits}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>{m.grade_points}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                          <span style={{ padding: '3px 11px', borderRadius: 99, background: `${gradeColor}18`, color: gradeColor, fontWeight: 800, fontSize: '0.72rem', fontFamily: "'Syne', sans-serif" }}>{grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Learning ── */}
        <Section label="Learning & Resources" emoji="🎓" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {LEARNING.map((c, i) => <FeatureCard key={c.path} {...c} on={() => nav(c.path)} delay={i * 45} />)}
        </div>

        {/* ── Career ── */}
        <Section label="Career & Placement" emoji="💼" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {CAREER.map((c, i) => <FeatureCard key={c.path} {...c} on={() => nav(c.path)} delay={i * 45} />)}
        </div>

        {/* ── Progress banner ── */}
        {cgpaNum > 0 && (
          <div style={{ marginTop: 32, background: 'linear-gradient(135deg,#0F172A,#1E1B4B)', borderRadius: 22, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', boxShadow: '0 16px 48px rgba(15,23,42,0.25)', opacity: headerVis ? 1 : 0, transition: 'opacity 0.6s ease 0.5s' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 6 }}>Overall Progress</p>
              <p style={{ fontFamily: "'Syne',sans-serif", color: 'white', fontSize: '1rem', fontWeight: 800, margin: '0 0 14px' }}>
                CGPA {cgpaNum.toFixed(2)} — {gradeLabel}
              </p>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min((cgpaNum / 10) * 100, 100)}%`, background: `linear-gradient(90deg,${cgpaColor},${cgpaColor}aa)`, borderRadius: 99, transition: 'width 1.5s ease 0.8s', boxShadow: `0 0 12px ${cgpaColor}60` }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', marginTop: 6 }}>{((cgpaNum / 10) * 100).toFixed(0)}% of maximum 10.0 CGPA</p>
            </div>
            <button onClick={() => nav('/cgpa-tracker')}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', padding: '12px 24px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700, fontFamily: "'Outfit',sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              📈 Track Full CGPA History →
            </button>
          </div>
        )}

      </main>

      <Onboarding open={showOnboarding} onClose={() => { localStorage.setItem('onboardingDone', 'true'); setShowOnboarding(false); }} />
      <Footer />

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,15px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-20px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-10px,10px)} 66%{transform:translate(10px,-5px)} }
        @keyframes pulse-ring { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}
