import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

const SEM_COLORS = ['#6366F1','#8B5CF6','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6'];
const gradeFromSgpa = v => {
  const n = parseFloat(v);
  if (n >= 9) return { g:'Distinction', bg:'#D1FAE5', fg:'#059669' };
  if (n >= 8) return { g:'1st Class Dist.', bg:'#DBEAFE', fg:'#1E40AF' };
  if (n >= 7) return { g:'First Class', bg:'#EDE9FE', fg:'#5B21B6' };
  if (n >= 6) return { g:'Second Class', bg:'#FEF9C3', fg:'#854D0E' };
  return { g:'Below Second', bg:'#FEE2E2', fg:'#991B1B' };
};

export default function CGPATracker() {
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ semester:'', sgpa:'', credits:'' });
  const [deleting, setDeleting] = useState(null);
  const [snack, setSnack] = useState('');
  const [vis, setVis] = useState(false);
  const [goalSgpa, setGoalSgpa] = useState('');
  const chartRef = useRef(); const chartInst = useRef();
  const nav = useNavigate();

  const load = () => Promise.all([api.get('/features/sgpa-history'), api.get('/users/profile')])
    .then(([h, p]) => { setHistory(h.data||[]); setProfile(p.data); })
    .catch(() => {})
    .finally(() => { setLoading(false); setTimeout(() => setVis(true), 80); });
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!history.length || !chartRef.current) return;
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; }
    const sorted = [...history].sort((a,b) => parseInt(a.semester)-parseInt(b.semester));
    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(99,102,241,0.25)');
    gradient.addColorStop(1, 'rgba(99,102,241,0)');
    chartInst.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: sorted.map(h => `Sem ${h.semester}`),
        datasets: [{
          label: 'SGPA', data: sorted.map(h => parseFloat(h.sgpa)),
          borderColor: '#6366F1', backgroundColor: gradient,
          borderWidth: 3, pointRadius: 7, pointHoverRadius: 10,
          pointBackgroundColor: SEM_COLORS,
          pointBorderColor: '#fff', pointBorderWidth: 2.5,
          tension: 0.4, fill: true,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E293B', titleFont: { family:"'Syne',sans-serif", size:13 },
            bodyFont: { family:"'Outfit',sans-serif" }, padding: 14, cornerRadius: 12,
            callbacks: { label: ctx => ` SGPA: ${ctx.parsed.y.toFixed(2)}` }
          },
        },
        scales: {
          x: { grid:{ display:false }, ticks:{ font:{ family:"'Outfit',sans-serif", size:12 }, color:'#94A3B8' } },
          y: { min:0, max:10, grid:{ color:'#F1F5F9' }, ticks:{ font:{ family:"'Outfit',sans-serif", size:12 }, color:'#94A3B8', stepSize:2 } },
        },
      },
    });
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [history]);

  const cgpa = history.length
    ? (history.reduce((s,h) => s + parseFloat(h.sgpa)*(h.credits||20), 0) / history.reduce((s,h) => s + (h.credits||20), 0)).toFixed(2)
    : (parseFloat(profile?.cgpa)||0).toFixed(2);
  const cgpaNum = parseFloat(cgpa)||0;
  const cgpaColor = cgpaNum>=8?'#10B981':cgpaNum>=6?'#F59E0B':cgpaNum>0?'#EF4444':'#94A3B8';

  const handleAdd = async () => {
    if (!form.semester || !form.sgpa) return;
    try {
      await api.post('/features/sgpa-history', { semester:form.semester, sgpa:parseFloat(form.sgpa), credits:parseFloat(form.credits)||20 });
      setSnack('✅ Semester added!'); setDialog(false); setForm({ semester:'', sgpa:'', credits:'' }); load();
    } catch (e) { setSnack(e.response?.data?.error||'Failed to add semester'); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try { await api.delete(`/features/sgpa-history/${id}`); setSnack('Semester removed'); load(); }
    catch { setSnack('Delete failed'); }
    setDeleting(null);
  };

  // Goal calculator
  const requiredSgpa = () => {
    if (!goalSgpa || !history.length) return null;
    const target = parseFloat(goalSgpa);
    const totalCr = history.reduce((s,h) => s + (h.credits||20), 0);
    const totalGP = history.reduce((s,h) => s + parseFloat(h.sgpa)*(h.credits||20), 0);
    const semCr = 20;
    const needed = (target*(totalCr+semCr) - totalGP) / semCr;
    return needed > 10 ? '>10 (not achievable)' : needed < 0 ? 'Already achieved!' : needed.toFixed(2);
  };

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#F4F6FB' }}>
      <Header />
      <div style={{ flex:1, maxWidth:1100, margin:'0 auto', padding:'32px 24px', width:'100%' }}>
        {[180,360,280].map((h,i) => <div key={i} style={{ height:h, borderRadius:22, background:'linear-gradient(90deg,#E2E8F0 0%,#F1F5F9 50%,#E2E8F0 100%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s ease infinite', marginBottom:20 }} />)}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#F4F6FB', fontFamily:"'Outfit',sans-serif" }}>
      <Header />

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#06030F,#1E1B4B,#0D1B35)', padding:'36px 24px 42px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:20 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:900, color:'white', letterSpacing:'-0.03em', margin:'0 0 8px' }}>📈 CGPA Tracker</h1>
            <p style={{ color:'rgba(255,255,255,0.45)', margin:0, fontSize:'0.9rem' }}>Track your semester SGPA history & visualise your academic growth</p>
          </div>
          <button onClick={() => setDialog(true)}
            style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', border:'none', cursor:'pointer', padding:'12px 24px', borderRadius:13, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.88rem', boxShadow:'0 6px 20px rgba(79,70,229,0.4)', transition:'all 0.2s', whiteSpace:'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(79,70,229,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(79,70,229,0.4)'; }}>
            + Add Semester
          </button>
        </div>
      </div>

      <main style={{ flex:1, maxWidth:1100, margin:'0 auto', padding:'32px 24px 60px', width:'100%' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:16, marginBottom:28, opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(16px)', transition:'all 0.5s ease' }}>
          {[
            { label:'CGPA', value:cgpaNum.toFixed(2), color:cgpaColor, icon:'🎯', sub:cgpaNum>0?gradeFromSgpa(cgpaNum).g:'Not uploaded' },
            { label:'Semesters', value:history.length, color:'#6366F1', icon:'📅', sub:'Recorded' },
            { label:'Best SGPA', value:history.length?Math.max(...history.map(h=>parseFloat(h.sgpa))).toFixed(2):'—', color:'#10B981', icon:'🏆', sub:'Highest semester' },
            { label:'Latest SGPA', value:history.length?parseFloat([...history].sort((a,b)=>parseInt(b.semester)-parseInt(a.semester))[0]?.sgpa).toFixed(2):'—', color:'#0EA5E9', icon:'📊', sub:'Last semester' },
          ].map((s, i) => (
            <div key={i} style={{ background:'white', borderRadius:18, padding:'20px', border:`1.5px solid ${s.color}20`, boxShadow:`0 2px 16px ${s.color}10`, transition:'all 0.2s', cursor:'default', opacity:vis?1:0, transitionDelay:`${i*60}ms` }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${s.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 2px 16px ${s.color}10`; }}>
              <div style={{ fontSize:'1.3rem', marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.8rem', fontWeight:900, color:s.color, lineHeight:1, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontWeight:700, color:'#374151', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
              <div style={{ fontSize:'0.65rem', color:'#9CA3AF', marginTop:3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 24px', background:'white', borderRadius:24, border:'1px solid #E8EDF5', marginBottom:24 }}>
            <div style={{ fontSize:'3.5rem', marginBottom:16 }}>📭</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", color:'#0F172A', fontSize:'1.1rem', fontWeight:800, marginBottom:8 }}>No semester history yet</h2>
            <p style={{ color:'#64748B', marginBottom:24, fontSize:'0.9rem' }}>Add your semester SGPAs manually or upload your marks card</p>
            <div style={{ display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
              <button onClick={() => setDialog(true)} style={{ padding:'12px 24px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(79,70,229,0.3)' }}>+ Add Semester Manually</button>
              <button onClick={() => nav('/upload-marks')} style={{ padding:'12px 24px', borderRadius:12, border:'2px solid #E2E8F0', background:'white', color:'#374151', fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:'pointer' }}>📤 Upload Marks Card</button>
            </div>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div style={{ background:'white', borderRadius:22, padding:'28px', border:'1px solid #E8EDF5', boxShadow:'0 2px 16px rgba(0,0,0,0.04)', marginBottom:24, opacity:vis?1:0, transition:'all 0.5s ease 0.1s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.95rem', color:'#0F172A', margin:0 }}>📉 SGPA Trend</h3>
                <span style={{ padding:'4px 14px', borderRadius:99, background:'#EEF2FF', color:'#4F46E5', fontSize:'0.72rem', fontWeight:800 }}>CGPA: {cgpaNum.toFixed(2)}</span>
              </div>
              <div style={{ height:280 }}><canvas ref={chartRef} /></div>
            </div>

            {/* Semester cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
              {[...history].sort((a,b)=>parseInt(a.semester)-parseInt(b.semester)).map((h, i) => {
                const grade = gradeFromSgpa(h.sgpa);
                const color = SEM_COLORS[i % SEM_COLORS.length];
                return (
                  <div key={h.id} style={{ background:'white', borderRadius:18, padding:'20px', border:`1.5px solid ${color}25`, boxShadow:`0 2px 16px ${color}10`, position:'relative', transition:'all 0.2s', opacity:vis?1:0, transitionDelay:`${i*50}ms` }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 2px 16px ${color}10`; }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:color, borderRadius:'18px 18px 0 0' }} />
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.8rem', color:'#374151' }}>Semester {h.semester}</span>
                      <button onClick={() => handleDelete(h.id)} disabled={deleting===h.id}
                        style={{ width:26, height:26, borderRadius:8, border:'none', background:'#F1F5F9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', transition:'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#FEE2E2'}
                        onMouseLeave={e => e.currentTarget.style.background='#F1F5F9'}>
                        {deleting===h.id ? '⏳' : '🗑'}
                      </button>
                    </div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'2.2rem', fontWeight:900, color, lineHeight:1, marginBottom:8 }}>{parseFloat(h.sgpa).toFixed(2)}</div>
                    <span style={{ padding:'3px 10px', borderRadius:99, background:grade.bg, color:grade.fg, fontSize:'0.65rem', fontWeight:800 }}>{grade.g}</span>
                    {h.credits && <div style={{ fontSize:'0.65rem', color:'#94A3B8', marginTop:8 }}>{h.credits} credits</div>}
                  </div>
                );
              })}
            </div>

            {/* Goal CGPA calculator */}
            <div style={{ background:'linear-gradient(135deg,#0F172A,#1E1B4B)', borderRadius:22, padding:'28px 32px', opacity:vis?1:0, transition:'all 0.5s ease 0.2s' }}>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'white', fontSize:'0.95rem', margin:'0 0 6px' }}>🎯 Goal CGPA Calculator</h3>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', margin:'0 0 20px' }}>How much SGPA do I need next semester?</p>
              <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
                <input
                  value={goalSgpa} onChange={e => setGoalSgpa(e.target.value)}
                  placeholder="Target CGPA (e.g. 8.5)"
                  type="number" min="0" max="10" step="0.1"
                  style={{ padding:'12px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'0.9rem', fontFamily:"'Outfit',sans-serif", outline:'none', width:220, transition:'border-color 0.15s' }}
                  onFocus={e => e.currentTarget.style.borderColor='rgba(99,102,241,0.6)'}
                  onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}
                />
                {goalSgpa && (
                  <div style={{ flex:1, padding:'14px 20px', borderRadius:12, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)' }}>Required SGPA next semester: </span>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:'1.1rem', color: parseFloat(requiredSgpa()) > 10 ? '#EF4444' : parseFloat(requiredSgpa()) < 0 ? '#10B981' : '#A5B4FC' }}>
                      {requiredSgpa()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add Semester Dialog */}
      {dialog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, backdropFilter:'blur(4px)', animation:'fadeIn 0.2s ease' }}>
          <div style={{ background:'white', borderRadius:24, padding:'32px', width:'100%', maxWidth:400, boxShadow:'0 32px 80px rgba(0,0,0,0.3)', animation:'slideUp 0.25s ease' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#0F172A', fontSize:'1.1rem', margin:'0 0 24px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:36, height:36, borderRadius:10, background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>📊</span>
              Add Semester SGPA
            </h2>
            {[
              { key:'semester', label:'Semester Number', placeholder:'e.g. 3', type:'number' },
              { key:'sgpa', label:'SGPA (0 – 10)', placeholder:'e.g. 7.85', type:'number' },
              { key:'credits', label:'Total Credits (optional)', placeholder:'Default: 20', type:'number' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:6 }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]:e.target.value }))}
                  placeholder={f.placeholder} type={f.type} min="0" step="0.01"
                  style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid #E2E8F0', fontSize:'0.9rem', fontFamily:"'Outfit',sans-serif", outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' }}
                  onFocus={e => e.currentTarget.style.borderColor='#6366F1'}
                  onBlur={e => e.currentTarget.style.borderColor='#E2E8F0'} />
              </div>
            ))}
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button onClick={() => setDialog(false)} style={{ flex:1, padding:'13px', borderRadius:12, border:'1.5px solid #E2E8F0', background:'white', color:'#374151', fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleAdd} style={{ flex:1, padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(79,70,229,0.3)' }}>Add Semester</button>
            </div>
          </div>
        </div>
      )}

      {snack && (
        <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', background:'#0F172A', color:'white', padding:'14px 24px', borderRadius:14, fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', zIndex:9999, animation:'slideUp 0.3s ease', whiteSpace:'nowrap' }}>
          {snack}
          <button onClick={() => setSnack('')} style={{ marginLeft:14, background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'1rem' }}>×</button>
        </div>
      )}

      <Footer />
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        input[type=number]::-webkit-inner-spin-button { opacity:0 }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px}
      `}</style>
    </div>
  );
}
