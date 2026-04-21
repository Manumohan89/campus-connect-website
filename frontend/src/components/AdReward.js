/**
 * AdReward.js — Ad Revenue Sharing Component
 *
 * Integrates Google AdSense (and alternative ad networks).
 * Users earn a share of ad revenue by watching/viewing ads.
 * 
 * Ad Network Options (researched):
 * 1. Google AdSense — Best CPM, auto-ads, requires approval
 * 2. Media.net       — Yahoo/Bing network, good for education sites
 * 3. PropellerAds    — No approval needed, good fill rate
 * 4. Ezoic          — AI-optimised, requires 10k+ monthly visits
 *
 * Revenue Share Model: Platform earns ad revenue → shares 20% with user
 * Example: Ad earns ₹10 impression → User gets ₹2 in wallet
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Chip, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material';
import api from '../utils/api';

// ─── Rewarded Ad Banner ───────────────────────────────────────────────────────
export function RewardedAdBanner({ onEarn, adSlot = 'YOUR_AD_SLOT_ID' }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const adRef  = useRef(null);
  const [watched,   setWatched]   = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [earning,   setEarning]   = useState(false);

  // Load Google AdSense script (add once in index.html for production)
  useEffect(() => {
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWatchAd = () => {
    // In production this would trigger a rewarded ad unit
    // For now simulate a 5-second "ad view"
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          setWatched(true);
          setCountdown(null);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const claimReward = async () => {
    setEarning(true);
    try {
      await api.post('/earn/ad-reward', { ad_slot: adSlot });
      onEarn && onEarn(0.5); // ₹0.5 per ad view (20% of ~₹2.5 CPM)
    } catch {}
    setEarning(false);
    setWatched(false);
  };

  return (
    <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: isDark ? '#334155' : '#e2e8f0',
                bgcolor: isDark ? '#1e293b' : '#f8fafc', mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography fontWeight={700} fontSize="0.88rem" color="text.primary">📢 Watch an Ad, Earn ₹0.50</Typography>
          <Typography fontSize="0.72rem" color="text.secondary">You get 20% of ad revenue. No spam, 1 ad/hour.</Typography>
        </Box>
        <Chip label="₹0.50" size="small" sx={{ bgcolor: '#10b98118', color: '#10b981', fontWeight: 700 }} />
      </Box>

      {countdown !== null && (
        <Box sx={{ mb: 1.5 }}>
          <LinearProgress variant="determinate" value={((5 - countdown) / 5) * 100}
            sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? '#334155' : '#e2e8f0',
                  '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' } }} />
          <Typography fontSize="0.72rem" color="text.secondary" mt={0.5}>Ad playing… {countdown}s</Typography>
        </Box>
      )}

      {/* Actual AdSense unit — replace data-ad-slot with your real slot ID */}
      <Box ref={adRef} sx={{ my: 1, display: countdown !== null ? 'block' : 'none' }}>
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-YOUR_ADSENSE_PUBLISHER_ID"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true" />
      </Box>

      {!watched && countdown === null && (
        <Button size="small" onClick={handleWatchAd} variant="outlined"
          sx={{ borderColor: '#f59e0b', color: '#f59e0b', textTransform: 'none', fontWeight: 600,
                fontSize: '0.78rem', '&:hover': { bgcolor: '#f59e0b11' } }}>
          ▶ Watch Ad & Earn
        </Button>
      )}

      {watched && (
        <Button size="small" onClick={claimReward} disabled={earning} variant="contained"
          sx={{ bgcolor: '#10b981', color: '#fff', textTransform: 'none', fontWeight: 700,
                fontSize: '0.78rem', '&:hover': { bgcolor: '#059669' } }}>
          {earning ? 'Claiming…' : '💰 Claim ₹0.50'}
        </Button>
      )}
    </Box>
  );
}

// ─── Standard Display Ad ──────────────────────────────────────────────────────
export function DisplayAd({ slot = 'YOUR_AD_SLOT_ID', format = 'auto' }) {
  const adRef = useRef(null);

  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ textAlign: 'center', my: 2 }}>
      <Typography fontSize="0.6rem" color="#94a3b8" mb={0.5}>Advertisement</Typography>
      <ins ref={adRef} className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_ADSENSE_PUBLISHER_ID"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true" />
    </Box>
  );
}

export default RewardedAdBanner;
