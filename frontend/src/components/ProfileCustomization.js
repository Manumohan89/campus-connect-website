import React, { useState } from 'react';
import {
  Box, Container, Card, Typography, Grid, Button, Avatar, Chip,
  Snackbar, Alert
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../utils/api';

const AVATARS = [
  { id: 'indigo', initials: 'YO', bg: '#4F46E5', label: 'Indigo Scholar' },
  { id: 'purple', initials: 'YO', bg: '#7C3AED', label: 'Purple Pioneer' },
  { id: 'sky', initials: 'YO', bg: '#0EA5E9', label: 'Sky Thinker' },
  { id: 'green', initials: 'YO', bg: '#10B981', label: 'Green Growth' },
  { id: 'amber', initials: 'YO', bg: '#F59E0B', label: 'Amber Achiever' },
  { id: 'rose', initials: 'YO', bg: '#EF4444', label: 'Rose Leader' },
  { id: 'pink', initials: 'YO', bg: '#EC4899', label: 'Pink Creator' },
  { id: 'teal', initials: 'YO', bg: '#14B8A6', label: 'Teal Innovator' },
];

const THEMES = [
  { id: 'default', label: 'Classic Indigo', primary: '#4F46E5', secondary: '#7C3AED' },
  { id: 'ocean', label: 'Ocean Blue', primary: '#0EA5E9', secondary: '#0284C7' },
  { id: 'forest', label: 'Forest Green', primary: '#10B981', secondary: '#059669' },
  { id: 'sunset', label: 'Sunset Orange', primary: '#F59E0B', secondary: '#EF4444' },
];

export default function ProfileCustomization() {
  const [selectedAvatar, setSelectedAvatar] = useState('indigo');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', { profile_avatar: selectedAvatar });
      setSnack('Profile customized successfully!');
      setTimeout(() => navigate('/profile'), 1200);
    } catch {
      setSnack('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-card2,#F8FAFC)' }}>
      <Header />

      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', py: 5, px: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
            <PaletteIcon sx={{ color: '#A5B4FC' }} />
            <Typography sx={{ color: '#A5B4FC', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personalization</Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900, color: 'white' }}>Profile Customization</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>Choose your avatar color and app theme</Typography>
        </Container>
      </Box>

      <Container sx={{ py: 4 }} maxWidth="md">
        <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
          More customization options coming soon — profile bio, cover photo, and social links!
        </Alert>

        {/* Avatar selection */}
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: 3, mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1,#111827)', mb: 0.5 }}>Avatar Color</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', mb: 3 }}>Choose a color that represents you</Typography>
          <Grid container spacing={2}>
            {AVATARS.map(av => (
              <Grid item xs={6} sm={3} key={av.id}>
                <Box onClick={() => setSelectedAvatar(av.id)}
                  sx={{ cursor: 'pointer', textAlign: 'center', p: 2, borderRadius: '14px', border: `2px solid ${selectedAvatar === av.id ? av.bg : '#E5E7EB'}`, bgcolor: selectedAvatar === av.id ? av.bg + '10' : 'white', transition: 'all 0.15s', position: 'relative', '&:hover': { borderColor: av.bg } }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: av.bg, mx: 'auto', mb: 1, fontSize: '1.1rem', fontWeight: 900 }}>YO</Avatar>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{av.label}</Typography>
                  {selectedAvatar === av.id && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', bgcolor: av.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckIcon sx={{ fontSize: 12, color: 'white' }} />
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* Theme selection */}
        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '20px', p: 3, mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1,#111827)', mb: 0.5 }}>Color Theme</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', mb: 3 }}>App theme (coming soon)</Typography>
          <Grid container spacing={2}>
            {THEMES.map(t => (
              <Grid item xs={6} sm={3} key={t.id}>
                <Box onClick={() => setSelectedTheme(t.id)}
                  sx={{ cursor: 'pointer', p: 2, borderRadius: '14px', border: `2px solid ${selectedTheme === t.id ? t.primary : '#E5E7EB'}`, bgcolor: selectedTheme === t.id ? t.primary + '08' : 'white', transition: 'all 0.15s', '&:hover': { borderColor: t.primary } }}>
                  <Box sx={{ display: 'flex', gap: 0.75, mb: 1 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: t.primary }} />
                    <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: t.secondary }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{t.label}</Typography>
                  {selectedTheme === t.id && <Chip label="Active" size="small" sx={{ mt: 0.5, bgcolor: t.primary + '20', color: t.primary, fontWeight: 700, fontSize: '0.65rem' }} />}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>

        <Button fullWidth variant="contained" size="large" onClick={handleSave} disabled={saving}
          sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', textTransform: 'none', fontWeight: 700, borderRadius: '14px', py: 1.5, boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
          {saving ? 'Saving...' : 'Save Customization'}
        </Button>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Footer />
    </Box>
  );
}
