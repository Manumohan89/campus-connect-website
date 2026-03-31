import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import api from '../utils/api';

const TIPS = [
  { emoji:'📊', text:'Calculate SGPA in 10 seconds by uploading your marks card PDF' },
  { emoji:'⚠️', text:'Free backlog clearing courses matched to VTU syllabus' },
  { emoji:'🤖', text:'AI Study Tutor answers any VTU subject question instantly' },
  { emoji:'💻', text:'LeetCode-style coding platform with Python, Java, C, C#' },
  { emoji:'🏆', text:'See your rank across CGPA, coding, and courses on the leaderboard' },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', password:'' });
  const [error, setError] = useState('');
  const [notVerified, setNotVerified] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [showPw, setShowPw] = useState(false);

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleLogin = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await api.post('/users/login', form);
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('role', r.data.role || 'user');
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      if (d?.code === 'EMAIL_NOT_VERIFIED') { setNotVerified(form.username); }
      else setError(d?.error || d?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  const tip = TIPS[tipIdx];

  return (
    <>
      <PublicHeader />
      <div style={{ minHeight:'100vh', background:'#F6F8FC', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px' }}>
        <div style={{ width:'100%', maxWidth:960, display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, borderRadius:24, overflow:'hidden', boxShadow:'0 32px 80px rgba(15,23,42,0.18)' }}>

          {/* ── Left visual panel ── */}
          <div style={{
            background:'linear-gradient(145deg,#0A0818 0%,#1E1B4B 60%,#0F2449 100%)',
            padding:'56px 48px', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden',
          }}>
            {/* Grid */}
            <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />
            {/* Glow */}
            <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translateX(-50%)', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />

            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:48 }}>
                <div style={{ width:40, height:40, borderRadius:11, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>🎓</div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1rem', color:'white' }}>Campus Connect</span>
              </div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.8rem', fontWeight:800, color:'white', letterSpacing:'-0.03em', lineHeight:1.25, marginBottom:12 }}>
                Your complete VTU academic hub
              </h2>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:36 }}>
                Everything you need to calculate, learn, and land your first job — all free.
              </p>

              {/* Feature tip */}
              <div style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:14, padding:'16px 20px', marginBottom:36 }}>
                <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{tip.emoji}</div>
                <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.875rem', lineHeight:1.65, margin:0 }}>{tip.text}</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, position:'relative', zIndex:1 }}>
              {[['12k+','Students'],['45+','Courses'],['500+','Resources'],['2400+','Certs']].map(([v,l]) => (
                <div key={l} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:800, color:'white', lineHeight:1 }}>{v}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)', marginTop:4, fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div style={{ background:'white', padding:'56px 48px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ marginBottom:36 }}>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.75rem', fontWeight:800, color:'#0F172A', letterSpacing:'-0.03em', marginBottom:6 }}>Welcome back</h1>
              <p style={{ color:'#64748B', fontSize:'0.9rem' }}>Sign in to your Campus Connect account</p>
            </div>

            {error && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:'1rem' }}>⚠️</span>
                <span style={{ color:'#DC2626', fontSize:'0.875rem', fontWeight:500 }}>{error}</span>
              </div>
            )}

            {notVerified && (
              <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
                <p style={{ color:'#92400E', fontSize:'0.875rem', margin:'0 0 8px' }}>📧 Email not verified yet.</p>
                <button onClick={async () => {
                  try {
                    const r = await api.post('/users/resend-otp', { username: notVerified });
                    navigate('/verify-otp', { state: { username: notVerified, devMode: r.data.devMode } });
                  } catch(e) { setError(e.response?.data?.error || 'Failed to send OTP'); }
                }} style={{ background:'#F59E0B', color:'white', border:'none', cursor:'pointer', padding:'8px 16px', borderRadius:8, fontSize:'0.82rem', fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>
                  Verify Now →
                </button>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Username */}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:'#374151', marginBottom:6, letterSpacing:'0.01em' }}>Username</label>
                <input value={form.username} onChange={e => set('username',e.target.value)}
                  placeholder="Enter your username" required disabled={loading}
                  style={{
                    width:'100%', padding:'12px 16px', borderRadius:10, boxSizing:'border-box',
                    border:'1.5px solid #E2E8F0', fontSize:'0.9rem', fontFamily:"'Outfit',sans-serif",
                    outline:'none', transition:'border-color 0.15s, box-shadow 0.15s', color:'#0F172A',
                    background: loading ? '#F8FAFC' : 'white',
                  }}
                  onFocus={e => { e.target.style.borderColor='#4F46E5'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor='#E2E8F0'; e.target.style.boxShadow='none'; }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', letterSpacing:'0.01em' }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize:'0.8rem', color:'#4F46E5', fontWeight:600 }}>Forgot password?</Link>
                </div>
                <div style={{ position:'relative' }}>
                  <input value={form.password} onChange={e => set('password',e.target.value)}
                    placeholder="Enter your password" type={showPw ? 'text' : 'password'} required disabled={loading}
                    style={{
                      width:'100%', padding:'12px 44px 12px 16px', borderRadius:10, boxSizing:'border-box',
                      border:'1.5px solid #E2E8F0', fontSize:'0.9rem', fontFamily:"'Outfit',sans-serif",
                      outline:'none', transition:'border-color 0.15s, box-shadow 0.15s', color:'#0F172A',
                    }}
                    onFocus={e => { e.target.style.borderColor='#4F46E5'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor='#E2E8F0'; e.target.style.boxShadow='none'; }}
                  />
                  <button type="button" onClick={() => setShowPw(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8', fontSize:'1rem', padding:4 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{
                width:'100%', padding:'13px', borderRadius:11, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#94A3B8' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                color:'white', fontSize:'0.95rem', fontWeight:700, fontFamily:"'Outfit',sans-serif",
                boxShadow: loading ? 'none' : '0 6px 24px rgba(79,70,229,0.35)',
                transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 10px 32px rgba(79,70,229,0.45)'; } }}
              onMouseLeave={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow=loading?'none':'0 6px 24px rgba(79,70,229,0.35)'; }}
              >
                {loading ? (
                  <><span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'block', animation:'spin 0.8s linear infinite' }} /> Signing in...</>
                ) : 'Sign In →'}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:24, fontSize:'0.875rem', color:'#64748B' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color:'#4F46E5', fontWeight:700, textDecoration:'none' }}>Sign up free →</Link>
            </p>

            {/* Divider + quick access */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0 16px' }}>
              <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
              <span style={{ fontSize:'0.78rem', color:'#94A3B8', fontWeight:500 }}>or try</span>
              <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <button onClick={() => navigate('/sgpa-calculator')} style={{ padding:'10px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10, cursor:'pointer', fontSize:'0.8rem', fontWeight:600, color:'#374151', fontFamily:"'Outfit',sans-serif", transition:'all 0.15s' }}
              onMouseEnter={e => e.target.style.background='#EEF2FF'}
              onMouseLeave={e => e.target.style.background='#F8FAFC'}
              >📊 SGPA Calculator</button>
              <button onClick={() => navigate('/vtu-result')} style={{ padding:'10px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10, cursor:'pointer', fontSize:'0.8rem', fontWeight:600, color:'#374151', fontFamily:"'Outfit',sans-serif", transition:'all 0.15s' }}
              onMouseEnter={e => e.target.style.background='#EEF2FF'}
              onMouseLeave={e => e.target.style.background='#F8FAFC'}
              >🎓 VTU Results</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
