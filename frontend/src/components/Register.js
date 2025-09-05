import React, { useState, useRef, useEffect } from 'react';
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
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const usernameRef = useRef(null);

  // Focus on username input when component mounts
  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'username':
        if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters long';
        } else {
          delete newErrors.username;
        }
        break;
      case 'password':
        if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters long';
        } else {
          delete newErrors.password;
        }
        break;
      case 'fullName':
        if (value.length < 2) {
          newErrors.fullName = 'Full Name must be at least 2 characters long';
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'semester':
        if (!/^[1-8]$/.test(value)) {
          newErrors.semester = 'Semester must be a number between 1 and 8';
        } else {
          delete newErrors.semester;
        }
        break;
      case 'college':
        if (value.length < 2) {
          newErrors.college = 'College name must be at least 2 characters long';
        } else {
          delete newErrors.college;
        }
        break;
      case 'mobile':
        if (!/^\d{10}$/.test(value)) {
          newErrors.mobile = 'Mobile number must be 10 digits';
        } else {
          delete newErrors.mobile;
        }
        break;
      case 'branch':
        if (value.length < 2) {
          newErrors.branch = 'Branch must be at least 2 characters long';
        } else {
          delete newErrors.branch;
        }
        break;
      case 'yearScheme':
        if (!/^\d{4}$/.test(value)) {
          newErrors.yearScheme = 'Year Scheme must be a 4-digit year';
        } else {
          delete newErrors.yearScheme;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    // Validate all fields before submission
    Object.keys(formData).forEach((key) => validateField(key, formData[key]));

    // Prevent submission if there are errors
    if (Object.keys(errors).length > 0) {
      setGeneralError('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      await API.post('/api/users/register', formData);
      alert('Registration successful!');
      // Clear form on success
      setFormData({
        username: '',
        password: '',
        fullName: '',
        semester: '',
        college: '',
        mobile: '',
        branch: '',
        yearScheme: '',
      });
      setErrors({});
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      semester: '',
      college: '',
      mobile: '',
      branch: '',
      yearScheme: '',
    });
    setErrors({});
    setGeneralError(null);
  };

  return (
    <div className="register-page">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <div className="register-content-container">
        <div className="left-section">
          <div className="icon-container">
            <img src={require("../components/images/logo2-cc.png")} alt="Campus Connect" />
            <h1>Join Us Today!</h1>
            <p>Become part of the Campus Connect family and unlock your academic journey.</p>
          </div>
        </div>
        <div className="right-section">
          <div className="main-content register-content">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'input-error' : ''}`}
                  name="username"
                  placeholder="Username *"
                  value={formData.username}
                  onChange={handleChange}
                  ref={usernameRef}
                  aria-label="Username"
                  aria-required="true"
                  required
                  disabled={isLoading}
                />
                {errors.username && <p className="error">{errors.username}</p>}
              </div>
              <div className="form-group password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'input-error' : ''}`}
                  name="password"
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                  aria-label="Password"
                  aria-required="true"
                  required
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
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${errors.fullName ? 'input-error' : ''}`}
                  name="fullName"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={handleChange}
                  aria-label="Full Name"
                  aria-required="true"
                  required
                  disabled={isLoading}
                />
                {errors.fullName && <p className="error">{errors.fullName}</p>}
              </div>
              <div className="form-group">
                <input
                  type="number"
                  className={`form-control ${errors.semester ? 'input-error' : ''}`}
                  name="semester"
                  placeholder="Semester *"
                  value={formData.semester}
                  onChange={handleChange}
                  min="1"
                  max="8"
                  aria-label="Semester"
                  aria-required="true"
                  required
                  disabled={isLoading}
                />
                {errors.semester && <p className="error">{errors.semester}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${errors.college ? 'input-error' : ''}`}
                  name="college"
                  placeholder="College *"
                  value={formData.college}
                  onChange={handleChange}
                  aria-label="College"
                  aria-required="true"
                  required
                  disabled={isLoading}
                />
                {errors.college && <p className="error">{errors.college}</p>}
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  className={`form-control ${errors.mobile ? 'input-error' : ''}`}
                  name="mobile"
                  placeholder="Mobile *"
                  value={formData.mobile}
                  onChange={handleChange}
                  pattern="\d{10}"
                  aria-label="Mobile"
                  aria-required="true"
                  required
                  disabled={isLoading}
                />
                {errors.mobile && <p className="error">{errors.mobile}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${errors.branch ? 'input-error' : ''}`}
                  name="branch"
                  placeholder="Branch *"
                  value={formData.branch}
                  onChange={handleChange}
                  aria-label="Branch"
                  aria-required="true"
                  required
                  disabled={isLoading}
                />
                {errors.branch && <p className="error">{errors.branch}</p>}
              </div>
              <div className="form-group">
                <input
                  type="number"
                  className={`form-control ${errors.yearScheme ? 'input-error' : ''}`}
                  name="yearScheme"
                  placeholder="Year Scheme *"
                  value={formData.yearScheme}
                  onChange={handleChange}
                  min="2000"
                  max="2099"
                  aria-label="Year Scheme"
                  aria-required="true"
                  required
                  disabled={isLoading}
                />
                {errors.yearScheme && <p className="error">{errors.yearScheme}</p>}
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || Object.keys(errors).length > 0}
                >
                  {isLoading ? 'Registering...' : 'Register'}
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
              {generalError && <p className="error error-general">{generalError}</p>}
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