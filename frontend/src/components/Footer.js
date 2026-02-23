import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About Campus Connect</h4>
          <p>Campus Connect is your gateway to academic excellence and professional growth. Join us to explore a range of educational resources, track your academic progress, and much more.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/upload-marks">Upload Marks</a></li>
            <li><a href="/share-documents">Share Documents</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: support@campusconnect.com</p>
          <p>Phone: +123 456 7890</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} Campus Connect. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
