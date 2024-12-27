import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import '../styles/Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        <h2 className="profile-title">User Profile</h2>
        <div className="profile-details">
          <table>
            <tbody>
              <tr>
                <th>Full Name:</th>
                <td>{profile.full_name}</td>
              </tr>
              <tr>
                <th>Semester:</th>
                <td>{profile.semester}</td>
              </tr>
              <tr>
                <th>College:</th>
                <td>{profile.college}</td>
              </tr>
              <tr>
                <th>Branch:</th>
                <td>{profile.branch}</td>
              </tr>
              <tr>
                <th>SGPA:</th>
                <td>{profile.sgpa || 'Not Available'}</td>
              </tr>
              <tr>
                <th>CGPA:</th>
                <td>{profile.cgpa || 'Not Available'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          className="update-profile-btn"
          onClick={() => navigate('/update-profile')}
        >
          Update Profile
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
