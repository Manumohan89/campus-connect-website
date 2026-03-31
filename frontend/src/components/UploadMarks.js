import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const GRADE_MAP = { 10:['S','#D1FAE5','#065F46'], 9:['A','#DBEAFE','#1E3A8A'], 8:['B','#EDE9FE','#4C1D95'], 7:['C','#FEF9C3','#713F12'], 6:['D','#FEF3C7','#92400E'], 4:['E','#FEE2E2','#991B1B'] };
const GradeBadge = ({ gp }) => {
  const [label,bg,color] = GRADE_MAP[gp] || ['F','#FEE2E2','#991B1B'];
  return <span style={{ padding:'3px 11px', borderRadius:99, fontSize:'0.72rem', fontWeight:800, background:bg, color }}>{label}</span>;
};

const GRADING = [
  ['≥ 90','S','10','#059669'],['80–89','A','9','#2563EB'],['70–79','B','8','#7C3AED'],
  ['60–69','C','7','#D97706'],['50–59','D','6','#EA580C'],['40–49','E','4','#DC2626'],['< 40','F','0','#9CA3AF'],
];

const STEPS = [
  { icon:'📄', title:'Upload PDF', desc:'Select your official VTU marks card' },
  { icon:'🔍', title:'Extract Data', desc:'Subject codes & marks are auto-read' },
  { icon:'📊', title:'Match Credits', desc:'Official VTU credit table is applied' },
  { icon:'🎓', title:'Get SGPA', desc:'Σ(GP × Credits) ÷ Σ(Credits)' },
];

export default function UploadMarks() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');
  const [marks, setMarks] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [vis, setVis] = useState(false);
  const dropRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/marks').then(r => setMarks(r.data || [])).catch(() => {});
    setTimeout(() => setVis(true), 80);
  }, []);

  const handleFileChange = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please select a PDF file.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File size must be under 10MB.'); return; }
    setFile(f); setFileName(f.name); setError(null); setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a marks card PDF.'); return; }
    const fd = new FormData();
    fd.append('marksCard', file);
    setLoading(true); setError(null);
    try {
      const res = await api.post('/users/upload-marks', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      setSnack(`✅ ${res.data.subjects_count} subjects processed! SGPA: ${parseFloat(res.data.sgpa).toFixed(2)}`);
      setFile(null); setFileName('');
      setTimeout(() => api.get('/users/marks').then(r => setMarks(r.data || [])).catch(() => {}), 600);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please ensure the PDF is a valid VTU marks card.');
    } finally { setLoading(false); }
  };

  const failedCount = marks.filter(m => m.total < 40).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#F4F6FB', fontFamily:"'Outfit',sans-serif" }}>
      <Header />

      {/* Page hero */}
      <div style={{ background:'linear-gradient(135deg,#06030F,#1E1B4B,#0D1B35)', padding:'36px 24px 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <span style={{ display:'inline-block', padding:'4px 14px', borderRadius:99, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'#A5B4FC', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:14 }}>Smart PDF Processing</span>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:900, color:'white', letterSpacing:'-0.03em', margin:'0 0 10px', lineHeight:1.15 }}>📤 Upload Marks Card</h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.92rem', margin:0 }}>Auto-calculate SGPA & CGPA from your VTU marks card PDF — supports 2021 & 2022 scheme</p>
        </div>
      </div>

      <main style={{ flex:1, maxWidth:1200, margin:'0 auto', padding:'32px 24px 60px', width:'100%' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, alignItems:'start' }}
          className="upload-grid">

          {/* ── Left panel ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:20, opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(20px)', transition:'all 0.5s ease' }}>

            {/* How it works steps */}
            <div style={{ background:'white', borderRadius:22, border:'1px solid #E8EDF5', padding:'24px', boxShadow:'0 2px 16px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.9rem', color:'#0F172A', margin:'0 0 18px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:28, height:28, borderRadius:8, background:'#EEF2FF', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>⚡</span>
                How it works
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', paddingBottom: i < STEPS.length-1 ? 18 : 0, position:'relative' }}>
                    {i < STEPS.length-1 && <div style={{ position:'absolute', left:17, top:36, width:2, height:'calc(100% - 18px)', background:'linear-gradient(180deg,#E0E7FF,transparent)' }} />}
                    <div style={{ width:36, height:36, borderRadius:10, background:`${['#EEF2FF','#F0FDF4','#FEF9C3','#EDE9FE'][i]}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0, zIndex:1, border:`1px solid ${['#C7D2FE','#BBF7D0','#FDE68A','#DDD6FE'][i]}` }}>{s.icon}</div>
                    <div style={{ paddingTop:4 }}>
                      <div style={{ fontWeight:700, fontSize:'0.82rem', color:'#0F172A', marginBottom:2 }}>
                        <span style={{ fontFamily:"'Syne',sans-serif", color:'#6366F1', marginRight:6 }}>Step {i+1}.</span>{s.title}
                      </div>
                      <div style={{ fontSize:'0.76rem', color:'#64748B', lineHeight:1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VTU Grading scale */}
            <div style={{ background:'white', borderRadius:22, border:'1px solid #E8EDF5', padding:'22px', boxShadow:'0 2px 16px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.88rem', color:'#0F172A', margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
                <span>📐</span> VTU Grading Scale (10-point)
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {GRADING.map(([range, grade, gp, color]) => (
                  <div key={grade} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:10, background:`${color}0D`, border:`1px solid ${color}25` }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.78rem', color }}>{grade}</span>
                    <span style={{ fontSize:'0.72rem', color:'#64748B' }}>{range}</span>
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color }}>{gp} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported schemes badge */}
            <div style={{ background:'linear-gradient(135deg,#EEF2FF,#EDE9FE)', borderRadius:16, padding:'16px 20px', border:'1px solid #C7D2FE', display:'flex', gap:12, alignItems:'center' }}>
              <span style={{ fontSize:'1.6rem' }}>🎯</span>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.82rem', color:'#1E1B4B', marginBottom:4 }}>Supports All VTU Schemes</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {['2015','2018','2021','2022','2025'].map(s => (
                    <span key={s} style={{ padding:'2px 9px', borderRadius:99, background:'rgba(79,70,229,0.12)', color:'#4F46E5', fontSize:'0.65rem', fontWeight:800, border:'1px solid rgba(79,70,229,0.2)' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:20, opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(20px)', transition:'all 0.5s ease 0.1s' }}>

            {/* Upload card */}
            <div style={{ background:'white', borderRadius:22, border:'1px solid #E8EDF5', padding:'28px', boxShadow:'0 2px 16px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.95rem', color:'#0F172A', margin:'0 0 20px' }}>Upload your PDF</h3>

              {/* Drop zone */}
              <label
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  display:'block', padding:'36px 24px', textAlign:'center',
                  border:`2px dashed ${dragOver ? '#4F46E5' : fileName ? '#4F46E5' : '#CBD5E1'}`,
                  background: dragOver ? '#EEF2FF' : fileName ? '#F8F9FF' : '#FAFBFC',
                  borderRadius:16, cursor:'pointer', marginBottom:18,
                  transition:'all 0.2s',
                }}>
                <input type="file" accept=".pdf" hidden onChange={e => handleFileChange(e.target.files[0])} disabled={loading} />
                <div style={{ fontSize:'2.4rem', marginBottom:10 }}>{fileName ? '📄' : dragOver ? '📂' : '☁️'}</div>
                <div style={{ fontWeight:700, color: fileName ? '#4F46E5' : '#374151', fontSize:'0.875rem', marginBottom:4 }}>
                  {fileName ? fileName : 'Click to select or drag & drop'}
                </div>
                <div style={{ fontSize:'0.72rem', color:'#94A3B8' }}>PDF only · max 10MB · VTU official marks card</div>
              </label>

              {error && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:'1rem' }}>⚠️</span>
                  <span style={{ color:'#DC2626', fontSize:'0.82rem', fontWeight:600 }}>{error}</span>
                </div>
              )}

              {loading && (
                <div style={{ marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:'0.78rem', color:'#374151', fontWeight:600 }}>Processing your marks card…</span>
                    <span style={{ fontSize:'0.72rem', color:'#6366F1' }}>Please wait</span>
                  </div>
                  <div style={{ height:6, background:'#EEF2FF', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'linear-gradient(90deg,#4F46E5,#7C3AED,#4F46E5)', backgroundSize:'200% 100%', borderRadius:99, animation:'progress-bar 1.5s linear infinite' }} />
                  </div>
                </div>
              )}

              <button onClick={handleUpload} disabled={loading || !file}
                style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', cursor: loading || !file ? 'not-allowed' : 'pointer', background: loading || !file ? '#E2E8F0' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: loading || !file ? '#94A3B8' : 'white', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.95rem', letterSpacing:'-0.01em', transition:'all 0.2s', boxShadow: loading || !file ? 'none' : '0 6px 24px rgba(79,70,229,0.35)' }}
                onMouseEnter={e => { if (!loading && file) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(79,70,229,0.45)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=loading||!file?'none':'0 6px 24px rgba(79,70,229,0.35)'; }}>
                {loading ? '⏳ Processing…' : '🚀 Calculate SGPA & CGPA'}
              </button>
            </div>

            {/* Success result card */}
            {result && (
              <div style={{ background:'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border:'2px solid #6EE7B7', borderRadius:22, padding:'24px', boxShadow:'0 8px 32px rgba(16,185,129,0.12)', animation:'slideUp 0.4s ease' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>✅</div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#065F46', fontSize:'0.92rem' }}>Upload Successful!</div>
                    <div style={{ fontSize:'0.72rem', color:'#059669' }}>{result.subjects_count} subjects processed</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
                  {[['SGPA',result.sgpa,'#4F46E5'],['CGPA',result.cgpa,'#7C3AED']].map(([label,val,color]) => (
                    <div key={label} style={{ textAlign:'center', padding:'18px', background:'white', borderRadius:14, border:`1px solid ${color}20` }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'2.2rem', fontWeight:900, color, lineHeight:1 }}>{parseFloat(val||0).toFixed(2)}</div>
                      <div style={{ fontWeight:700, color:'#6B7280', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/analytics')}
                  style={{ width:'100%', padding:'12px', borderRadius:12, border:'2px solid #10B981', background:'transparent', color:'#065F46', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.85rem', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#D1FAE5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
                  📊 View Full Analytics →
                </button>
              </div>
            )}

            {/* Current marks table */}
            {marks.length > 0 && (
              <div style={{ background:'white', borderRadius:22, border:'1px solid #E8EDF5', overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ padding:'16px 22px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#FAFBFC' }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#0F172A', fontSize:'0.88rem' }}>Current Marks</span>
                  <div style={{ display:'flex', gap:6 }}>
                    <span style={{ padding:'3px 10px', borderRadius:99, background:'#EEF2FF', color:'#4F46E5', fontSize:'0.68rem', fontWeight:700 }}>{marks.length} subjects</span>
                    {failedCount > 0 && <span style={{ padding:'3px 10px', borderRadius:99, background:'#FEE2E2', color:'#DC2626', fontSize:'0.68rem', fontWeight:700 }}>{failedCount} failed</span>}
                  </div>
                </div>
                <div style={{ maxHeight:320, overflowY:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8rem' }}>
                    <thead>
                      <tr style={{ background:'#F8FAFC', position:'sticky', top:0 }}>
                        {['Code','Int','Ext','Total','Grade'].map(h => (
                          <th key={h} style={{ padding:'9px 12px', textAlign:'center', fontSize:'0.62rem', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #E8EDF5' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((m, i) => (
                        <tr key={i} style={{ borderTop:'1px solid #F4F6FB', background:m.total<40?'#FFF8F8':'white' }}>
                          <td style={{ padding:'9px 12px', textAlign:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#4F46E5', fontSize:'0.76rem' }}>{m.subject_code}</td>
                          <td style={{ padding:'9px 12px', textAlign:'center', color:'#64748B' }}>{m.internal_marks}</td>
                          <td style={{ padding:'9px 12px', textAlign:'center', color:'#64748B' }}>{m.external_marks}</td>
                          <td style={{ padding:'9px 12px', textAlign:'center', fontWeight:800, color:m.total<40?'#EF4444':'#0F172A' }}>{m.total}</td>
                          <td style={{ padding:'9px 12px', textAlign:'center' }}><GradeBadge gp={m.grade_points} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {failedCount > 0 && (
                  <div style={{ padding:'14px 20px', background:'#FFF5F5', borderTop:'1px solid #FEE2E2', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.8rem', color:'#991B1B', fontWeight:600 }}>⚠️ {failedCount} failed subject{failedCount>1?'s':''}</span>
                    <button onClick={() => navigate('/training')}
                      style={{ padding:'6px 14px', borderRadius:9, border:'1.5px solid #EF4444', background:'transparent', color:'#EF4444', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
                      Find Clearing Courses →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {snack && (
        <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', background:'#0F172A', color:'white', padding:'14px 24px', borderRadius:14, fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', zIndex:9999, animation:'slideUp 0.3s ease', whiteSpace:'nowrap' }}>
          {snack}
          <button onClick={() => setSnack('')} style={{ marginLeft:16, background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'1rem', lineHeight:1 }}>×</button>
        </div>
      )}

      <Footer />
      <style>{`
        @media (max-width:768px) { .upload-grid { grid-template-columns: 1fr !important; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes progress-bar { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }
      `}</style>
    </div>
  );
}
