import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CAT_LABEL = {
  backlog_clearing: 'Backlog Clearing',
  upskill: 'Upskill & Certification',
  placement: 'Placement Preparation',
};

function QRCode({ value, size = 80 }) {
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=1E1B4B&bgcolor=ffffff`}
      alt="QR Code" width={size} height={size} crossOrigin="anonymous"
      style={{ borderRadius: 4, border: '2px solid #E5E7EB', display: 'block' }}
    />
  );
}

const loadScript = (src) =>
  new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

/* ── Certificate card — pure inline styles, renders identically on screen & PDF ── */
function CertificateCard({ cert, verifyUrl, certRef }) {
  const completedDate = cert?.completed_at
    ? new Date(cert.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div
      ref={certRef}
      style={{
        width: 900, minHeight: 620,
        background: '#ffffff',
        position: 'relative', overflow: 'hidden',
        fontFamily: "Georgia, 'Times New Roman', serif",
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        borderRadius: 20, flexShrink: 0,
      }}
    >
      {/* Background radial blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 0% 0%, #EEF2FF 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(253,230,138,0.15) 0%, transparent 50%)' }} />

      {/* Border bars */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: 'linear-gradient(180deg,#F59E0B,#D97706,#92400E)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 7, background: 'linear-gradient(180deg,#4F46E5,#7C3AED)' }} />
      <div style={{ position: 'absolute', top: 0, left: 14, right: 7, height: 7, background: 'linear-gradient(90deg,#F59E0B,#4F46E5,#7C3AED)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 14, right: 7, height: 7, background: 'linear-gradient(90deg,#4F46E5,#7C3AED,#F59E0B)' }} />

      {/* Corner ornaments */}
      {[['28px','32px','top','left','#D97706','#D97706'],['28px','22px','top','right','#4F46E5','#4F46E5'],
        ['22px','32px','bottom','left','#4F46E5','#4F46E5'],['22px','22px','bottom','right','#D97706','#D97706']].map(([top,right,vp,hp,tc,bc],i) => (
        <div key={i} style={{
          position: 'absolute', [vp]: top, [hp]: right,
          width: 44, height: 44,
          borderTop: vp==='top' ? `2px solid ${tc}` : 'none',
          borderBottom: vp==='bottom' ? `2px solid ${bc}` : 'none',
          borderLeft: hp==='left' ? `2px solid ${tc}` : 'none',
          borderRight: hp==='right' ? `2px solid ${bc}` : 'none',
          opacity: 0.55,
        }} />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '36px 64px 32px 72px', minHeight: 620, display: 'flex', flexDirection: 'column' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🎓</div>
            <div>
              <div style={{ fontFamily: "'Palatino Linotype',Palatino,serif", fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B' }}>Campus Connect</div>
              <div style={{ fontSize: '0.58rem', color: '#6B7280', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Arial,sans-serif', marginTop: 2 }}>VTU Student Portal</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginBottom: 4 }}>
              <span style={{ color: '#059669', fontSize: '0.9rem' }}>✓</span>
              <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Arial,sans-serif' }}>Verified Certificate</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{cert?.certificate_id}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#D1D5DB 20%,#D1D5DB 80%,transparent)', marginBottom: 24 }} />

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

          <div style={{ fontSize: '0.62rem', color: '#6B7280', letterSpacing: '0.35em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Arial,sans-serif', marginBottom: 18 }}>
            ✦ Certificate of Completion ✦
          </div>

          <div style={{ fontFamily: "'Palatino Linotype',Palatino,Georgia,serif", fontSize: '1rem', color: '#374151', marginBottom: 10 }}>
            This is to certify that
          </div>

          {/* Student name — gradient text using a wrapper trick for html2canvas compat */}
          <div style={{ marginBottom: 6 }}>
            <span style={{
              fontFamily: "'Palatino Linotype',Palatino,Georgia,serif",
              fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.1,
              color: '#1E1B4B',
              display: 'inline-block',
            }}>
              {cert?.full_name}
            </span>
          </div>

          {cert?.college && (
            <div style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: 14, fontFamily: 'Arial,sans-serif' }}>
              {cert.college}{cert.branch ? ` · ${cert.branch}` : ''}
            </div>
          )}

          <div style={{ fontFamily: "'Palatino Linotype',Palatino,Georgia,serif", fontSize: '1rem', color: '#374151', marginBottom: 14 }}>
            has successfully completed the course
          </div>

          {/* Course box */}
          <div style={{ background: '#EEF2FF', border: '2px solid #C7D2FE', borderRadius: 14, padding: '14px 40px', marginBottom: 16, maxWidth: 540, width: '100%' }}>
            <div style={{ fontFamily: "'Palatino Linotype',Palatino,Georgia,serif", fontWeight: 700, fontSize: '1.3rem', color: '#1E1B4B', lineHeight: 1.25 }}>
              {cert?.course_title}
            </div>
            {cert?.category && (
              <div style={{ fontSize: '0.62rem', color: '#6366F1', fontWeight: 700, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Arial,sans-serif' }}>
                {CAT_LABEL[cert.category] || cert.category}
              </div>
            )}
          </div>

          {completedDate && (
            <div style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: 20, fontFamily: 'Arial,sans-serif' }}>
              Completed on <strong style={{ color: '#374151' }}>{completedDate}</strong>
              {cert?.year_scheme && <span> · Scheme {cert.year_scheme}</span>}
            </div>
          )}

          {/* Signatures row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', maxWidth: 680, marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #E5E7EB' }}>
            <div style={{ textAlign: 'center', minWidth: 150 }}>
              <div style={{ height: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: "'Palatino Linotype',Palatino,Georgia,serif", fontSize: '1.2rem', fontStyle: 'italic', color: '#4F46E5' }}>Campus Connect</span>
              </div>
              <div style={{ height: 1.5, background: '#D1D5DB', marginBottom: 6 }} />
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#374151', fontFamily: 'Arial,sans-serif' }}>Campus Connect</div>
              <div style={{ fontSize: '0.6rem', color: '#9CA3AF', fontFamily: 'Arial,sans-serif' }}>VTU Student Portal</div>
            </div>

            {/* Seal */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,#EEF2FF,#DDE4FF)', border: '3px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 6px', boxShadow: '0 2px 12px rgba(79,70,229,0.12)' }}>🎓</div>
              <div style={{ fontSize: '0.56rem', color: '#6366F1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Arial,sans-serif' }}>Official Seal</div>
            </div>

            <div style={{ textAlign: 'center', minWidth: 150 }}>
              <div style={{ height: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: "'Palatino Linotype',Palatino,Georgia,serif", fontSize: '1.2rem', fontStyle: 'italic', color: '#4F46E5' }}>Academics</span>
              </div>
              <div style={{ height: 1.5, background: '#D1D5DB', marginBottom: 6 }} />
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#374151', fontFamily: 'Arial,sans-serif' }}>Director, Academics</div>
              <div style={{ fontSize: '0.6rem', color: '#9CA3AF', fontFamily: 'Arial,sans-serif' }}>Authorized Signatory</div>
            </div>
          </div>

          {/* QR footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: '10px 18px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
            <QRCode value={verifyUrl} size={56} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, color: '#374151', fontFamily: 'Arial,sans-serif', marginBottom: 2 }}>Scan to Verify Certificate</div>
              <div style={{ fontSize: '0.56rem', color: '#9CA3AF', fontFamily: 'monospace', wordBreak: 'break-all' }}>{verifyUrl}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');
  const certRef = useRef(null);

  useEffect(() => {
    axios.get(`/api/training/certificate/${certId}`)
      .then(r => setCert(r.data))
      .catch(e => setError(e.response?.data?.error || 'Certificate not found'))
      .finally(() => setLoading(false));
  }, [certId]);

  const verifyUrl = window.location.origin + '/certificate/' + certId;

  const handleDownload = async () => {
    if (!certRef.current || !cert) return;
    setDownloading(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      // Give QR image time to fully load
      await new Promise(r => setTimeout(r, 700));

      const el = certRef.current;
      const canvas = await window.html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 10000,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let iw = pw - 10, ih = iw / ratio;
      if (ih > ph - 10) { ih = ph - 10; iw = ih * ratio; }
      pdf.addImage(imgData, 'PNG', (pw - iw) / 2, (ph - ih) / 2, iw, ih);
      pdf.save(`CampusConnect-Certificate-${cert.certificate_id}.pdf`);
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Try right-clicking the certificate → Print → Save as PDF.');
    }
    setDownloading(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Certificate — ${cert?.course_title}`, url: verifyUrl });
    } else {
      navigator.clipboard.writeText(verifyUrl).then(() => {
        setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 2500);
      });
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0D2A' }}>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontFamily: 'Arial,sans-serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
        Loading certificate…
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0D2A', padding: 24 }}>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>❌</div>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#DC2626', fontFamily: 'Arial,sans-serif' }}>{error}</div>
        <Link to="/training" style={{ color: '#818CF8', fontWeight: 700, textDecoration: 'none', fontFamily: 'Arial,sans-serif' }}>← Back to Training</Link>
      </div>
    </div>
  );

  const btn = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Arial,sans-serif', border: 'none', transition: 'opacity 0.15s' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0F0D2A 0%,#1E1B4B 50%,#0D1B35 100%)' }}>

      {/* Action bar */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link to="/training" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Arial,sans-serif' }}>← Back to Training</Link>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleShare} style={{ ...btn, background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              🔗 {copyMsg || 'Share'}
            </button>
            <button onClick={() => { const t = encodeURIComponent(`🎓 Earned certificate for "${cert?.course_title}" on Campus Connect!\nVerify: ${verifyUrl}`); window.open(`https://wa.me/?text=${t}`, '_blank'); }}
              style={{ ...btn, background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}>
              💬 WhatsApp
            </button>
            <button onClick={handleDownload} disabled={downloading}
              style={{ ...btn, background: downloading ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#1C1917', opacity: downloading ? 0.7 : 1 }}>
              {downloading ? '⏳ Generating PDF…' : '⬇ Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 24px' }}>
        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
          <CertificateCard cert={cert} verifyUrl={verifyUrl} certRef={certRef} />
        </div>
      </div>

      {/* Cert ID strip */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '1.2rem' }}>🔒</span>
          <div>
            <div style={{ color: '#E0E7FF', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Arial,sans-serif', marginBottom: 3 }}>Certificate ID &amp; Verification URL</div>
            <div style={{ color: '#A5B4FC', fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{verifyUrl}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
