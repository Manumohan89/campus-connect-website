import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { label:'Home', path:'/' },
  { label:'About', path:'/about-us' },
  { label:'SGPA Calc', path:'/sgpa-calculator' },
  { label:'VTU Results', path:'/vtu-result' },
  { label:'Resources', path:'/vtu-resources' },
  { label:'Internships', path:'/internship-programs' },
  { label:'Projects', path:'/projects' },
  { label:'FAQ', path:'/faq' },
];

export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isActive = p => location.pathname === p;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header style={{
        position:'sticky', top:0, zIndex:1000,
        background: scrolled
          ? 'rgba(10,8,30,0.92)'
          : 'linear-gradient(135deg,#0A0818 0%,#0E0B2E 60%,#0A1628 100%)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        transition:'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>

          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', flexShrink:0 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:'linear-gradient(135deg,#4F46E5,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.2rem', boxShadow:'0 4px 16px rgba(79,70,229,0.4)',
            }}>🎓</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1rem', color:'white', letterSpacing:'-0.02em' }}>
              Campus Connect
            </span>
          </div>

          {/* Desktop nav */}
          <nav style={{ display:'flex', gap:2, alignItems:'center' }}>
            {NAV.map(n => (
              <button key={n.path} onClick={() => navigate(n.path)} style={{
                background: isActive(n.path) ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: isActive(n.path) ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                color: isActive(n.path) ? '#818CF8' : 'rgba(255,255,255,0.7)',
                cursor:'pointer', padding:'7px 14px', borderRadius:8,
                fontSize:'0.855rem', fontWeight: isActive(n.path) ? 700 : 500,
                fontFamily:"'Outfit',sans-serif",
                transition:'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!isActive(n.path)) { e.target.style.background='rgba(255,255,255,0.06)'; e.target.style.color='white'; } }}
              onMouseLeave={e => { if (!isActive(n.path)) { e.target.style.background='transparent'; e.target.style.color='rgba(255,255,255,0.7)'; } }}
              >{n.label}</button>
            ))}
          </nav>

          {/* Auth buttons */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={() => navigate('/login')} className="pub-login-btn" style={{
              background:'transparent', color:'rgba(255,255,255,0.8)',
              border:'1px solid rgba(255,255,255,0.18)', cursor:'pointer',
              padding:'8px 20px', borderRadius:9, fontSize:'0.875rem',
              fontWeight:600, fontFamily:"'Outfit',sans-serif",
              transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.background='rgba(255,255,255,0.08)'; e.target.style.borderColor='rgba(255,255,255,0.35)'; }}
            onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.borderColor='rgba(255,255,255,0.18)'; }}
            >Login</button>
            <button onClick={() => navigate('/register')} className="pub-register-btn" style={{
              background:'linear-gradient(135deg,#4F46E5,#7C3AED)',
              color:'white', border:'none', cursor:'pointer',
              padding:'8px 20px', borderRadius:9, fontSize:'0.875rem',
              fontWeight:700, fontFamily:"'Outfit',sans-serif",
              boxShadow:'0 4px 16px rgba(79,70,229,0.35)',
              transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 8px 24px rgba(79,70,229,0.5)'; }}
            onMouseLeave={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 4px 16px rgba(79,70,229,0.35)'; }}
            >Sign Up Free</button>

            {/* Mobile hamburger */}
            <button onClick={() => setOpen(true)} style={{ display:'none', background:'transparent', border:'none', color:'white', cursor:'pointer', padding:8, lineHeight:1 }} className="mobile-menu-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:2000 }}>
          <div onClick={() => setOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} />
          <div style={{
            position:'absolute', right:0, top:0, bottom:0, width:300,
            background:'linear-gradient(180deg,#0E0B2E,#16103F)',
            borderLeft:'1px solid rgba(255,255,255,0.08)',
            display:'flex', flexDirection:'column',
            animation:'slideInRight 0.3s ease both',
          }}>
            {/* Drawer header */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'white', fontSize:'0.95rem' }}>Menu</span>
              <button onClick={() => setOpen(false)} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'white', cursor:'pointer', width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            {/* Nav items */}
            <div style={{ flex:1, padding:'16px 12px', overflowY:'auto' }}>
              {NAV.map(n => (
                <button key={n.path} onClick={() => { navigate(n.path); setOpen(false); }} style={{
                  width:'100%', textAlign:'left', display:'block',
                  background: isActive(n.path) ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: isActive(n.path) ? '#818CF8' : 'rgba(255,255,255,0.75)',
                  border:'none', cursor:'pointer', padding:'12px 16px',
                  borderRadius:10, fontSize:'0.9rem', fontWeight: isActive(n.path) ? 700 : 500,
                  fontFamily:"'Outfit',sans-serif", marginBottom:4,
                  transition:'all 0.15s',
                }}>
                  {n.label}
                </button>
              ))}
            </div>
            <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', gap:10 }}>
              <button onClick={() => { navigate('/login'); setOpen(false); }} style={{ background:'transparent', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.2)', cursor:'pointer', padding:'12px', borderRadius:10, fontSize:'0.9rem', fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>Login</button>
              <button onClick={() => { navigate('/register'); setOpen(false); }} style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', border:'none', cursor:'pointer', padding:'12px', borderRadius:10, fontSize:'0.9rem', fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>Sign Up Free →</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          nav { display: none !important; }
          .pub-login-btn { display: none !important; }
          .pub-register-btn { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 400px) {
          .pub-header-logo-text { display: none; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
