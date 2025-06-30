import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import '../styles/Register.css';
import API from '../api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    semester: '',
    college: '',
    mobile: '',
    branch: '',
    yearScheme: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await API.post('/api/users/register', formData);
      alert('Registration successful!');
      navigate('/login');
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="register-page">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <div className="register-content-container">
        <div className="left-section">
          <div className="icon-container">
            <img src={require("../components/images/campusconnect.jpg")} alt="Campus Connect" />
            <h1>Join Us Today!</h1>
            <p>Become part of the Campus Connect family and unlock your academic journey.</p>
          </div>
        </div>
        <div className="right-section">
          <div className="main-content register-content">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <input
                type="text"
                className="form-control"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
              <input
                type="text"
                className="form-control"
                name="semester"
                placeholder="Semester"
                value={formData.semester}
                onChange={handleChange}
              />
              <input
                type="text"
                className="form-control"
                name="college"
                placeholder="College"
                value={formData.college}
                onChange={handleChange}
              />
              <input
                type="text"
                className="form-control"
                name="mobile"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
              <input
                type="text"
                className="form-control"
                name="branch"
                placeholder="Branch"
                value={formData.branch}
                onChange={handleChange}
              />
              <input
                type="text"
                className="form-control"
                name="yearScheme"
                placeholder="Year Scheme"
                value={formData.yearScheme}
                onChange={handleChange}
              />
              <button type="submit" className="btn btn-primary">
                Register
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

export default Register;
