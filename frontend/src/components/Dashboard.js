import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Avatar
} from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import '../styles/Dashboard.css';
import API from '../api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User is not authenticated');
          setLoading(false);
          return;
        }

        const response = await API.get('/api/users/dashboard-data', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setData(response.data);
        } else {
          setError('Failed to load dashboard data');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('An error occurred while loading the dashboard.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto' }} />;
  if (error) return <Typography variant="h6" color="error" sx={{ textAlign: 'center' }}>{error}</Typography>;

  const achievements = [
    { title: 'SGPA Master', description: 'Achieved a consistent SGPA of 9+ for 3 semesters', icon: '🎓' },
    { title: 'Document Guru', description: 'Shared 50+ documents on the platform', icon: '📂' },
    { title: 'Job Hunter', description: 'Applied to 5 job opportunities via the platform', icon: '💼' },
  ];

  return (
    <div className="dashboard">
      <Header />

      {/* Hero Section */}
      <Box className="dashboard-hero">
        <Typography variant="h3" className="hero-title">
          Welcome back, {data.username}! 🎉
        </Typography>
        <Typography variant="subtitle1" className="hero-subtitle">
          Here’s your personalized hub for academics, achievements, and more.
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ padding: '2rem 0' }}>
        {/* Main Features */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card className="feature-card" onClick={() => navigate('/profile')}>
              <CardContent>
                <Avatar className="feature-icon">👤</Avatar>
                <Typography variant="h5" className="feature-title">Profile</Typography>
                <Typography className="feature-text">
                  View and update your profile information.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className="feature-card" onClick={() => navigate('/upload-marks')}>
              <CardContent>
                <Avatar className="feature-icon">📊</Avatar>
                <Typography variant="h5" className="feature-title">Upload Marks</Typography>
                <Typography className="feature-text">
                  Track your academic progress by uploading marks.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className="feature-card" onClick={() => navigate('/job-opportunities')}>
              <CardContent>
                <Avatar className="feature-icon">💼</Avatar>
                <Typography variant="h5" className="feature-title">Job Opportunities</Typography>
                <Typography className="feature-text">
                  Explore relevant internships and job opportunities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Achievements */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: '600' }}>
            Your Achievements 🏆
          </Typography>
          <Grid container spacing={4}>
            {achievements.map((achievement, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="achievement-card">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar className="achievement-icon">{achievement.icon}</Avatar>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {achievement.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Actions */}
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Button variant="contained" size="large" sx={{ mr: 2 }} onClick={() => navigate('/reminders')}>
            Set Reminders
          </Button>
          <Button variant="outlined" size="large" color="secondary" onClick={() => navigate('/shared-documents')}>
            View Documents
          </Button>
        </Box>
      </Container>

      <Footer />
    </div>
  );
};

export default Dashboard;
