import React from 'react';
import './PublicFooter.css';

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer-content">
        <div className="footer-section">
          <h4>About Us</h4>
          <p>Campus Connect is your go-to platform for managing your campus life efficiently.</p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@campusconnect.com</p>
          <p>Phone: +1 234 567 890</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <a href="#!">Facebook</a>
          <a href="#!">Twitter</a>
          <a href="#!">Instagram</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} Campus Connect. All rights reserved.</p>
        <p>
          <a href="/terms">Terms of Service</a> | <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
}

export default PublicFooter;
