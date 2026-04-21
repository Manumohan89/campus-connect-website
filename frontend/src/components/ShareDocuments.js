import React, { useState } from 'react';
import {
  Container, Box, Card, Typography, Button, Alert, Paper, LinearProgress, Snackbar, Chip
} from '@mui/material';
import { Share, CloudUpload, CheckCircle, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const ALLOWED = ['.pdf','.doc','.docx','.ppt','.pptx','.xls','.xlsx','.jpg','.png'];
const MAX_MB = 50;

export default function ShareDocuments() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File exceeds ${MAX_MB}MB limit.`); return; }
    setFile(f);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append('sharedDocument', file);
    try {
      await api.post('/users/share-document', fd);
      setSuccess(true);
      setSnack('Document shared successfully!');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
      <Header />

      <Box sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #0EA5E9 100%)', py: 5, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
            <Share sx={{ color: '#BAE6FD', fontSize: 20 }} />
            <Typography sx={{ color: '#BAE6FD', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Collaboration</Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900, color: 'white' }}>Share Document</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>Share study materials, notes, and resources with your classmates</Typography>
        </Container>
      </Box>

      <Container sx={{ py: 4 }} maxWidth="sm">
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: { xs: 3, md: 4 } }}>
          {/* Guidelines */}
          <Paper sx={{ p: 2.5, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: '#1D4ED8', mb: 1, fontSize: '0.875rem' }}>📁 Sharing Guidelines</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#1E40AF', lineHeight: 1.7 }}>
              Share notes, PYQs, project files, or lab records.<br />
              Supported: {ALLOWED.join(', ')} · Max size: {MAX_MB}MB
            </Typography>
          </Paper>

          {/* Drop zone */}
          <Paper component="label"
            sx={{ p: 5, textAlign: 'center', border: `2px dashed ${file ? '#0EA5E9' : '#CBD5E1'}`, bgcolor: file ? '#F0F9FF' : '#F8FAFC', borderRadius: '14px', cursor: 'pointer', display: 'block', mb: 2.5, transition: 'all 0.2s', '&:hover': { borderColor: '#0EA5E9', bgcolor: '#F0F9FF' } }}>
            <input hidden type="file" accept={ALLOWED.join(',')} onChange={handleFileChange} disabled={loading} />
            <CloudUpload sx={{ fontSize: 48, color: file ? '#0EA5E9' : '#94A3B8', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, color: file ? '#0369A1' : '#64748B' }}>
              {file ? `📄 ${file.name}` : 'Click to browse or drop file here'}
            </Typography>
            <Typography variant="caption" color="text.secondary">PDF, DOC, PPT, Excel, Images</Typography>
          </Paper>

          {file && !success && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mb: 2 }}>
              <Chip label={`${(file.size / 1024 / 1024).toFixed(1)} MB`} size="small" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600 }} />
              <Button size="small" onClick={() => setFile(null)} sx={{ color: '#EF4444', textTransform: 'none' }}>Remove</Button>
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
          {loading && <><Typography variant="caption" color="text.secondary">Uploading...</Typography><LinearProgress sx={{ mb: 2, borderRadius: 99 }} /></>}

          {!success ? (
            <Button fullWidth variant="contained" size="large" onClick={handleUpload} disabled={loading || !file}
              sx={{ background: 'linear-gradient(135deg, #0EA5E9, #0369A1)', textTransform: 'none', fontWeight: 700, borderRadius: '12px', py: 1.5, boxShadow: 'none' }}>
              {loading ? 'Sharing...' : 'Share Document'}
            </Button>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#F0FDF4', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
              <CheckCircle sx={{ fontSize: 44, color: '#10B981', mb: 1 }} />
              <Typography sx={{ fontWeight: 800, color: '#065F46', mb: 0.5 }}>Shared Successfully!</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>Your document is now available to your classmates.</Typography>
              <Button variant="outlined" endIcon={<ArrowForward />} onClick={() => navigate('/shared-documents')}
                sx={{ textTransform: 'none', borderRadius: '10px', borderColor: '#10B981', color: '#065F46' }}>
                View Shared Documents
              </Button>
            </Box>
          )}
        </Card>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
