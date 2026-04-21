import React from 'react';
import { useNavigate } from 'react-router-dom';

const LINKS = {
  Platform: [
    ['SGPA Calculator', '/sgpa-calculator'],
    ['Upload Marks', '/upload-marks'],
    ['VTU Resources', '/vtu-resources'],
    ['Training Courses', '/training'],
    ['Coding Platform', '/coding'],
    ['AI Study Tutor', '/ai-tutor'],
    ['Peer Forum', '/forum'],
    ['Flashcards', '/flashcards'],
  ],
  Career: [
    ['Placement Drives', '/placement-drives'],
    ['Internship Programs', '/internship-programs'],
    ['Final Year Projects', '/projects'],
    ['Resume Builder', '/resume-builder'],
    ['Alumni Mentorship', '/alumni-mentorship'],
    ['Job Opportunities', '/job-opportunities'],
    ['Interview Prep', '/interview-prep'],
    ['Scholarships', '/scholarships'],
    ['Leaderboard', '/leaderboard'],
  ],
  Company: [
    ['About Us', '/about-us'],
    ['Contact', '/contact'],
    ['FAQ', '/faq'],
    ['VTU Result Checker', '/vtu-result'],
    ['VTU News', '/vtu-news'],
    ['Privacy Policy', '/privacy-policy'],
    ['Terms of Service', '/terms'],
  ],
};

const BADGES = ['VTU 2021 Scheme','VTU 2022 Scheme','Free Forever','No Ads','PWA Ready'];

export default function PublicFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background:'linear-gradient(180deg, #0A0818 0%, #0E0B2E 100%)',
      color:'white', paddingTop:80, position:'relative', overflow:'hidden',
    }}>
      {/* Glow orbs */}
      <div style={{ position:'absolute', top:0, left:'20%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, right:'15%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(16px,4vw,24px)', position:'relative', zIndex:1 }}>
        {/* Top grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr repeat(3,1fr)', gap:'clamp(24px,4vw,48px)', marginBottom:'clamp(32px,5vw,64px)' }} className="pub-footer-grid">
          {/* Brand col */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, cursor:'pointer' }} onClick={() => navigate('/')}>
              <div style={{ width:40, height:40, borderRadius:11, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', boxShadow:'0 4px 16px rgba(79,70,229,0.4)' }}>🎓</div>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.05rem' }}>Campus Connect</span>
            </div>
            <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.45)', lineHeight:1.8, maxWidth:240, marginBottom:24 }}>
              Free academic platform built for VTU students. Calculate SGPA, clear backlogs, and launch your career.
            </p>
            {/* Badges */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {BADGES.map(b => (
                <span key={b} style={{ padding:'3px 10px', borderRadius:99, border:'1px solid rgba(99,102,241,0.25)', background:'rgba(99,102,241,0.08)', fontSize:'0.65rem', fontWeight:600, color:'rgba(165,180,252,0.8)', letterSpacing:'0.05em' }}>{b}</span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h4 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(255,255,255,0.3)', marginBottom:20 }}>{section}</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {items.map(([label, path]) => (
                  <button key={path} onClick={() => navigate(path)} style={{
                    background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0,
                    fontSize:'0.875rem', color:'rgba(255,255,255,0.5)', fontFamily:"'Outfit',sans-serif",
                    transition:'color 0.15s, transform 0.15s',
                    lineHeight:1,
                  }}
                  onMouseEnter={e => { e.target.style.color='rgba(165,180,252,0.9)'; e.target.style.transform='translateX(4px)'; }}
                  onMouseLeave={e => { e.target.style.color='rgba(255,255,255,0.5)'; e.target.style.transform='translateX(0)'; }}
                  >{label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', marginBottom:32 }} />

        {/* Bottom bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, paddingBottom:40 }}>
          <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.25)' }}>
            © {year} Campus Connect · Built for VTU Students · Free Forever 🇮🇳
          </p>
          <div style={{ display:'flex', gap:24 }}>
            {[['Privacy', '/privacy-policy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([l,p]) => (
              <button key={p} onClick={() => navigate(p)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', color:'rgba(255,255,255,0.25)', fontFamily:"'Outfit',sans-serif", transition:'color 0.15s' }}
              onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.25)'}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .pub-footer-grid {
          grid-template-columns: 1.4fr repeat(3,1fr);
        }
        @media (max-width: 768px) {
          .pub-footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .pub-footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .pub-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
