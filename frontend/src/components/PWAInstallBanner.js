import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (localStorage.getItem('pwaDismissed') === 'true') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Track visit count
    const visits = parseInt(localStorage.getItem('visitCount') || '0') + 1;
    localStorage.setItem('visitCount', visits);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (visits >= 3) setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    // For iOS (Safari doesn't support beforeinstallprompt)
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isInStandalone = window.navigator.standalone;
    if (isIOS && !isInStandalone && visits >= 3) setShow(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') localStorage.setItem('pwaDismissed', 'true');
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem('pwaDismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: 'linear-gradient(135deg,#1E1B4B,#4F46E5)',
        px: { xs: 2, sm: 3 }, py: 2,
        display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GetAppIcon sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} color="white" fontSize="0.875rem">Install Campus Connect</Typography>
          <Typography color="rgba(255,255,255,0.7)" fontSize="0.75rem">
            {isIOS ? 'Tap Share → Add to Home Screen for offline access' : 'Add to home screen for faster access and offline use'}
          </Typography>
        </Box>
        {!isIOS && (
          <Button variant="contained" size="small" onClick={handleInstall}
            sx={{ bgcolor: 'white', color: '#4F46E5', fontWeight: 700, textTransform: 'none', borderRadius: '8px', flexShrink: 0, '&:hover': { bgcolor: '#F1F5F9' } }}>
            Install
          </Button>
        )}
        <IconButton size="small" onClick={dismiss} sx={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0, ml: isIOS ? 'auto' : 0 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Slide>
  );
}
