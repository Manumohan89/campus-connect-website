import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography, Box, Button, CircularProgress, Avatar } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import './Dashboard.css';

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

        const response = await axios.get('/api/users/dashboard-data', {
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
      <Container maxWidth="lg" sx={{ padding: '2rem 0' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Welcome, {data.username}!</Typography>

        {/* Main Features Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} onClick={() => navigate('/profile')} sx={{ cursor: 'pointer', height: '100%' }}>
              <CardContent>
                <Typography variant="h5">Profile</Typography>
                <Typography>View and update your profile information.</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} onClick={() => navigate('/upload-marks')} sx={{ cursor: 'pointer', height: '100%' }}>
              <CardContent>
                <Typography variant="h5">Upload Marks</Typography>
                <Typography>Track your academic progress by uploading marks.</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} onClick={() => navigate('/job-opportunities')} sx={{ cursor: 'pointer', height: '100%' }}>
              <CardContent>
                <Typography variant="h5">Job Opportunities</Typography>
                <Typography>Explore relevant internships and job opportunities.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Achievements Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Your Achievements</Typography>
          <Grid container spacing={4}>
            {achievements.map((achievement, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="achievement-card" elevation={3}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ margin: 'auto', bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {achievement.icon}
                    </Avatar>
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

        {/* Action Buttons */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/reminders')} sx={{ mr: 2 }}>
            Set Reminders
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/shared-documents')}>
            View Shared Documents
          </Button>
        </Box>
      </Container>
      <Footer />
    </div>
  );
};

export default Dashboard;
