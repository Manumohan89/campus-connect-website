import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import api from '../utils/api';

const STATS = [
  { val: '12k+', label: 'Students' }, { val: '45+', label: 'Courses' },
  { val: '500+', label: 'Resources' }, { val: '2.4k+', label: 'Certs issued' },
];
const FEATURES = [
  { e: '📊', t: 'SGPA auto-extracted from PDF in seconds' },
  { e: '💻', t: 'LeetCode-style coding — Python, Java, C++' },
  { e: '🤖', t: 'AI Tutor answers any VTU subject question' },
  { e: '🏆', t: 'Leaderboard: CGPA + coding + courses rank' },
  { e: '📚', t: 'Notes & QPs for every VTU scheme 2015–2022' },
];

export default function Login() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [fidx, setFidx]         = useState(0);
  const expired = new URLSearchParams(location.search).get('expired');

  useEffect(() => {
    const t  = setTimeout(() => setMounted(true), 50);
    const iv = setInterval(() => setFidx(i => (i + 1) % FEATURES.length), 3400);
    return () => { clearTimeout(t); clearInterval(iv); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await api.post('/users/login', form);
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('role', r.data.role || 'user');
      const next = location.state?.from?.pathname;
      navigate(next && next !== '/login' ? next : '/dashboard');
    } catch (err) {
      const d = err.response?.data;
      // If account not verified, redirect to OTP page
      if (d?.requiresOtp) {
        navigate('/verify-otp', { state: { username: d.username } });
        return;
      }
      setError(d?.error || d?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  const inp = {
    width:'100%', padding:'13px 16px', borderRadius:11, boxSizing:'border-box',
    border:'1.5px solid #E2E8F0', fontSize:'0.9rem', fontFamily:"'Outfit',sans-serif",
    outline:'none', transition:'border-color .18s, box-shadow .18s',
    color:'var(--text-1,#0F172A)', background:'var(--bg-card,white)' };

  return (<>
    <PublicHeader />
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;600;700&display=swap');
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes float-orb{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      @keyframes pulse-ring{0%{transform:scale(.8);opacity:.7}70%{transform:scale(1.7);opacity:0}100%{transform:scale(1.7);opacity:0}}
      @keyframes feat-slide{0%{opacity:0;transform:translateY(8px)}12%{opacity:1;transform:translateY(0)}88%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}
      input:focus{border-color:#4F46E5!important;box-shadow:0 0 0 3px rgba(79,70,229,0.13)!important}
      .lgrid{display:grid;grid-template-columns:1fr 1fr;max-width:980px;width:100%}
      .lleft{display:flex}
      @media(max-width:700px){.lgrid{grid-template-columns:1fr}.lleft{display:none!important}.lright{padding:40px 28px!important}}
    `}</style>

    <div style={{minHeight:'100vh',background:'var(--bg-page,#F0F2F8)',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 16px'}}>
      <div className="lgrid" style={{
        gap:0,borderRadius:24,overflow:'hidden',
        boxShadow:'0 32px 80px rgba(15,23,42,0.18)',
        opacity:mounted?1:0,
        transform:mounted?'scale(1) translateY(0)':'scale(.97) translateY(16px)',
        transition:'opacity .45s ease, transform .45s cubic-bezier(.4,0,.2,1)' }}>

        {/* LEFT */}
        <div className="lleft" style={{
          background:'linear-gradient(145deg,#0A0818 0%,#1E1B4B 55%,#0F2449 100%)',
          padding:'52px 44px',flexDirection:'column',justifyContent:'space-between',
          position:'relative',overflow:'hidden' }}>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}}/>
          <div style={{position:'absolute',top:'15%',left:'50%',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)',animation:'float-orb 6s ease-in-out infinite',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:'15%',right:'5%',width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)',animation:'float-orb 8s ease-in-out infinite 1.5s',pointerEvents:'none'}}/>

          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:44}}>
              <div style={{width:40,height:40,borderRadius:11,background:'linear-gradient(135deg,#4F46E5,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.25rem'}}>🎓</div>
              <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'1rem',color:'white'}}>Campus Connect</span>
            </div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(1.35rem,2.4vw,1.85rem)',fontWeight:800,color:'white',letterSpacing:'-0.03em',lineHeight:1.22,marginBottom:12}}>
              Your complete VTU academic hub
            </h2>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.875rem',lineHeight:1.7,marginBottom:36}}>
              Everything you need to calculate, learn, and land your first job — all free.
            </p>

            <div style={{background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.28)',borderRadius:14,padding:'16px 20px',marginBottom:32,minHeight:72,position:'relative',overflow:'hidden'}}>
              <div style={{fontSize:'1.4rem',marginBottom:7}}>{FEATURES[fidx].e}</div>
              <p key={fidx} style={{color:'rgba(255,255,255,0.8)',fontSize:'0.875rem',lineHeight:1.65,margin:0,animation:'feat-slide 3.4s ease both'}}>
                {FEATURES[fidx].t}
              </p>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{position:'relative',width:10,height:10}}>
                <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'#10B981',animation:'pulse-ring 1.8s ease-out infinite'}}/>
                <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'#10B981'}}/>
              </div>
              <span style={{color:'rgba(255,255,255,0.5)',fontSize:'0.77rem'}}>Students active right now</span>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,position:'relative',zIndex:1}}>
            {STATS.map(({val,label}) => (
              <div key={label} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'14px 16px',textAlign:'center'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:800,color:'white',lineHeight:1}}>{val}</div>
                <div style={{fontSize:'0.67rem',color:'rgba(255,255,255,0.4)',marginTop:4,fontWeight:500}}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lright" style={{background:'var(--bg-card,white)',padding:'52px 44px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          {expired && (
            <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:'0.85rem',color:'#92400E'}}>
              ⏰ Your session expired. Please sign in again.
            </div>
          )}
          <div style={{marginBottom:32}}>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.75rem',fontWeight:800,color:'var(--text-1,#0F172A)',letterSpacing:'-0.03em',marginBottom:6}}>Welcome back</h1>
            <p style={{color:'#64748B',fontSize:'0.88rem'}}>Sign in to your Campus Connect account</p>
          </div>

          {error && (
            <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
              <span>⚠️</span>
              <span style={{color:'#DC2626',fontSize:'0.875rem',fontWeight:500}}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:18}}>
              <label style={{display:'block',fontSize:'0.78rem',fontWeight:700,color:'#374151',marginBottom:6,letterSpacing:'0.01em'}}>Email address</label>
              <input value={form.email} onChange={e=>set('email',e.target.value)} type="email" placeholder="your@email.com" required autoComplete="email" style={inp}/>
            </div>
            <div style={{marginBottom:26}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <label style={{fontSize:'0.78rem',fontWeight:700,color:'#374151',letterSpacing:'0.01em'}}>Password</label>
                <Link to="/forgot-password" style={{fontSize:'0.78rem',color:'#4F46E5',fontWeight:600,textDecoration:'none'}}>Forgot password?</Link>
              </div>
              <div style={{position:'relative'}}>
                <input value={form.password} onChange={e=>set('password',e.target.value)} type={showPw?'text':'password'} placeholder="Enter your password" required autoComplete="current-password" style={{...inp,paddingRight:46}}/>
                <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94A3B8',fontSize:'1rem',padding:4,lineHeight:1}}>{showPw?'🙈':'👁️'}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%',padding:'13px',borderRadius:11,border:'none',
              cursor:loading?'not-allowed':'pointer',
              background:loading?'#94A3B8':'linear-gradient(135deg,#4F46E5,#7C3AED)',
              color:'white',fontSize:'0.95rem',fontWeight:700,
              fontFamily:"'Outfit',sans-serif",
              boxShadow:loading?'none':'0 6px 20px rgba(79,70,229,0.35)',
              transition:'all .22s cubic-bezier(0.34,1.56,0.64,1)',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(79,70,229,0.45)';}}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=loading?'none':'0 6px 20px rgba(79,70,229,0.35)';}}
            >
              {loading?<><span style={{width:18,height:18,border:'2.5px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}}/> Signing in…</>:'Sign In →'}
            </button>
          </form>

          <p style={{textAlign:'center',marginTop:24,fontSize:'0.875rem',color:'#64748B'}}>
            Don't have an account?{' '}
            <Link to="/register" style={{color:'#4F46E5',fontWeight:700,textDecoration:'none'}}>Create one free →</Link>
          </p>
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'22px 0 16px'}}>
            <div style={{flex:1,height:1,background:'#E2E8F0'}}/>
            <span style={{fontSize:'0.75rem',color:'#94A3B8',fontWeight:500}}>or quick access</span>
            <div style={{flex:1,height:1,background:'#E2E8F0'}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[['📊 SGPA Calc','/sgpa-calculator'],['🎓 VTU Results','/vtu-result']].map(([label,path])=>(
              <button key={path} onClick={()=>navigate(path)} style={{padding:'10px',background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:10,cursor:'pointer',fontSize:'0.8rem',fontWeight:600,color:'#374151',fontFamily:"'Outfit',sans-serif",transition:'all .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='#EEF2FF';e.currentTarget.style.borderColor='#C7D2FE';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#F8FAFC';e.currentTarget.style.borderColor='#E2E8F0';}}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>);
}
