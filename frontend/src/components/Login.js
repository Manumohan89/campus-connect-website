import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import '../styles/Login.css';
import API from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const usernameRef = useRef(null);

  // Focus on username input when component mounts
  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  // Real-time validation for username
  const validateUsername = (value) => {
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
    } else {
      setUsernameError('');
    }
  };

  // Real-time validation for password
  const validatePassword = (value) => {
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
    } else {
      setPasswordError('');
    }
  };

  // Handle input changes with validation
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Prevent submission if validation fails
    if (usernameError || passwordError || username.length < 3 || password.length < 6) {
      setError('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post('/api/users/login', { username, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      // Clear form on success
      setUsername('');
      setPassword('');
      setUsernameError('');
      setPasswordError('');
      navigate('/dashboard');
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setUsername('');
    setPassword('');
    setUsernameError('');
    setPasswordError('');
    setError(null);
  };

  return (
    <div className="login-page">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <div className="login-content-container">
        <div className="left-section">
          <div className="icon-container">
            <img src={require("../components/images/Campus-connect-logo.png")} alt="Campus Connect" />
            <h1>Welcome Back!</h1>
            <p>Stay connected and access all your academic resources in one place.</p>
          </div>
        </div>
        <div className="right-section">
          <div className="main-content login-content">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${usernameError ? 'input-error' : ''}`}
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  ref={usernameRef}
                  aria-label="Username"
                  disabled={isLoading}
                />
                {usernameError && <p className="error">{usernameError}</p>}
              </div>
              <div className="form-group password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${passwordError ? 'input-error' : ''}`}
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  aria-label="Password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                {passwordError && <p className="error">{passwordError}</p>}
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || usernameError || passwordError}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </button>
              </div>
              {error && <p className="error error-general">{error}</p>}
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