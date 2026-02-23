import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <PublicHeader />
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Campus Connect</h1>
          <p>Your gateway to academic excellence and professional growth.</p>
          <Link to="/login" className="cta-button">Get Started</Link>
        </div>
      </div>
      <div className="features-section">
        <div className="feature">
          <h2>Track Your Progress</h2>
          <p>Upload your marks and keep track of your SGPA and CGPA effortlessly.</p>
        </div>
        <div className="feature">
          <h2>Share and Collaborate</h2>
          <p>Share documents with peers and collaborate on projects seamlessly.</p>
        </div>
        <div className="feature">
          <h2>Stay Updated</h2>
          <p>Get the latest job opportunities and academic resources at your fingertips.</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

export default Home;
