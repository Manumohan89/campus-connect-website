import React, { useState } from 'react';
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
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', gap:4, marginBottom:4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= s ? colors[s] : '#E2E8F0', transition:'all 0.3s' }} />
        ))}
      </div>
      <span style={{ fontSize:'0.7rem', fontWeight:600, color:colors[s] }}>{labels[s]}</span>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', confirmPassword:'', fullName:'', branch:'', semester:'', college:'', mobile:'', yearScheme:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState(1); // 1=account, 2=academic
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const nextStep = e => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setError('Please fill all required fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setStep(2);
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await api.post('/users/register', payload);
      navigate('/verify-otp', { state: { username: form.username, devMode: res.data.devMode, devOtpHint: res.data.devOtpHint } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width:'100%', padding:'11px 14px', borderRadius:10, boxSizing:'border-box',
    border:'1.5px solid #E2E8F0', fontSize:'0.875rem', fontFamily:"'Outfit',sans-serif",
    outline:'none', transition:'border-color 0.15s,box-shadow 0.15s', color:'#0F172A', background:'white',
  };
  const focusStyle = e => { e.target.style.borderColor='#4F46E5'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)'; };
  const blurStyle  = e => { e.target.style.borderColor='#E2E8F0'; e.target.style.boxShadow='none'; };
  const labelStyle = { display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:5, letterSpacing:'0.01em' };
  const groupStyle = { marginBottom:14 };

  return (
    <>
      <PublicHeader />
      <div style={{ minHeight:'100vh', background:'#F6F8FC', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 16px' }}>
        <div style={{ width:'100%', maxWidth:520 }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', marginBottom:16, fontSize:'1.5rem', boxShadow:'0 8px 24px rgba(79,70,229,0.4)' }}>🎓</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.6rem', fontWeight:800, color:'#0F172A', letterSpacing:'-0.03em', marginBottom:6 }}>Create your account</h1>
            <p style={{ color:'#64748B', fontSize:'0.875rem' }}>Join thousands of VTU students · Free forever</p>
          </div>

          {/* Progress */}
          <div style={{ display:'flex', gap:8, marginBottom:28 }}>
            {[{n:1,label:'Account'},{n:2,label:'Academic'}].map(s => (
              <div key={s.n} style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{ height:3, borderRadius:99, background: step >= s.n ? 'linear-gradient(90deg,#4F46E5,#7C3AED)' : '#E2E8F0', transition:'background 0.3s' }} />
                <span style={{ fontSize:'0.7rem', fontWeight:600, color: step >= s.n ? '#4F46E5' : '#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Step {s.n}: {s.label}</span>
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{ background:'white', borderRadius:20, padding:'36px 32px', boxShadow:'0 8px 32px rgba(15,23,42,0.1)', border:'1px solid #E2E8F0' }}>
            {error && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'11px 16px', marginBottom:20, display:'flex', gap:10, alignItems:'center' }}>
                <span>⚠️</span><span style={{ color:'#DC2626', fontSize:'0.875rem', fontWeight:500 }}>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={nextStep}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Full Name</label>
                  <input value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="Arjun Kumar" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Username *</label>
                  <input value={form.username} onChange={e=>set('username',e.target.value)} placeholder="arjun123" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="arjun@email.com" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position:'relative' }}>
                    <input type={showPw?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min 6 characters" required style={{ ...inputStyle, paddingRight:42 }} onFocus={focusStyle} onBlur={blurStyle} />
                    <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94A3B8',fontSize:'0.9rem',padding:4 }}>{showPw?'🙈':'👁️'}</button>
                  </div>
                  <PwStrength pw={form.password} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Confirm Password *</label>
                  <input type="password" value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} placeholder="Re-enter password" required style={{ ...inputStyle, borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#EF4444' : '#E2E8F0' }} onFocus={focusStyle} onBlur={blurStyle} />
                  {form.confirmPassword && form.confirmPassword !== form.password && <p style={{ fontSize:'0.72rem', color:'#EF4444', marginTop:4, fontWeight:500 }}>✗ Passwords don't match</p>}
                  {form.confirmPassword && form.confirmPassword === form.password && <p style={{ fontSize:'0.72rem', color:'#10B981', marginTop:4, fontWeight:500 }}>✓ Passwords match</p>}
                </div>
                <button type="submit" style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', border:'none', cursor:'pointer', borderRadius:11, fontSize:'0.95rem', fontWeight:700, fontFamily:"'Outfit',sans-serif", boxShadow:'0 6px 20px rgba(79,70,229,0.35)', marginTop:4 }}>
                  Continue to Academic Details →
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={labelStyle}>Branch</label>
                    <select value={form.branch} onChange={e=>set('branch',e.target.value)} style={{ ...inputStyle }}>
                      <option value="">Select branch</option>
                      {BRANCHES.map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Semester</label>
                    <select value={form.semester} onChange={e=>set('semester',e.target.value)} style={{ ...inputStyle }}>
                      <option value="">Select sem</option>
                      {SEMS.map(s=><option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={labelStyle}>Year Scheme</label>
                    <select value={form.yearScheme} onChange={e=>set('yearScheme',e.target.value)} style={{ ...inputStyle }}>
                      <option value="">Select scheme</option>
                      {SCHEMES.map(s=><option key={s} value={s}>{s} Scheme</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Mobile (optional)</label>
                    <input value={form.mobile} onChange={e=>set('mobile',e.target.value)} placeholder="9876543210" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>College Name (optional)</label>
                  <input value={form.college} onChange={e=>set('college',e.target.value)} placeholder="RVCE Bengaluru" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>

                <div style={{ display:'flex', gap:10, marginTop:8 }}>
                  <button type="button" onClick={()=>{setStep(1);setError('');}} style={{ flex:1, padding:'13px', background:'#F1F5F9', color:'#374151', border:'none', cursor:'pointer', borderRadius:11, fontSize:'0.9rem', fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>← Back</button>
                  <button type="submit" disabled={loading} style={{ flex:2, padding:'13px', background: loading?'#94A3B8':'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', border:'none', cursor: loading?'not-allowed':'pointer', borderRadius:11, fontSize:'0.95rem', fontWeight:700, fontFamily:"'Outfit',sans-serif", boxShadow: loading?'none':'0 6px 20px rgba(79,70,229,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {loading ? <><span style={{ width:18,height:18,border:'2.5px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',display:'block',animation:'spin 0.8s linear infinite' }}/> Creating...</> : 'Create Account →'}
                  </button>
                </div>
              </form>
            )}

            <p style={{ textAlign:'center', marginTop:20, fontSize:'0.85rem', color:'#64748B' }}>
              Already have an account? <Link to="/login" style={{ color:'#4F46E5', fontWeight:700, textDecoration:'none' }}>Sign in</Link>
            </p>
            <p style={{ textAlign:'center', marginTop:10, fontSize:'0.75rem', color:'#94A3B8', lineHeight:1.5 }}>
              By signing up, you agree to our{' '}
              <Link to="/terms" style={{ color:'#64748B' }}>Terms</Link> and{' '}
              <Link to="/privacy-policy" style={{ color:'#64748B' }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
