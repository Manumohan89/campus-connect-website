import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShareIcon from '@mui/icons-material/Share';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import axios from 'axios';

const CAT_LABEL = {
  backlog_clearing: 'Backlog Clearing',
  upskill: 'Upskill & Certification',
  placement: 'Placement Preparation',
};

function QRCode({ value, size = 80 }) {
  const encoded = encodeURIComponent(value);
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=1E1B4B&bgcolor=ffffff`}
      alt="QR Code" width={size} height={size}
      crossOrigin="anonymous"
      style={{ borderRadius: 4, border: '2px solid #E5E7EB' }}
    />
  );
}

export default function CertificatePage() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    axios.get(`/api/training/certificate/${certId}`)
      .then(r => setCert(r.data))
      .catch(e => setError(e.response?.data?.error || 'Certificate not found'))
      .finally(() => setLoading(false));
  }, [certId]);

  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  const handleDownload = async () => {
    if (!certRef.current || !cert) return;
    setDownloading(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const canvas = await window.html2canvas(certRef.current, {
        scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let iw = pw, ih = pw / ratio;
      if (ih > ph) { ih = ph; iw = ph * ratio; }
      pdf.addImage(imgData, 'PNG', (pw - iw) / 2, (ph - ih) / 2, iw, ih);
      pdf.save(`CampusConnect-Certificate-${cert.certificate_id}.pdf`);
    } catch (err) {
      alert('Download failed. Use Ctrl+P → Save as PDF as fallback.');
    }
    setDownloading(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: `Certificate — ${cert?.course_title}`, url });
    else navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
  };

  const verifyUrl = window.location.origin + '/certificate/' + certId;
  const completedDate = cert?.completed_at
    ? new Date(cert.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  if (loading) return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'#F8FAFC' }}>
      <CircularProgress sx={{ color:'#4F46E5' }} />
    </Box>
  );
  if (error) return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'#F8FAFC', p:3 }}>
      <Box sx={{ maxWidth:400, textAlign:'center' }}>
        <Typography fontSize="3rem" mb={2}>❌</Typography>
        <Alert severity="error" sx={{ mb:3, borderRadius:'12px' }}>{error}</Alert>
        <Link to="/training" style={{ color:'#4F46E5', fontWeight:700, textDecoration:'none' }}>← Back to Training</Link>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#1E1B4B', py:4 }}>
      <Container maxWidth="lg" sx={{ mb:3 }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:2 }}>
          <Link to="/training" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:'0.9rem', fontWeight:600 }}>
            ← Back to Training
          </Link>
          <Box sx={{ display:'flex', gap:1.5, flexWrap:'wrap' }}>
            <Button startIcon={<ShareIcon />} onClick={handleShare} variant="outlined"
              sx={{ borderColor:'rgba(255,255,255,0.3)', color:'white', textTransform:'none', borderRadius:'10px', fontWeight:600 }}>
              Share
            </Button>
            <Button onClick={() => { const t=encodeURIComponent(`🎓 Earned certificate for "${cert?.course_title}" on Campus Connect!\nVerify: ${verifyUrl}`); window.open('https://wa.me/?text='+t,'_blank'); }}
              variant="outlined"
              sx={{ borderColor:'#25D366', color:'#25D366', textTransform:'none', borderRadius:'10px', fontWeight:700 }}>
              💬 WhatsApp
            </Button>
            <Button startIcon={downloading ? <CircularProgress size={16} sx={{ color:'#000' }} /> : <DownloadIcon />}
              onClick={handleDownload} disabled={downloading} variant="contained"
              sx={{ background:'linear-gradient(135deg,#F59E0B,#D97706)', textTransform:'none', borderRadius:'10px', fontWeight:700, boxShadow:'none', color:'#000' }}>
              {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </Box>
        </Box>
      </Container>

      {/* THE CERTIFICATE — captured pixel-perfect by html2canvas */}
      <Container maxWidth="lg" sx={{ display:'flex', justifyContent:'center' }}>
        <Box ref={certRef} sx={{
          width:'100%', maxWidth:900, minHeight:620,
          background:'white', borderRadius:'20px', position:'relative',
          overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.4)',
          fontFamily:"'Inter',sans-serif",
        }}>
          <Box sx={{ position:'absolute', inset:0,
            background:'radial-gradient(ellipse at 0% 0%, #EEF2FF 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, #FDE68A22 0%, transparent 50%)' }} />
          <Box sx={{ position:'absolute', left:0, top:0, bottom:0, width:12, background:'linear-gradient(180deg,#F59E0B,#D97706,#92400E)' }} />
          <Box sx={{ position:'absolute', right:0, top:0, bottom:0, width:6, background:'linear-gradient(180deg,#4F46E5,#7C3AED)' }} />
          <Box sx={{ position:'absolute', top:0, left:12, right:6, height:6, background:'linear-gradient(90deg,#F59E0B,#4F46E5,#7C3AED)' }} />
          <Box sx={{ position:'absolute', bottom:0, left:12, right:6, height:6, background:'linear-gradient(90deg,#4F46E5,#7C3AED,#F59E0B)' }} />

          <Box sx={{ position:'relative', px:{ xs:5, md:8 }, py:5, minHeight:620, display:'flex', flexDirection:'column' }}>
            {/* Header */}
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:4 }}>
              <Box>
                <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:0.5 }}>
                  <Box sx={{ width:36, height:36, borderRadius:'8px', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>🎓</Box>
                  <Typography sx={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1.1rem', color:'#1E1B4B' }}>Campus Connect</Typography>
                </Box>
                <Typography sx={{ fontSize:'0.68rem', color:'#6B7280', letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:600 }}>VTU Student Portal</Typography>
              </Box>
              <Box sx={{ textAlign:'right' }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:0.5, justifyContent:'flex-end', mb:0.3 }}>
                  <VerifiedIcon sx={{ color:'#059669', fontSize:'0.9rem' }} />
                  <Typography sx={{ color:'#059669', fontWeight:700, fontSize:'0.72rem' }}>Verified Certificate</Typography>
                </Box>
                <Typography sx={{ fontSize:'0.65rem', color:'#9CA3AF', fontFamily:'monospace' }}>{cert?.certificate_id}</Typography>
              </Box>
            </Box>

            {/* Body */}
            <Box sx={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <Typography sx={{ fontSize:'0.72rem', color:'#6B7280', letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:700, mb:2 }}>
                Certificate of Completion
              </Typography>
              <Typography sx={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', color:'#374151', mb:1.5 }}>
                This is to certify that
              </Typography>
              <Typography sx={{
                fontFamily:"'Playfair Display',serif", fontSize:{ xs:'2rem', md:'2.8rem' }, fontWeight:700,
                lineHeight:1.1, mb:0.5,
                background:'linear-gradient(135deg,#1E1B4B,#4F46E5)',
                backgroundClip:'text', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>
                {cert?.full_name}
              </Typography>
              {cert?.college && (
                <Typography sx={{ color:'#6B7280', fontSize:'0.85rem', mb:2 }}>
                  {cert.college}{cert.branch ? ` · ${cert.branch}` : ''}
                </Typography>
              )}
              <Typography sx={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', color:'#374151', mb:1.5 }}>
                has successfully completed the course
              </Typography>
              <Box sx={{ bgcolor:'#EEF2FF', border:'2px solid #C7D2FE', borderRadius:'14px', px:4, py:1.5, mb:3, maxWidth:560, width:'100%' }}>
                <Typography sx={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:{ xs:'1.1rem', md:'1.3rem' }, color:'#1E1B4B' }}>
                  {cert?.course_title}
                </Typography>
                {cert?.category && (
                  <Typography sx={{ fontSize:'0.68rem', color:'#6366F1', fontWeight:600, mt:0.3, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                    {CAT_LABEL[cert.category] || cert.category}
                  </Typography>
                )}
              </Box>
              {completedDate && (
                <Typography sx={{ color:'#6B7280', fontSize:'0.82rem', mb:3 }}>
                  Completed on <strong style={{ color:'#374151' }}>{completedDate}</strong>
                  {cert?.year_scheme && <span> · Scheme {cert.year_scheme}</span>}
                </Typography>
              )}

              {/* Signature + QR row */}
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', width:'100%', maxWidth:700, mt:'auto', pt:3 }}>
                <Box sx={{ textAlign:'center' }}>
                  <Box sx={{ borderTop:'2px solid #E5E7EB', pt:1, px:3 }}>
                    <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:'#374151' }}>Campus Connect</Typography>
                    <Typography sx={{ fontSize:'0.62rem', color:'#9CA3AF' }}>VTU Student Portal</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign:'center' }}>
                  <QRCode value={verifyUrl} size={72} />
                  <Typography sx={{ fontSize:'0.6rem', color:'#9CA3AF', mt:0.5 }}>Scan to Verify</Typography>
                </Box>
                <Box sx={{ textAlign:'center' }}>
                  <Box sx={{ borderTop:'2px solid #E5E7EB', pt:1, px:3 }}>
                    <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:'#374151' }}>Director, Academics</Typography>
                    <Typography sx={{ fontSize:'0.62rem', color:'#9CA3AF' }}>Authorized Signatory</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ mt:3 }}>
        <Box sx={{ bgcolor:'rgba(255,255,255,0.06)', borderRadius:'16px', p:2.5, border:'1px solid rgba(255,255,255,0.1)', maxWidth:900, mx:'auto' }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
            <QrCode2Icon sx={{ color:'#A5B4FC' }} />
            <Box>
              <Typography sx={{ color:'#E0E7FF', fontWeight:700, fontSize:'0.85rem' }}>Certificate ID &amp; Verification URL</Typography>
              <Typography sx={{ color:'#A5B4FC', fontSize:'0.75rem', fontFamily:'monospace' }}>{verifyUrl}</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
