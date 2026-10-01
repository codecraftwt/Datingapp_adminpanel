import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TwoStringsLogo } from './TwoStringsLogo';
import { CoupleBanner } from './CoupleBanner';
import { loginAdmin } from '../services/api';

export const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginAdmin(email, password);

      if (data.success && data.token) {
        // Store session tokens
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));

        setSuccessMessage('Login successful! Redirecting...');

        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(data.admin, data.token);
          }
        }, 800);
      } else {
        setErrorMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.response?.data?.message || err.message || 'Server error. Please verify backend is running on port 5000.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to populate demo/superadmin credentials easily
  const handleQuickFill = () => {
    setEmail('admin@datingapp.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-container">

        {/* Left Side Artwork Banner */}
        <div className="login-card-left">
          <CoupleBanner />
        </div>

        {/* Right Side Form Panel */}
        <div className="login-card-right">

          {/* Subtle Heart Infinity Watermark Logo in Bottom Right */}
          <TwoStringsLogo watermark={true} />

          <div className="login-form-content">

            {/* Top Brand Logo & Title */}
            <div className="login-header">
              <TwoStringsLogo size={65} showText={true} />
              <h2 className="admin-title">ADMIN PANEL</h2>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="alert-banner alert-error animate-fade-in">
                <AlertCircle size={18} className="alert-icon" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="alert-banner alert-success animate-fade-in">
                <CheckCircle2 size={18} className="alert-icon" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form" noValidate>

              {/* Email Input Field */}
              <div className="input-group">
                <div className="input-field-wrapper">
                  <Mail className="field-icon" size={18} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="input-group">
                <div className="input-field-wrapper">
                  <Lock className="field-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                className={`login-submit-btn ${isLoading ? 'is-loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="btn-spinner-label">
                    <span className="spinner"></span> LOGGING IN...
                  </span>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Shortcut */}
            <div className="quick-fill-container" style={{ marginTop: '14px', textCenter: 'center' }}>
              <button
                type="button"
                className="quick-fill-btn"
                onClick={handleQuickFill}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={14} color="#ff4d6d" />
                <span>Auto-fill Default Admin Credentials</span>
              </button>
            </div>

            {/* Footer security note */}
            <div className="login-footer-text">
              Protected Admin Portal • Two Strings Dating App
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
