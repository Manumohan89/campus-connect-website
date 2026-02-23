import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import './UpdateProfile.css';

function UpdateProfile() {
  const [profile, setProfile] = useState({
    fullName: '',
    semester: '',
    college: '',
    mobile: '',
    branch: '',
    yearScheme: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setProfile(response.data);
        } else {
          setError('Failed to load profile data.');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('An error occurred while loading the profile.');
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/users/profile', profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated successfully!');
      window.location.href = '/profile'; // Redirect to profile page after updating
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="update-profile-page">
      <Header />
      <div className="update-profile-content">
        <h2>Update Your Profile</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={profile.fullName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="semester"
            placeholder="Semester"
            value={profile.semester}
            onChange={handleChange}
          />
          <input
            type="text"
            name="college"
            placeholder="College"
            value={profile.college}
            onChange={handleChange}
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile"
            value={profile.mobile}
            onChange={handleChange}
          />
          <input
            type="text"
            name="branch"
            placeholder="Branch"
            value={profile.branch}
            onChange={handleChange}
          />
          <input
            type="text"
            name="yearScheme"
            placeholder="Year Scheme"
            value={profile.yearScheme}
            onChange={handleChange}
          />
          <button type="submit">Update Profile</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default UpdateProfile;
