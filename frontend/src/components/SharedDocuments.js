import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import './SharedDocuments.css';

function SharedDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users/shared-documents', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocuments(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shared documents:', err);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="shared-documents-page">
      <Header />
      <div className="shared-documents-content">
        <h2>Shared Documents</h2>
        <div className="documents-grid">
          {documents.map(doc => (
            <div key={doc.id} className="document-item">
              {doc.mime_type.startsWith('image/') && (
                <img src={`/uploads/${doc.file_name}`} alt={doc.file_name} className="document-preview" />
              )}
              {doc.mime_type === 'application/pdf' && (
                <iframe src={`/uploads/${doc.file_name}`} className="document-preview" title={doc.file_name}></iframe>
              )}
              {doc.mime_type.startsWith('application/') && (
                <a href={`/uploads/${doc.file_name}`} target="_blank" rel="noopener noreferrer" className="document-download">
                  {doc.file_name}
                </a>
              )}
              {/* Add more file types as needed */}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SharedDocuments;
