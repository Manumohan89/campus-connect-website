import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import './Dashboard.css';

function Dashboard() {
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        <h2>Welcome, {data.username}!</h2>
        <p>Your semester: {data.semester}</p>
        <p>Your CGPA: {data.cgpa}</p>
        <div className="dashboard-grid">
          <div className="dashboard-item" onClick={() => navigate('/profile')}>
            <h3>Profile</h3>
            <p>View and update your profile information.</p>
          </div>
          <div className="dashboard-item" onClick={() => navigate('/upload-marks')}>
            <h3>Upload Marks</h3>
            <p>Upload your marks and track your academic progress.</p>
          </div>
          <div className="dashboard-item" onClick={() => navigate('/share-documents')}>
            <h3>Share Documents</h3>
            <p>Share documents with others securely.</p>
          </div>
          <div className="dashboard-item" onClick={() => navigate('/shared-documents')}>
            <h3>Shared Documents</h3>
            <p>View documents shared with you.</p>
          </div>
          <div className="dashboard-item" onClick={async () => {
            try {
              const response = await axios.get('/api/users/sgpa', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });
              alert(`Your SGPA is: ${response.data.sgpa}`);
            } catch (error) {
              alert('An error occurred while loading the SGPA.');
            }
          }}>
            <h3>Check SGPA</h3>
          </div>
          <div className="dashboard-item" onClick={async () => {
            try {
              const response = await axios.get('/api/users/cgpa', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });
              alert(`Your CGPA is: ${response.data.cgpa}`);
            } catch (error) {
              alert('An error occurred while loading the CGPA.');
            }
          }}>
            <h3>Check CGPA</h3>
          </div>
          <div className="dashboard-item" onClick={() => navigate('/reminders')}>
            <h3>Set Reminders</h3>
            <p>Set and manage reminders for your tasks.</p>
          </div>
          <div className="dashboard-item" onClick={() => navigate('/job-opportunities')}>
            <h3>Job Opportunities</h3>
            <p>Explore job opportunities and internships.</p>
          </div>
          <div className="dashboard-item" onClick={() => navigate('/profilecustomization')}>
            <h3>Profile coustamization</h3>
            <p>Costamize your profile with our advanced features.</p>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;
