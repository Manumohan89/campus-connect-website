import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Full Name:</strong> {profile.full_name}</p>
      <p><strong>Semester:</strong> {profile.semester}</p>
      <p><strong>College:</strong> {profile.college}</p>
      <p><strong>Mobile:</strong> {profile.mobile}</p>
      <p><strong>Branch:</strong> {profile.branch}</p>
      <p><strong>Year Scheme:</strong> {profile.year_scheme}</p>
    </div>
  );
}

export default ViewProfile;
