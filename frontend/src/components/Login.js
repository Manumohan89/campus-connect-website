import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import '../styles/Login.css';
import API from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await API.post('/api/users/login', { username, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <div className="login-content-container">
        <div className="left-section">
          <div className="icon-container">
            <img src={require("../components/images/campusconnect.jpg")} alt="Campus Connect" />
            <h1>Welcome Back!</h1>
            <p>Stay connected and access all your academic resources in one place.</p>
          </div>
        </div>
        <div className="right-section">
          <div className="main-content login-content">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Login
              </button>
              {error && <p className="error">{error}</p>}
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}

export default Login;
