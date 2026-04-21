import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import api from '../utils/api';

const BRANCHES = ['CSE','ISE','ECE','ME','CV','EEE','AIML','DS','CH','BT'];
const SCHEMES  = ['2022','2021','2023','2018','2015'];
const SEMS     = ['1','2','3','4','5','6','7','8'];

function PwStrength({ pw }) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const colors = ['','#EF4444','#F59E0B','#F59E0B','#10B981','#059669'];
  const labels = ['','Weak','Fair','Good','Strong','Very Strong'];
  if (!pw) return null;
  return (
    <div style={{marginTop:6}}>
      <div style={{display:'flex',gap:4,marginBottom:4}}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=s?colors[s]:'#E2E8F0',transition:'all .3s'}}/>
        ))}
      </div>
      <span style={{fontSize:'0.7rem',fontWeight:600,color:colors[s]}}>{labels[s]}</span>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username:'', email:'', password:'', confirmPassword:'',
    fullName:'', branch:'', semester:'', college:'', mobile:'', yearScheme:'',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [step, setStep]       = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const nextStep = e => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setError('Please fill all required fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setError(''); setStep(2);
  };

  // ── Register → send OTP email → redirect to verify page ──────────────────
  const handleRegister = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { confirmPassword, ...raw } = form;
      const payload = {
        ...raw,
        semester:   raw.semester   ? raw.semester.replace('Sem ', '')     : '',
        yearScheme: raw.yearScheme ? raw.yearScheme.replace(' Scheme', '') : '',
      };
      const res = await api.post('/users/register', payload);
      if (res.data.requiresOtp) {
        // Email configured — redirect to OTP verification page
        navigate('/verify-otp', { state: { username: res.data.username } });
      } else {
        // Dev mode (no EMAIL_USER set) — auto login directly
        const r = await api.post('/users/login', { email: form.email, password: form.password });
        localStorage.setItem('token', r.data.token);
        localStorage.setItem('role', r.data.role || 'user');
        navigate('/dashboard');
      }
    } catch (err) {
      const d = err.response?.data;
      const detail = d?.details?.[0];
      setError(detail ? `${detail.field}: ${detail.message}` : d?.message || d?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inp = {
    width:'100%', padding:'11px 14px', borderRadius:10, boxSizing:'border-box',
    border:'1.5px solid #E2E8F0', fontSize:'0.875rem', fontFamily:"'Outfit',sans-serif",
    outline:'none', transition:'border-color .15s, box-shadow .15s',
    color:'var(--text-1,#0F172A)', background:'var(--bg-card,white)',
  };
  const sel = { ...inp, cursor: 'pointer' };
  const lbl = { display:'block', fontSize:'0.75rem', fontWeight:700, color:'#374151', marginBottom:5, letterSpacing:'0.01em' };
  const grp = { marginBottom:13 };

  return (<>
    <PublicHeader />
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;600;700&display=swap');
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes slide-in{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
      input:focus,select:focus{border-color:#4F46E5!important;box-shadow:0 0 0 3px rgba(79,70,229,0.12)!important}
      .r2col{display:grid;grid-template-columns:1fr 1fr;gap:13px}
      @media(max-width:480px){.r2col{grid-template-columns:1fr}}
    `}</style>

    <div style={{minHeight:'100vh',background:'var(--bg-page,#F0F2F8)',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 16px'}}>
      <div style={{
        width:'100%',maxWidth:520,
        opacity:mounted?1:0,
        transform:mounted?'translateY(0)':'translateY(18px)',
        transition:'opacity .45s ease, transform .45s cubic-bezier(.4,0,.2,1)',
      }}>
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#4F46E5,#7C3AED)',marginBottom:14,fontSize:'1.5rem',boxShadow:'0 8px 24px rgba(79,70,229,0.4)'}}>🎓</div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.6rem',fontWeight:800,color:'var(--text-1,#0F172A)',letterSpacing:'-0.03em',marginBottom:5}}>Create your account</h1>
          <p style={{color:'#64748B',fontSize:'0.875rem'}}>Join thousands of VTU students · Free forever</p>
        </div>

        {/* Step progress */}
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {[{n:1,label:'Account'},{n:2,label:'Academic'}].map(s => (
            <div key={s.n} style={{flex:1,display:'flex',flexDirection:'column',gap:5}}>
              <div style={{height:3,borderRadius:99,background:step>=s.n?'linear-gradient(90deg,#4F46E5,#7C3AED)':'#E2E8F0',transition:'background .3s'}}/>
              <span style={{fontSize:'0.68rem',fontWeight:700,color:step>=s.n?'#4F46E5':'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em'}}>Step {s.n}: {s.label}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{background:'var(--bg-card,white)',borderRadius:20,padding:'34px 30px',boxShadow:'0 8px 32px rgba(15,23,42,0.1)',border:'1px solid #E2E8F0'}}>

          {error && (
            <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:9,padding:'11px 14px',marginBottom:18,display:'flex',alignItems:'center',gap:8}}>
              <span>⚠️</span>
              <span style={{color:'#DC2626',fontSize:'0.85rem',fontWeight:500}}>{error}</span>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={nextStep} style={{animation:'slide-in .3s ease'}}>
              <div style={grp}>
                <label style={lbl}>Full Name *</label>
                <input value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="e.g. Arjun Kumar" style={inp}/>
              </div>
              <div style={grp}>
                <label style={lbl}>Username * <span style={{color:'#94A3B8',fontWeight:400}}>(used to login)</span></label>
                <input value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/\s/g,''))} placeholder="arjunkumar" required style={inp}/>
              </div>
              <div style={grp}>
                <label style={lbl}>Email *</label>
                <input value={form.email} onChange={e=>set('email',e.target.value)} type="email" placeholder="you@example.com" required style={inp}/>
              </div>
              <div style={grp}>
                <label style={lbl}>Password *</label>
                <div style={{position:'relative'}}>
                  <input value={form.password} onChange={e=>set('password',e.target.value)} type={showPw?'text':'password'} placeholder="Min. 6 characters" required style={{...inp,paddingRight:44}}/>
                  <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:'absolute',right:11,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94A3B8',fontSize:'1rem',padding:4,lineHeight:1}}>{showPw?'🙈':'👁️'}</button>
                </div>
                <PwStrength pw={form.password}/>
              </div>
              <div style={grp}>
                <label style={lbl}>Confirm Password *</label>
                <input value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} type="password" placeholder="Repeat your password" required style={{...inp,borderColor:form.confirmPassword&&form.confirmPassword!==form.password?'#EF4444':'#E2E8F0'}}/>
                {form.confirmPassword && form.confirmPassword !== form.password && <span style={{fontSize:'0.72rem',color:'#EF4444',marginTop:3,display:'block'}}>Passwords don't match</span>}
              </div>
              <div style={grp}>
                <label style={lbl}>Mobile (optional)</label>
                <input value={form.mobile} onChange={e=>set('mobile',e.target.value)} placeholder="10-digit number" maxLength={10} style={inp}/>
              </div>
              <button type="submit" style={{width:'100%',padding:'13px',borderRadius:11,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#4F46E5,#7C3AED)',color:'white',fontSize:'0.9rem',fontWeight:700,fontFamily:"'Outfit',sans-serif",boxShadow:'0 6px 20px rgba(79,70,229,0.3)',transition:'all .2s',marginTop:4}}>
                Next: Academic Details →
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleRegister} style={{animation:'slide-in .3s ease'}}>
              <div className="r2col">
                <div style={grp}>
                  <label style={lbl}>Branch</label>
                  <select value={form.branch} onChange={e=>set('branch',e.target.value)} style={sel}>
                    <option value="">Select branch</option>
                    {BRANCHES.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div style={grp}>
                  <label style={lbl}>Semester</label>
                  <select value={form.semester} onChange={e=>set('semester',e.target.value)} style={sel}>
                    <option value="">Select sem</option>
                    {SEMS.map(s=><option key={s}>Sem {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="r2col">
                <div style={grp}>
                  <label style={lbl}>VTU Scheme</label>
                  <select value={form.yearScheme} onChange={e=>set('yearScheme',e.target.value)} style={sel}>
                    <option value="">Select scheme</option>
                    {SCHEMES.map(s=><option key={s}>{s} Scheme</option>)}
                  </select>
                </div>
                <div style={grp}>
                  <label style={lbl}>College (optional)</label>
                  <input value={form.college} onChange={e=>set('college',e.target.value)} placeholder="College name" style={inp}/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
                <button type="button" onClick={()=>{setStep(1);setError('');}} style={{padding:'12px',borderRadius:11,border:'1.5px solid #E2E8F0',cursor:'pointer',background:'var(--bg-card,white)',color:'#374151',fontSize:'0.9rem',fontWeight:600,fontFamily:"'Outfit',sans-serif",transition:'all .2s'}}>
                  ← Back
                </button>
                <button type="submit" disabled={loading} style={{
                  padding:'12px',borderRadius:11,border:'none',
                  cursor:loading?'not-allowed':'pointer',
                  background:loading?'#94A3B8':'linear-gradient(135deg,#4F46E5,#7C3AED)',
                  color:'white',fontSize:'0.9rem',fontWeight:700,
                  fontFamily:"'Outfit',sans-serif",
                  boxShadow:loading?'none':'0 6px 20px rgba(79,70,229,0.3)',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',
                }}>
                  {loading?<><span style={{width:16,height:16,border:'2.5px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}}/> Creating…</>:'Create Account ✓'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{textAlign:'center',marginTop:20,fontSize:'0.875rem',color:'#64748B'}}>
          Already have an account?{' '}
          <Link to="/login" style={{color:'#4F46E5',fontWeight:700,textDecoration:'none'}}>Sign in →</Link>
        </p>
      </div>
    </div>
  </>);
}
