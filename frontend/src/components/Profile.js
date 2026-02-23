import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return <div className="profile-page"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="profile-page"><p>{error}</p></div>;
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        <h2>User Profile</h2>
        <div className="profile-info">
          <div className="profile-img-container">
            <img src={profile.profileImage || '/default-avatar.png'} alt="Profile" />
          </div>
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
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
