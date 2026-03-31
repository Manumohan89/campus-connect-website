import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

/* ─── Animated Particle Background ─────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = window.innerWidth;
    let H = c.height = Math.min(window.innerHeight * 0.85, 750);
    const onResize = () => { W = c.width = window.innerWidth; H = c.height = Math.min(window.innerHeight * 0.85, 750); };
    window.addEventListener('resize', onResize);

    const NUM = 55;
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      a: Math.random(),
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165,180,252,${p.a * 0.6})`;
        ctx.fill();
      });
      // Draw connecting lines
      for (let i = 0; i < NUM; i++) {
        for (let j = i + 1; j < NUM; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(129,140,248,${(1 - dist / 120) * 0.25})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ─── Animated Counter ──────────────────────────────────────────── */
function AnimatedNumber({ target, duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      const num = parseInt(target.replace(/\D/g, '')) || 0;
      const suffix = target.replace(/[0-9]/g, '');
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - prog, 3);
        setVal(suffix === 'k+' ? (eased * num).toFixed(1) + 'k+' : Math.round(eased * num) + suffix);
        if (prog < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val || '0'}</span>;
}

/* ─── Feature data ──────────────────────────────────────────────── */
const FEATURES = [
  { emoji:'📊', title:'SGPA / CGPA Calculator', desc:'Upload any VTU marks card PDF — subjects auto-extracted, credits applied, grade calculated instantly.', tag:'Core', color:'#6366F1', glow:'rgba(99,102,241,0.25)' },
  { emoji:'⚠️', title:'Backlog Clearing Courses', desc:'Failed a subject? Free video courses matched to VTU syllabus help you pass next attempt.', tag:'FREE', color:'#EF4444', glow:'rgba(239,68,68,0.2)' },
  { emoji:'🤖', title:'AI Study Tutor', desc:'Ask any VTU subject question. Step-by-step answers powered by Claude AI. Exam-pattern aware.', tag:'AI', color:'#8B5CF6', glow:'rgba(139,92,246,0.25)' },
  { emoji:'💻', title:'Coding Platform', desc:'LeetCode-style problems with built-in Python, Java, C, C++ compilers. Real-time leaderboard.', tag:'NEW', color:'#10B981', glow:'rgba(16,185,129,0.2)' },
  { emoji:'📚', title:'VTU Resource Library', desc:'Notes, question papers, syllabus for ALL schemes (2015–2025), all departments, all 8 semesters.', tag:'2025', color:'#0EA5E9', glow:'rgba(14,165,233,0.2)' },
  { emoji:'💬', title:'Peer Doubt Forum', desc:'Stack Overflow for VTU. Ask questions, get answers from seniors, earn reputation points.', tag:'NEW', color:'#F59E0B', glow:'rgba(245,158,11,0.2)' },
  { emoji:'🗂️', title:'Flashcard Decks', desc:'SM-2 spaced repetition algorithm schedules reviews at the perfect moment before exams.', tag:'NEW', color:'#EC4899', glow:'rgba(236,72,153,0.2)' },
  { emoji:'🏆', title:'College Leaderboard', desc:'Rankings built from CGPA, coding solved, courses completed, attendance, and forum answers.', tag:'LIVE', color:'#F59E0B', glow:'rgba(245,158,11,0.2)' },
  { emoji:'💼', title:'Placement Command Centre', desc:'Campus drives with eligibility check, AI interview prep, resume builder, and alumni connect.', tag:'Career', color:'#06B6D4', glow:'rgba(6,182,212,0.2)' },
  { emoji:'📰', title:'VTU News & Alerts', desc:'Exam timetables, results, revaluation deadlines, syllabus updates — fetched daily from VTU.', tag:'LIVE', color:'#6366F1', glow:'rgba(99,102,241,0.2)' },
  { emoji:'🎯', title:'Resume Builder', desc:'3 ATS-friendly templates, live preview, instant PDF. Built for VTU placement season.', tag:'Career', color:'#8B5CF6', glow:'rgba(139,92,246,0.2)' },
  { emoji:'🎓', title:'Verified Certificates', desc:'Complete any training course, earn a sharable, verifiable certificate for your LinkedIn.', tag:'Free', color:'#10B981', glow:'rgba(16,185,129,0.2)' },
];

const TESTIMONIALS = [
  { name:'Arjun K.', branch:'CSE, 6th Sem', text:'Calculated my SGPA in 10 seconds by uploading my marks card. Saved me 30 minutes of manual math!', stars:5 },
  { name:'Priya S.', branch:'ECE, 4th Sem', text:'The backlog clearing courses helped me clear 21EC42 on my second attempt. Forever grateful!', stars:5 },
  { name:'Rohit M.', branch:'ISE, 7th Sem', text:'Got placed at Infosys. Used the resume builder, mock tests, and alumni mentorship feature.', stars:5 },
  { name:'Sneha R.', branch:'ME, 3rd Sem', text:'VTU resources are incredible — found exact 2022 scheme notes for all my subjects in one place.', stars:5 },
];

export default function Homepage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students:'12k+', courses:'45+', resources:'500+', certs:'2400+' });

  useEffect(() => {
    axios.get('/api/users/platform-stats').then(r => {
      const d = r.data;
      setStats({
        students: d.students >= 1000 ? (d.students/1000).toFixed(1)+'k+' : d.students+'+',
        courses: d.courses+'+',
        resources: d.resources+'+',
        certs: d.certificates+'+',
      });
    }).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: '#F6F8FC', overflowX: 'hidden' }}>
      <PublicHeader />

      {/* ═══ HERO ════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0A0818 0%, #0E0B2E 30%, #16103F 60%, #0A1628 100%)',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <ParticleField />

        {/* Mesh gradient orbs */}
        <div style={{ position:'absolute', top:'-15%', right:'-10%', width:'55vw', height:'55vw', maxWidth:700, maxHeight:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-20%', left:'-8%', width:'40vw', height:'40vw', maxWidth:550, maxHeight:550, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'40%', left:'45%', width:'30vw', height:'30vw', maxWidth:400, maxHeight:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Grid overlay */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize:'60px 60px',
        }} />

        <div style={{ position:'relative', zIndex:2, width:'100%', maxWidth:1200, margin:'0 auto', padding:'80px 24px 100px' }}>
          
          {/* Badge */}
          <div className="animate-fadeInUp" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(99,102,241,0.15)', backdropFilter:'blur(12px)',
            border:'1px solid rgba(99,102,241,0.3)', borderRadius:99,
            padding:'6px 16px', marginBottom:28,
          }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#818CF8', boxShadow:'0 0 8px #818CF8', display:'block', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.9)', letterSpacing:'0.02em' }}>
              Built exclusively for VTU Students · 2021 & 2022 Scheme
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fadeInUp delay-100" style={{
            fontFamily:"'Syne', sans-serif",
            fontSize:'clamp(2.4rem, 5.5vw, 5rem)',
            fontWeight:800,
            color:'white',
            lineHeight:1.08,
            letterSpacing:'-0.03em',
            marginBottom:24,
            maxWidth:820,
          }}>
            Your VTU Academic{' '}
            <span style={{
              background:'linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #38BDF8 100%)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:'text',
            }}>
              Success Platform
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fadeInUp delay-200" style={{
            fontSize:'clamp(1rem, 2vw, 1.2rem)',
            color:'rgba(255,255,255,0.65)',
            maxWidth:580,
            lineHeight:1.75,
            marginBottom:44,
          }}>
            Calculate SGPA instantly from your PDF, clear backlogs with free courses,
            download VTU notes, crack placements — everything your VTU journey needs, free.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fadeInUp delay-300" style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:64 }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background:'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color:'white', border:'none', cursor:'pointer',
                padding:'15px 32px', borderRadius:12, fontSize:'1rem',
                fontWeight:700, fontFamily:"'Outfit',sans-serif",
                boxShadow:'0 8px 32px rgba(79,70,229,0.45)',
                transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                letterSpacing:'0.01em',
              }}
              onMouseEnter={e => { e.target.style.transform='translateY(-3px)'; e.target.style.boxShadow='0 16px 40px rgba(79,70,229,0.55)'; }}
              onMouseLeave={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 8px 32px rgba(79,70,229,0.45)'; }}
            >
              Start Free Today →
            </button>
            <button
              onClick={() => navigate('/sgpa-calculator')}
              style={{
                background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)',
                color:'rgba(255,255,255,0.9)', border:'1px solid rgba(255,255,255,0.2)',
                cursor:'pointer', padding:'15px 32px', borderRadius:12,
                fontSize:'1rem', fontWeight:600, fontFamily:"'Outfit',sans-serif",
                transition:'all 0.2s ease',
              }}
              onMouseEnter={e => { e.target.style.background='rgba(255,255,255,0.15)'; e.target.style.borderColor='rgba(255,255,255,0.4)'; }}
              onMouseLeave={e => { e.target.style.background='rgba(255,255,255,0.08)'; e.target.style.borderColor='rgba(255,255,255,0.2)'; }}
            >
              Try SGPA Calculator
            </button>
          </div>

          {/* Stats row */}
          <div className="animate-fadeInUp delay-400" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, maxWidth:660 }}>
            {[
              { v:stats.students, l:'VTU Students' },
              { v:stats.courses,  l:'Free Courses' },
              { v:stats.resources,l:'VTU Resources' },
              { v:stats.certs,    l:'Certificates' },
            ].map((s,i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)',
                border:'1px solid rgba(255,255,255,0.1)', borderRadius:14,
                padding:'16px 12px', textAlign:'center',
              }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.3rem,2.5vw,1.75rem)', fontWeight:800, color:'white', lineHeight:1 }}>
                  <AnimatedNumber target={s.v} />
                </div>
                <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', marginTop:4, fontWeight:500, letterSpacing:'0.03em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>Scroll</span>
          <div style={{ width:1, height:40, background:'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }} />
        </div>
      </section>

      {/* ═══ MARQUEE TRUST BAR ═══════════════════════════════════ */}
      <section style={{ background:'#0E0B2E', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', overflow:'hidden', padding:'14px 0' }}>
        <div style={{
          display:'flex', gap:48, animation:'marquee 22s linear infinite', whiteSpace:'nowrap',
        }}>
          {['🎓 VTU 2021 Scheme ✓','🎓 VTU 2022 Scheme ✓','📊 SGPA in 10 Seconds','🏆 Placement Drives','💻 DSA Practice Platform','📚 Notes & PYQs','🤖 AI Study Tutor','⚠️ Free Backlog Clearing','🎓 VTU 2021 Scheme ✓','🎓 VTU 2022 Scheme ✓','📊 SGPA in 10 Seconds','🏆 Placement Drives','💻 DSA Practice Platform','📚 Notes & PYQs','🤖 AI Study Tutor','⚠️ Free Backlog Clearing'].map((t,i) => (
            <span key={i} style={{ fontSize:'0.78rem', fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.05em' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════════════ */}
      <section style={{ padding:'96px 24px', background:'#F6F8FC' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#EEF2FF', border:'1px solid #C7D2FE', borderRadius:99, padding:'5px 16px', marginBottom:16 }}>
              <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#4F46E5', letterSpacing:'0.05em', textTransform:'uppercase' }}>Everything in One Place</span>
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, color:'#0F172A', letterSpacing:'-0.03em', marginBottom:12 }}>
              Everything you need to{' '}
              <span style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                succeed at VTU
              </span>
            </h2>
            <p style={{ fontSize:'1.05rem', color:'#64748B', maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
              From marks calculation to placement prep — we've built it all, and it's free.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card-hover" style={{
                background:'white',
                border:`1px solid ${f.color}22`,
                borderRadius:20,
                padding:'28px 24px',
                position:'relative',
                overflow:'hidden',
                animation:`fadeInUp 0.5s ease both`,
                animationDelay:`${i * 40}ms`,
              }}>
                {/* Top glow */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${f.color}, transparent)`, borderRadius:'20px 20px 0 0' }} />
                
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${f.color}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>
                    {f.emoji}
                  </div>
                  <span style={{ padding:'3px 10px', borderRadius:99, background:`${f.color}14`, color:f.color, fontSize:'0.65rem', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', border:`1px solid ${f.color}30` }}>
                    {f.tag}
                  </span>
                </div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:700, color:'#0F172A', marginBottom:8, lineHeight:1.3 }}>{f.title}</h3>
                <p style={{ fontSize:'0.85rem', color:'#64748B', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════ */}
      <section style={{ padding:'96px 24px', background:'#0E0B2E', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }} />
        
        <div style={{ maxWidth:1000, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'white', letterSpacing:'-0.03em', marginBottom:12 }}>
              Get your SGPA in{' '}
              <span style={{ background:'linear-gradient(135deg,#818CF8,#38BDF8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                3 simple steps
              </span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'1.05rem' }}>No manual entry. No formulas. Just upload and done.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:24 }}>
            {[
              { n:'01', emoji:'📤', title:'Upload Marks Card PDF', desc:"Download your result from vtu.ac.in or any VTU portal, then upload here. Any format, any year.", color:'#6366F1' },
              { n:'02', emoji:'⚡', title:'AI Extracts Everything', desc:"Our parser reads subject codes, internal marks, external marks, and auto-applies the correct VTU credit scheme.", color:'#8B5CF6' },
              { n:'03', emoji:'🎯', title:'Get SGPA + Insights', desc:"Instant SGPA calculation, grade analysis, backlog alert, and personalised course recommendations.", color:'#38BDF8' },
            ].map((s,i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)',
                border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'36px 28px',
                position:'relative',
              }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'3rem', fontWeight:900, color:s.color, opacity:0.2, lineHeight:1, marginBottom:16, letterSpacing:'-0.04em' }}>{s.n}</div>
                <div style={{ fontSize:'2rem', marginBottom:16 }}>{s.emoji}</div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.1rem', fontWeight:700, color:'white', marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.55)', lineHeight:1.7 }}>{s.desc}</p>
                {/* Connector line */}
                {i < 2 && <div style={{ display:'none' }} />}
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:48 }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background:'linear-gradient(135deg,#4F46E5,#7C3AED)',
                color:'white', border:'none', cursor:'pointer',
                padding:'16px 36px', borderRadius:12, fontSize:'1rem',
                fontWeight:700, fontFamily:"'Outfit',sans-serif",
                boxShadow:'0 8px 32px rgba(79,70,229,0.4)',
                transition:'all 0.25s',
              }}
              onMouseEnter={e => { e.target.style.transform='translateY(-3px)'; }}
              onMouseLeave={e => { e.target.style.transform='translateY(0)'; }}
            >
              Try It Free — No Credit Card →
            </button>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════ */}
      <section style={{ padding:'96px 24px', background:'#F6F8FC' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'#0F172A', letterSpacing:'-0.03em', marginBottom:8 }}>
              Students love Campus Connect
            </h2>
            <p style={{ color:'#64748B', fontSize:'1.05rem' }}>Real stories from real VTU students</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
            {TESTIMONIALS.map((t,i) => (
              <div key={i} className="card-hover" style={{
                background:'white', borderRadius:20, padding:'28px 24px',
                border:'1px solid #E2E8F0', boxShadow:'0 2px 12px rgba(15,23,42,0.06)',
              }}>
                <div style={{ display:'flex', gap:2, marginBottom:16 }}>
                  {Array(t.stars).fill(0).map((_,j) => <span key={j} style={{ color:'#F59E0B', fontSize:'0.9rem' }}>★</span>)}
                </div>
                <p style={{ fontSize:'0.9rem', color:'#374151', lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'0.9rem', fontFamily:"'Syne',sans-serif" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#0F172A' }}>{t.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'#94A3B8' }}>{t.branch}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PREMIUM SECTION ═════════════════════════════════════ */}
      <section style={{
        padding:'96px 24px',
        background:'linear-gradient(135deg, #1E1B4B 0%, #2E1065 50%, #0F172A 100%)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:99, padding:'6px 18px', marginBottom:24 }}>
            <span>⭐</span>
            <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#FBBF24', letterSpacing:'0.05em' }}>PREMIUM PLANS FROM ₹199/MONTH</span>
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, color:'white', letterSpacing:'-0.03em', marginBottom:16 }}>
            Unlock the Full Experience
          </h2>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'1.05rem', lineHeight:1.75, marginBottom:40, maxWidth:520, margin:'0 auto 40px' }}>
            Unlimited AI Tutor · All 8 semesters · Unlimited coding · AI resume · 4 months FREE on yearly
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button
              onClick={() => navigate('/premium')}
              style={{
                background:'linear-gradient(135deg,#F59E0B,#D97706)',
                color:'#1E1B4B', border:'none', cursor:'pointer',
                padding:'16px 36px', borderRadius:12, fontSize:'1rem',
                fontWeight:800, fontFamily:"'Outfit',sans-serif",
                boxShadow:'0 8px 32px rgba(245,158,11,0.4)',
                transition:'all 0.25s',
              }}
              onMouseEnter={e => e.target.style.transform='translateY(-3px)'}
              onMouseLeave={e => e.target.style.transform='translateY(0)'}
            >
              See Premium Plans ⭐
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)',
                color:'rgba(255,255,255,0.85)', border:'1px solid rgba(255,255,255,0.2)',
                cursor:'pointer', padding:'16px 36px', borderRadius:12,
                fontSize:'1rem', fontWeight:600, fontFamily:"'Outfit',sans-serif",
                transition:'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.08)'}
            >
              Start Free
            </button>
          </div>

          <div style={{ display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap', marginTop:36 }}>
            {['✅ SGPA Calculator','✅ Coding Platform','✅ AI Study Tutor','✅ VTU Resources','✅ Peer Forum','✅ Leaderboard'].map(t => (
              <span key={t} style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', fontWeight:500 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════ */}
      <section style={{ padding:'96px 24px', background:'white', textAlign:'center' }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'#0F172A', letterSpacing:'-0.03em', marginBottom:16 }}>
            Ready to take control of your academics?
          </h2>
          <p style={{ color:'#64748B', fontSize:'1.05rem', lineHeight:1.7, marginBottom:40 }}>
            Join thousands of VTU students who track, learn, and grow on Campus Connect.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              background:'linear-gradient(135deg,#4F46E5,#7C3AED)',
              color:'white', border:'none', cursor:'pointer',
              padding:'18px 48px', borderRadius:14, fontSize:'1.05rem',
              fontWeight:700, fontFamily:"'Outfit',sans-serif",
              boxShadow:'0 8px 32px rgba(79,70,229,0.4)',
              transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { e.target.style.transform='translateY(-4px) scale(1.02)'; e.target.style.boxShadow='0 16px 48px rgba(79,70,229,0.5)'; }}
            onMouseLeave={e => { e.target.style.transform='translateY(0) scale(1)'; e.target.style.boxShadow='0 8px 32px rgba(79,70,229,0.4)'; }}
          >
            Create Free Account →
          </button>
          <p style={{ marginTop:16, fontSize:'0.82rem', color:'#94A3B8' }}>Free forever · No credit card · Setup in 60 seconds</p>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
