import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>
      <Container maxWidth="sm" sx={{ textAlign:'center' }}>
        {/* Big 404 */}
        <Box sx={{ mb:4 }}>
          <Typography sx={{ fontSize:{xs:'6rem',md:'10rem'}, fontWeight:900, lineHeight:1, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', backgroundClip:'text', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontFamily:"'Space Grotesk',sans-serif" }}>
            404
          </Typography>
          <Typography sx={{ fontSize:'1.5rem', fontWeight:800, color:'#111827', mt:-2, mb:1 }}>
            Page Not Found
          </Typography>
          <Typography color="text.secondary" fontSize="1rem" mb={4} lineHeight={1.7}>
            The page you're looking for doesn't exist or has been moved. Check the URL or go back to where you came from.
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display:'flex', gap:2, justifyContent:'center', flexWrap:'wrap' }}>
          <Button variant="contained" startIcon={<Home />} onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
            sx={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', fontWeight:700, borderRadius:'12px', textTransform:'none', px:3, py:1.25, boxShadow:'none' }}>
            {isLoggedIn ? 'Go to Dashboard' : 'Go to Home'}
          </Button>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}
            sx={{ borderColor:'#4F46E5', color:'#4F46E5', fontWeight:700, borderRadius:'12px', textTransform:'none', px:3, py:1.25 }}>
            Go Back
          </Button>
        </Box>

        {/* Quick links */}
        <Box sx={{ mt:6, p:3, bgcolor:'white', border:'1px solid #E5E7EB', borderRadius:'16px' }}>
          <Typography fontWeight={700} color="#374151" mb={2} fontSize="0.9rem">Maybe you were looking for:</Typography>
          <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', justifyContent:'center', mt:1.5 }}>
            {[
              ['/sgpa-calculator','SGPA Calculator'], ['/vtu-resources','VTU Notes'],
              [isLoggedIn?'/upload-marks':'/register', isLoggedIn?'Upload Marks':'Register Free'],
              [isLoggedIn?'/training':'/login', isLoggedIn?'Courses':'Login'],
            ].map(([path, label]) => (
              <Button key={path} size="small" variant="outlined" onClick={() => navigate(path)}
                sx={{ borderRadius:'8px', textTransform:'none', borderColor:'#E5E7EB', color:'#374151', fontWeight:600, fontSize:'0.8rem', '&:hover':{borderColor:'#4F46E5', color:'#4F46E5'} }}>
                {label}
              </Button>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
