import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Grid, Card, CardContent, Button,
  Chip, Skeleton, Alert, Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const getFileIcon = (mime) => {
  if (!mime) return <DescriptionIcon sx={{ fontSize: 32, color: '#94A3B8' }} />;
  if (mime.startsWith('image/')) return <ImageIcon sx={{ fontSize: 32, color: '#0EA5E9' }} />;
  if (mime === 'application/pdf') return <PictureAsPdfIcon sx={{ fontSize: 32, color: '#EF4444' }} />;
  return <DescriptionIcon sx={{ fontSize: 32, color: '#7C3AED' }} />;
};

const getTypeLabel = (mime) => {
  if (!mime) return 'File';
  if (mime.startsWith('image/')) return 'Image';
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word')) return 'Word';
  if (mime.includes('sheet') || mime.includes('excel')) return 'Excel';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PPT';
  return 'Document';
};

export default function SharedDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/shared-documents')
      .then(r => setDocs(r.data || []))
      .catch(() => setError('Failed to load shared documents.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
      <Header />

      <Box sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #0369A1 100%)', py: 5, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
            <FolderSharedIcon sx={{ color: '#BAE6FD', fontSize: 20 }} />
            <Typography sx={{ color: '#BAE6FD', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Collaboration</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900, color: 'white' }}>Shared Documents</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>Documents shared by you and your classmates</Typography>
            </Box>
            <Button variant="contained" onClick={() => navigate('/share-documents')}
              sx={{ bgcolor: 'white', color: '#0369A1', fontWeight: 700, borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#E0F2FE' } }}>
              + Share New
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '16px' }} />
              </Grid>
            ))}
          </Grid>
        ) : docs.length === 0 ? (
          <Paper elevation={0} sx={{ border: '2px dashed #E5E7EB', borderRadius: '20px', p: 8, textAlign: 'center', bgcolor: 'white' }}>
            <FolderSharedIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontWeight: 700, color: '#374151', mb: 1 }}>No documents shared yet</Typography>
            <Typography sx={{ color: '#9CA3AF', mb: 3 }}>Be the first to share study materials with your classmates</Typography>
            <Button variant="contained" onClick={() => navigate('/share-documents')}
              sx={{ bgcolor: '#0EA5E9', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}>
              Share a Document
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {docs.map((doc, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(14,165,233,0.12)' } }}>
                  <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #F3F4F6' }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: '12px', bgcolor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {getFileIcon(doc.mime_type)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1,#111827)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</Typography>
                      <Chip label={getTypeLabel(doc.mime_type)} size="small" sx={{ mt: 0.5, bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700, fontSize: '0.65rem' }} />
                    </Box>
                  </Box>
                  <CardContent sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'flex-end' }}>
                    <Button fullWidth variant="outlined" startIcon={<DownloadIcon />}
                      href={`/uploads/${doc.file_id}`} target="_blank" rel="noopener noreferrer"
                      sx={{ textTransform: 'none', borderRadius: '10px', borderColor: '#0EA5E9', color: '#0369A1', fontWeight: 600, '&:hover': { bgcolor: '#F0F9FF', borderColor: '#0369A1' } }}>
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
