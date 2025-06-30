import React, { useState } from 'react';

import Header from './Header';
import Footer from './Footer';
import '../styles/ShareDocuments.css';
import API from '../api';

function ShareDocuments() {
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
    formData.append('sharedDocument', file);

    try {
      const token = localStorage.getItem('token');
      await API.post('/api/users/share-document', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Document shared successfully!');
    } catch (error) {
      console.error('Error sharing document:', error);
      setMessage('Failed to share document.');
    }
  };

  return (
    <>
    <Header />
    <div className="share-documents-page">
      
      <div className="share-documents-content">
        <h2>Share Document</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        {message && <p>{message}</p>}
      </div>
     
    </div>
    <Footer />
    </>
  );
}

export default ShareDocuments;
