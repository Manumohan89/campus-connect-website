import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import './UploadMarks.css';

function UploadMarks() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('marksCard', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/upload-marks', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Display the message, SGPA, and CGPA
      setMessage('Marks card uploaded and SGPA/CGPA updated successfully!');
    } catch (error) {
      console.error('Error uploading marks card:', error);
      setMessage('Failed to upload marks card.');
    }
  };

  return (
    <div className="upload-marks-page">
      <Header />
      <div className="upload-marks-content">
        <h2>Upload Marks Card</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        {message && <p>{message}</p>}
      </div>
      <Footer />
    </div>
  );
}

export default UploadMarks;
