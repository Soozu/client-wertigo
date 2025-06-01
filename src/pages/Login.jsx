import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Plane, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, isLoading, authError, clearError } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/planner';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error when switching modes
  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [isLoginMode, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!isLoginMode) {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      }

      if (!formData.confirmPassword.trim()) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let result;
      if (isLoginMode) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        // Navigation will be handled by the useEffect above
        console.log(`${isLoginMode ? 'Login' : 'Registration'} successful`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    clearError();
  };

  const backgroundImages = [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Boracay
    'https://images.unsplash.com/photo-1566802726783-3ba58de2dd4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Palawan
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Bohol
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className="login-page">
      {/* Background Slideshow */}
      <div className="login-background">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`background-slide ${index === currentBgIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="background-overlay" />
      </div>

      {/* Header */}
      <header className="login-header">
        <Link to="/" className="logo-link">
          <div className="logo">
            <Plane className="logo-icon" />
            <span className="logo-text">WerTigo</span>
          </div>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-container">
          {/* Left Side - Branding */}
          <div className="login-branding">
            <div className="branding-content">
              <h1 className="branding-title">
                <Plane className="title-icon" />
                Welcome to WerTigo
              </h1>
              <p className="branding-subtitle">
                Your AI-powered travel companion for exploring the beautiful Philippines
              </p>
              
              <div className="features-list">
                <div className="feature-item">
                  <MapPin className="feature-icon" />
                  <span>Discover hidden gems across Luzon, Visayas, and Mindanao</span>
                </div>
                <div className="feature-item">
                  <User className="feature-icon" />
                  <span>Get personalized recommendations from our AI assistant</span>
                </div>
                <div className="feature-item">
                  <Plane className="feature-icon" />
                  <span>Plan and organize your perfect Philippine adventure</span>
                </div>
              </div>

              <div className="destinations-preview">
                <h3>Popular Destinations</h3>
                <div className="destinations-tags">
                  <span className="destination-tag">Boracay</span>
                  <span className="destination-tag">Palawan</span>
                  <span className="destination-tag">Bohol</span>
                  <span className="destination-tag">Baguio</span>
                  <span className="destination-tag">Siargao</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="login-form-section">
            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">
                  {isLoginMode ? 'Welcome Back!' : 'Join WerTigo'}
                </h2>
                <p className="form-subtitle">
                  {isLoginMode 
                    ? 'Sign in to continue your travel planning' 
                    : 'Create your account to start exploring'}
                </p>
              </div>

              {/* Auth Error */}
              {authError && (
                <div className="error-message">
                  <span>⚠️ {authError}</span>
                  <button 
                    type="button" 
                    className="error-close"
                    onClick={clearError}
                    aria-label="Close error"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                {!isLoginMode && (
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      <User size={18} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input ${formErrors.name ? 'error' : ''}`}
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                    {formErrors.name && (
                      <span className="field-error">{formErrors.name}</span>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <Mail size={18} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <span className="field-error">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <Lock size={18} />
                    Password
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input ${formErrors.password ? 'error' : ''}`}
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <span className="field-error">{formErrors.password}</span>
                  )}
                </div>

                {!isLoginMode && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      <Lock size={18} />
                      Confirm Password
                    </label>
                    <div className="password-input-container">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
                        placeholder="Confirm your password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <span className="field-error">{formErrors.confirmPassword}</span>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner" />
                      {isLoginMode ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {isLoginMode ? 'Sign In' : 'Create Account'}
                      <Plane size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Mode */}
              <div className="form-footer">
                <p className="switch-mode-text">
                  {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                </p>
                <button
                  type="button"
                  className="switch-mode-btn"
                  onClick={switchMode}
                  disabled={isSubmitting}
                >
                  {isLoginMode ? 'Sign Up' : 'Sign In'}
                </button>
              </div>


            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login; 