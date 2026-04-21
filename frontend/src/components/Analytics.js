import React, { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

const GP_COLOR = { S:'#10B981', A:'#3B82F6', B:'#8B5CF6', C:'#F59E0B', D:'#F97316', E:'#EF4444', F:'#94A3B8' };
const gpLabel = gp => gp>=10?'S':gp>=9?'A':gp>=8?'B':gp>=7?'C':gp>=6?'D':gp>=4?'E':'F';

function AnimNum({ value, decimals=0 }) {
  const [v, setV] = useState(0);
  const frame = useRef();
  useEffect(() => {
    const t = parseFloat(value)||0, s = performance.now();
    const step = n => { const p=Math.min((n-s)/1000,1), e=1-Math.pow(1-p,3); setV(+(t*e).toFixed(decimals)); if(p<1) frame.current=requestAnimationFrame(step); };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{v}</>;
}

export default function Analytics() {
  const [profile, setProfile] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vis, setVis] = useState(false);
  const barRef = useRef(); const donutRef = useRef();
  const barChart = useRef(); const donutChart = useRef();
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/users/profile'), api.get('/users/marks')])
      .then(([p, m]) => { setProfile(p.data); setMarks(m.data || []); })
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setVis(true), 80); });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!marks.length) return;
    if (barChart.current) { barChart.current.destroy(); barChart.current = null; }
    if (donutChart.current) { donutChart.current.destroy(); donutChart.current = null; }

    if (barRef.current) {
      barChart.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: marks.map(m => m.subject_code),
          datasets: [
            { label: 'Internal', data: marks.map(m => m.internal_marks), backgroundColor: 'rgba(79,70,229,0.75)', borderRadius: 5, borderSkipped: false },
            { label: 'External', data: marks.map(m => m.external_marks), backgroundColor: 'rgba(124,58,237,0.75)', borderRadius: 5, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: { duration: 900, easing: 'easeOutQuart' },
          plugins: {
            legend: { position: 'top', labels: { font: { family: "'Outfit',sans-serif", size: 12 }, color: 'var(--text-2,#374151)', padding: 20 } },
            tooltip: { backgroundColor: '#1E293B', titleFont: { family: "'Syne',sans-serif", size: 13 }, bodyFont: { family: "'Outfit',sans-serif" }, padding: 12, cornerRadius: 10 },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: "'Outfit',sans-serif", size: 11 }, color: '#94A3B8' } },
            y: { beginAtZero: true, max: 65, grid: { color: '#F1F5F9' }, ticks: { font: { family: "'Outfit',sans-serif", size: 11 }, color: '#94A3B8' } },
          },
        },
      });
    }

    if (donutRef.current) {
      const gradeCounts = marks.reduce((acc, m) => { const g = gpLabel(m.grade_points); acc[g] = (acc[g]||0) + 1; return acc; }, {});
      const labels = Object.keys(gradeCounts);
      donutChart.current = new Chart(donutRef.current, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: labels.map(l => gradeCounts[l]), backgroundColor: labels.map(l => GP_COLOR[l]), borderWidth: 3, borderColor: '#fff', hoverOffset: 6 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: { animateRotate: true, duration: 900, easing: 'easeOutQuart' },
          plugins: {
            legend: { position: 'bottom', labels: { font: { family: "'Outfit',sans-serif", size: 12 }, color: 'var(--text-2,#374151)', padding: 16, usePointStyle: true } },
            tooltip: { backgroundColor: '#1E293B', titleFont: { family: "'Syne',sans-serif", size: 13 }, bodyFont: { family: "'Outfit',sans-serif" }, padding: 12, cornerRadius: 10 },
          },
          cutout: '68%',
        },
      });
    }
    return () => { if (barChart.current) barChart.current.destroy(); if (donutChart.current) donutChart.current.destroy(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks]);

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--bg-page,#F4F6FB)' }}>
      <Header />
      <div style={{ flex:1, maxWidth:1200, margin:'0 auto', padding:'32px 24px', width:'100%' }}>
        {[220,320,280].map((h,i) => <div key={i} style={{ height:h, borderRadius:22, background:'linear-gradient(90deg,#E2E8F0 0%,#F1F5F9 50%,#E2E8F0 100%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s ease infinite', marginBottom:20 }} />)}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );

  const cgpaNum = parseFloat(profile?.cgpa)||0;
  const sgpaNum = parseFloat(profile?.sgpa)||0;
  const failed = marks.filter(m => m.total < 40);
  const avg = marks.length ? (marks.reduce((s,m) => s + m.total, 0) / marks.length).toFixed(1) : '—';
  const top = marks.length ? Math.max(...marks.map(m => m.total)) : '—';
  const cgpaColor = cgpaNum>=8?'#10B981':cgpaNum>=6?'#F59E0B':cgpaNum>0?'#EF4444':'#94A3B8';

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--bg-page,#F4F6FB)', fontFamily:"'Outfit',sans-serif" }}>
      <Header />

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#06030F,#1E1B4B,#0D1B35)', padding:'36px 24px 42px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:900, color:'white', letterSpacing:'-0.03em', margin:'0 0 8px', lineHeight:1.15 }}>📊 Performance Analytics</h1>
          <p style={{ color:'rgba(255,255,255,0.45)', margin:0, fontSize:'0.9rem' }}>{profile?.full_name || 'Student'} · Semester {profile?.semester || '—'} · {marks.length} subjects tracked</p>
        </div>
      </div>

      <main style={{ flex:1, maxWidth:1200, margin:'0 auto', padding:'32px 24px 60px', width:'100%' }}>

        {marks.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 24px', background:'var(--bg-card,white)', borderRadius:24, border:'1px solid var(--border,#E8EDF5)' }}>
            <div style={{ fontSize:'4rem', marginBottom:16 }}>📭</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", color:'var(--text-1,#0F172A)', fontSize:'1.2rem', fontWeight:800, marginBottom:8 }}>No marks uploaded yet</h2>
            <p style={{ color:'#64748B', marginBottom:24 }}>Upload your VTU marks card PDF to see beautiful analytics</p>
            <button onClick={() => nav('/upload-marks')} style={{ padding:'13px 28px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.9rem', cursor:'pointer', boxShadow:'0 6px 20px rgba(79,70,229,0.35)' }}>
              📤 Upload Marks Card →
            </button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:16, marginBottom:28, opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(16px)', transition:'all 0.5s ease' }}>
              {[
                { label:'CGPA', value:cgpaNum, color:cgpaColor, decimals:2, icon:'🎯', sub:'Cumulative' },
                { label:'SGPA', value:sgpaNum, color:'#6366F1', decimals:2, icon:'📈', sub:'Last sem' },
                { label:'Avg Score', value:avg, color:'#0EA5E9', icon:'📊', sub:'Across subjects', noAnimate:true },
                { label:'Highest', value:top, color:'#10B981', icon:'🏆', sub:'Best subject', noAnimate:true },
                { label:'Subjects', value:marks.length, color:'#8B5CF6', icon:'📚', sub:'Total', noAnimate:true },
                { label:'Backlogs', value:failed.length, color:failed.length>0?'#EF4444':'#10B981', icon:failed.length>0?'⚠️':'✅', sub:failed.length>0?'Needs work':'All clear!', noAnimate:true },
              ].map((s, i) => (
                <div key={i} style={{ background:'var(--bg-card,white)', borderRadius:18, padding:'20px 18px', border:`1.5px solid ${s.color}20`, boxShadow:`0 2px 16px ${s.color}10`, transition:'all 0.2s', cursor:'default', opacity:vis?1:0, transitionDelay:`${i*60}ms` }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${s.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 2px 16px ${s.color}10`; }}>
                  <div style={{ fontSize:'1.3rem', marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.8rem', fontWeight:900, color:s.color, lineHeight:1, marginBottom:4 }}>
                    {s.noAnimate ? s.value : <AnimNum value={s.value} decimals={s.decimals||0} />}
                  </div>
                  <div style={{ fontWeight:700, color:'var(--text-2,#374151)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>{s.label}</div>
                  <div style={{ fontSize:'0.66rem', color:'#9CA3AF', marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24, opacity:vis?1:0, transition:'all 0.5s ease 0.15s' }}>
              <div style={{ background:'var(--bg-card,white)', borderRadius:22, padding:'24px', border:'1px solid var(--border,#E8EDF5)', boxShadow:'0 2px 16px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.9rem', color:'var(--text-1,#0F172A)', margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'inline-block' }} />
                  Internal vs External Marks
                </h3>
                <div style={{ height:260 }}><canvas ref={barRef} /></div>
              </div>
              <div style={{ background:'var(--bg-card,white)', borderRadius:22, padding:'24px', border:'1px solid var(--border,#E8EDF5)', boxShadow:'0 2px 16px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.9rem', color:'var(--text-1,#0F172A)', margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:'linear-gradient(135deg,#10B981,#059669)', display:'inline-block' }} />
                  Grade Distribution
                </h3>
                <div style={{ height:260 }}><canvas ref={donutRef} /></div>
              </div>
            </div>

            {/* CGPA progress visual */}
            <div style={{ background:'linear-gradient(135deg,#0F172A,#1E1B4B)', borderRadius:22, padding:'28px 32px', marginBottom:24, opacity:vis?1:0, transition:'all 0.5s ease 0.25s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, marginBottom:20 }}>
                <div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'white', fontSize:'0.95rem', margin:'0 0 4px' }}>Overall CGPA Progress</h3>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', margin:0 }}>VTU 10-point grading scale</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'2.4rem', fontWeight:900, color:cgpaColor, lineHeight:1 }}>{cgpaNum.toFixed(2)}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)', marginTop:2 }}>CGPA</div>
                </div>
              </div>
              {/* 10-segment bar */}
              <div style={{ display:'flex', gap:4, height:36, marginBottom:10 }}>
                {[...Array(10)].map((_, i) => {
                  const filled = cgpaNum >= i + 1;
                  const partial = !filled && cgpaNum > i;
                  const pct = partial ? ((cgpaNum - i) * 100) : 0;
                  const col = i >= 8 ? '#10B981' : i >= 6 ? '#F59E0B' : i >= 4 ? '#F97316' : '#EF4444';
                  return (
                    <div key={i} style={{ flex:1, borderRadius:6, overflow:'hidden', background:'rgba(255,255,255,0.07)', position:'relative' }}>
                      <div style={{ position:'absolute', inset:0, background:col, opacity: filled ? 0.85 : 0, transition:`all 1.2s ease ${i*80}ms`, borderRadius:6 }} />
                      {partial && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${pct}%`, background:col, opacity:0.85, borderRadius:6, transition:`all 1.2s ease ${i*80}ms` }} />}
                      <div style={{ position:'absolute', bottom:3, right:5, fontSize:'0.55rem', color: filled||partial ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', fontWeight:700 }}>{i+1}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.3)' }}>0.0</span>
                <span style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.3)' }}>10.0 (Max)</span>
              </div>
            </div>

            {/* Detailed subject table */}
            <div style={{ background:'var(--bg-card,white)', borderRadius:22, border:'1px solid var(--border,#E8EDF5)', overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.04)', opacity:vis?1:0, transition:'all 0.5s ease 0.3s' }}>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border,#F1F5F9)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#FAFBFC' }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'var(--text-1,#0F172A)', fontSize:'0.9rem' }}>Subject Breakdown</span>
                {failed.length > 0 && (
                  <button onClick={() => nav('/backlog-dashboard')} style={{ padding:'7px 16px', borderRadius:9, border:'none', background:'#FEE2E2', color:'#DC2626', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
                    ⚠️ {failed.length} Backlogs →
                  </button>
                )}
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                  <thead>
                    <tr style={{ background:'#F8FAFC' }}>
                      {['#','Code','Subject','Int','Ext','Total','Credits','GP','Grade'].map(h => (
                        <th key={h} style={{ padding:'11px 14px', textAlign:'center', fontSize:'0.62rem', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid var(--border,#E8EDF5)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m, i) => {
                      const grade = gpLabel(m.grade_points);
                      const gc = GP_COLOR[grade] || '#94A3B8';
                      return (
                        <tr key={i} style={{ borderBottom:'1px solid #F4F6FB', background:m.total<40?'#FFF8F8':'white', transition:'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = m.total<40 ? '#FEECEC' : '#F8FAFF'}
                          onMouseLeave={e => e.currentTarget.style.background = m.total<40 ? '#FFF8F8' : 'white'}>
                          <td style={{ padding:'11px 14px', textAlign:'center', color:'#94A3B8', fontSize:'0.72rem' }}>{i+1}</td>
                          <td style={{ padding:'11px 14px', textAlign:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#4F46E5', fontSize:'0.78rem' }}>{m.subject_code}</td>
                          <td style={{ padding:'11px 14px', textAlign:'left', color:'var(--text-2,#374151)', maxWidth:160 }}><span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.subject_name||'—'}</span></td>
                          <td style={{ padding:'11px 14px', textAlign:'center', color:'#64748B' }}>{m.internal_marks}</td>
                          <td style={{ padding:'11px 14px', textAlign:'center', color:'#64748B' }}>{m.external_marks}</td>
                          <td style={{ padding:'11px 14px', textAlign:'center', fontWeight:800, color:m.total<40?'#EF4444':'#0F172A' }}>{m.total}</td>
                          <td style={{ padding:'11px 14px', textAlign:'center', color:'#64748B' }}>{m.credits}</td>
                          <td style={{ padding:'11px 14px', textAlign:'center', fontWeight:700, color:'var(--text-2,#374151)' }}>{m.grade_points}</td>
                          <td style={{ padding:'11px 14px', textAlign:'center' }}>
                            <span style={{ padding:'4px 12px', borderRadius:99, background:`${gc}18`, color:gc, fontWeight:800, fontSize:'0.72rem', fontFamily:"'Syne',sans-serif" }}>{grade}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
      <style>{`::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px}`}</style>
    </div>
  );
}
