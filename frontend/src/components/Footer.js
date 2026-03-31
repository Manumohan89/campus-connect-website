import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = {
  Academics: [
    ['Upload Marks','/upload-marks'],['CGPA Tracker','/cgpa-tracker'],
    ['Analytics','/analytics'],['Backlog Dashboard','/backlog-dashboard'],
    ['Rank Predictor','/rank-predictor'],['Attendance','/attendance'],
  ],
  Learning: [
    ['Training Courses','/training'],['VTU Resources','/vtu-resources'],
    ['Coding Platform','/coding'],['AI Study Tutor','/ai-tutor'],
    ['Peer Forum','/forum'],['Flashcards','/flashcards'],
  ],
  Career: [
    ['Placement Drives','/placement-drives'],['Resume Builder','/resume-builder'],
    ['Alumni Mentorship','/alumni-mentorship'],['Interview Prep','/interview-prep'],
    ['Scholarships','/scholarships'],['Leaderboard','/leaderboard'],
  ],
  Tools: [
    ['Attendance Tracker','/attendance'],['Exam Timetable','/exam-timetable'],
    ['Reminders','/reminders'],['Internship Tracker','/internship-tracker'],
    ['Mock Tests','/mock-test'],['Settings','/settings'],
  ],
};

const SOCIALS = [
  { icon:'🐦', label:'Twitter', href:'#' },
  { icon:'💼', label:'LinkedIn', href:'#' },
  { icon:'🐙', label:'GitHub', href:'#' },
  { icon:'📸', label:'Instagram', href:'#' },
];

const BADGES = [
  { label:'Free Forever', icon:'🎁' },
  { label:'VTU 2022 Scheme', icon:'🎓' },
  { label:'PWA Ready', icon:'📱' },
  { label:'No Ads', icon:'🚫' },
  { label:'Open Source', icon:'⭐' },
];

export default function Footer() {
  const nav = useNavigate();
  const [hovered, setHovered] = useState(null);
  const year = new Date().getFullYear();

  return (
    <footer style={{ background:'linear-gradient(180deg,#06030F 0%,#0E0B2E 100%)', color:'white', paddingTop:64, position:'relative', overflow:'hidden' }}>
      {/* Background orbs */}
      <div style={{ position:'absolute', top:0, left:'20%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(79,70,229,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, right:'15%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.04) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 28px', position:'relative', zIndex:1 }}>

        {/* Logo section */}
        <div style={{ paddingBottom:48, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:48 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, cursor:'pointer' }} onClick={() => nav('/dashboard')}>
            <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', boxShadow:'0 4px 18px rgba(79,70,229,0.4)', transition:'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.1) rotate(-4deg)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1) rotate(0)'}>
              🎓
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:'1.1rem', letterSpacing:'-0.02em' }}>Campus Connect</div>
              <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.3)', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>VTU Student Portal</div>
            </div>
          </div>
          <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.38)', lineHeight:1.85, maxWidth:420, marginBottom:20 }}>
            The complete academic hub for VTU students. Calculate SGPA, clear backlogs, access resources, and launch your career — all free, forever.
          </p>
          {/* Feature badges */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
            {BADGES.map(b => (
              <span key={b.label} style={{ padding:'5px 13px', borderRadius:99, border:'1px solid rgba(99,102,241,0.2)', background:'rgba(99,102,241,0.07)', fontSize:'0.65rem', fontWeight:700, color:'rgba(165,180,252,0.7)', letterSpacing:'0.04em', display:'flex', alignItems:'center', gap:5, transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.color='rgba(165,180,252,1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.2)'; e.currentTarget.style.color='rgba(165,180,252,0.7)'; }}>
                <span>{b.icon}</span>{b.label}
              </span>
            ))}
          </div>
          {/* Social links */}
          <div style={{ display:'flex', gap:10 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} title={s.label}
                style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.95rem', textDecoration:'none', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(0)'; }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:40, marginBottom:56 }}>
          {Object.entries(SECTIONS).map(([section, items]) => (
            <div key={section}>
              <h4 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,0.28)', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:3, height:12, borderRadius:99, background:'linear-gradient(180deg,#4F46E5,#7C3AED)', display:'inline-block' }} />
                {section}
              </h4>
              <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                {items.map(([label, path]) => (
                  <button key={path} onClick={() => nav(path)}
                    style={{ background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0, fontSize:'0.845rem', color:'rgba(255,255,255,0.42)', fontFamily:"'Outfit',sans-serif", transition:'all 0.15s', lineHeight:1 }}
                    onMouseEnter={e => { e.currentTarget.style.color='rgba(165,180,252,0.9)'; e.currentTarget.style.paddingLeft='6px'; }}
                    onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.42)'; e.currentTarget.style.paddingLeft='0'; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* VTU scheme badges strip */}
        <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, padding:'16px 24px', marginBottom:32, border:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', flexShrink:0 }}>Supported Schemes</span>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['2015','2018','2021','2022','2025'].map(s => (
              <span key={s} style={{ padding:'4px 12px', borderRadius:99, background:'rgba(79,70,229,0.12)', border:'1px solid rgba(79,70,229,0.22)', color:'#A5B4FC', fontSize:'0.72rem', fontWeight:800 }}>{s}</span>
            ))}
          </div>
          <span style={{ marginLeft:'auto', fontSize:'0.65rem', color:'rgba(255,255,255,0.2)' }}>CSE · ECE · ME · EEE · CV · ISE · AIML · DS</span>
        </div>

        {/* Bottom bar */}
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', marginBottom:24 }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, paddingBottom:40 }}>
          <p style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.2)', margin:0 }}>
            © {year} Campus Connect · Built with ❤️ for VTU Students · Free Forever 🇮🇳
          </p>
          <div style={{ display:'flex', gap:20 }}>
            {[['Privacy','/privacy-policy'],['Terms','/terms'],['About','/about-us'],['Contact','/contact'],['FAQ','/faq']].map(([l, p]) => (
              <button key={p} onClick={() => nav(p)}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.76rem', color:'rgba(255,255,255,0.22)', fontFamily:"'Outfit',sans-serif", transition:'color 0.15s', padding:0 }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(165,180,252,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.22)'}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
