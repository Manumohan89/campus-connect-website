import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './ProfileCustomization.css';

function ProfileCustomization() {
  const [avatar, setAvatar] = useState(null);
  const avatarOptions = ['avatar1.png', 'avatar2.png', 'avatar3.png'];

  const selectAvatar = (avatar) => {
    setAvatar(avatar);
    // Make an API call to update the user profile with the selected avatar
  };

  return (
    <div className="profile-customization-page">
      <Header />
      <div className="profile-customization-content">
        <h2>Customize Your Profile</h2>
        <div className="avatar-options">
          {avatarOptions.map((option, index) => (
            <img
              key={index}
              src={`/avatars/${option}`}
              alt={`Avatar ${index}`}
              onClick={() => selectAvatar(option)}
              className={`avatar ${avatar === option ? 'selected' : ''}`}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfileCustomization;
