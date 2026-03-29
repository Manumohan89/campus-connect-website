import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { ErrorOutline, Refresh, Home } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'#F8FAFC' }}>
        <Container maxWidth="sm" sx={{ textAlign:'center' }}>
          <Box sx={{ width:80, height:80, borderRadius:'50%', bgcolor:'#FEE2E2', display:'inline-flex', alignItems:'center', justifyContent:'center', mb:3 }}>
            <ErrorOutline sx={{ fontSize:40, color:'#EF4444' }} />
          </Box>
          <Typography variant="h4" fontWeight={800} fontFamily="'Space Grotesk',sans-serif" mb={1}>Something went wrong</Typography>
          <Typography color="text.secondary" mb={4}>
            The app encountered an unexpected error. This has been noted. Please refresh the page or go back to the dashboard.
          </Typography>
          {this.state.error && (
            <Paper elevation={0} sx={{ p:2, bgcolor:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'12px', mb:3, textAlign:'left' }}>
              <Typography variant="caption" sx={{ color:'#991B1B', fontFamily:"'DM Mono',monospace", display:'block', wordBreak:'break-all' }}>
                {this.state.error.toString()}
              </Typography>
            </Paper>
          )}
          <Box sx={{ display:'flex', gap:2, justifyContent:'center' }}>
            <Button variant="contained" startIcon={<Refresh />} onClick={() => window.location.reload()}
              sx={{ background:'linear-gradient(135deg,#EF4444,#DC2626)', fontWeight:700, borderRadius:'12px', textTransform:'none', boxShadow:'none' }}>
              Refresh Page
            </Button>
            <Button variant="outlined" startIcon={<Home />} onClick={() => { window.location.href = '/dashboard'; }}
              sx={{ borderColor:'#4F46E5', color:'#4F46E5', fontWeight:700, borderRadius:'12px', textTransform:'none' }}>
              Go to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }
}

export default ErrorBoundary;
