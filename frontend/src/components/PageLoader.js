/**
 * PageLoader — full-page loading skeleton used on initial page load.
 * Import and use in any page as the loading state fallback.
 */
import React from 'react';
import { Box, Skeleton, Container, Grid } from '@mui/material';

export function DashboardSkeleton() {
  return (
    <Box sx={{ bgcolor:'#F8FAFC', minHeight:'100vh' }}>
      {/* Navbar skeleton */}
      <Box sx={{ height:62, bgcolor:'#1E1B4B', px:3, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Skeleton variant="rectangular" width={160} height={28} sx={{ bgcolor:'rgba(255,255,255,0.1)', borderRadius:1 }} />
        <Box sx={{ display:'flex', gap:2 }}>
          {[80,70,90,60,75].map((w,i) => <Skeleton key={i} variant="rectangular" width={w} height={20} sx={{ bgcolor:'rgba(255,255,255,0.08)', borderRadius:1 }} />)}
        </Box>
      </Box>
      {/* Hero skeleton */}
      <Skeleton variant="rectangular" height={180} sx={{ bgcolor:'#E2E8F0', m:0 }} />
      <Container sx={{ py:4 }}>
        <Grid container spacing={2.5}>
          {[...Array(12)].map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius:'12px' }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export function ListPageSkeleton({ rows = 6 }) {
  return (
    <Box sx={{ bgcolor:'#F8FAFC', minHeight:'100vh' }}>
      <Box sx={{ height:62, bgcolor:'#1E1B4B' }} />
      <Box sx={{ height:160, bgcolor:'#312E81' }} />
      <Container sx={{ py:4 }}>
        <Skeleton height={52} sx={{ mb:3, borderRadius:'14px' }} />
        <Grid container spacing={3}>
          {[...Array(rows)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius:'16px' }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export function ProfileSkeleton() {
  return (
    <Box sx={{ bgcolor:'#F8FAFC', minHeight:'100vh' }}>
      <Box sx={{ height:62, bgcolor:'#1E1B4B' }} />
      <Box sx={{ height:140, bgcolor:'#312E81' }} />
      <Container sx={{ py:4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={420} sx={{ borderRadius:'20px' }} /></Grid>
          <Grid item xs={12} md={8}><Skeleton variant="rectangular" height={420} sx={{ borderRadius:'20px' }} /></Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default function PageLoader() {
  return <ListPageSkeleton rows={6} />;
}
