import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../css/style.css';
import '../css/auth.css';

function validate(email, password) {
  const errors = {};
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length) {
      // Move focus to first error field
      document.getElementById('login-email')?.focus();
      return;
    }

    setLoading(true);

    const result = await login(email.trim(), password, API_BASE_URL);

    setLoading(false);

    if (!result.success) {
      setSubmitError(result.error || 'Login failed. Please check your credentials.');
      return;
    }

    addToast('Welcome back! Logged in successfully.', 'success');

    // Role-based redirect
    const userData = JSON.parse(localStorage.getItem('fit_user') || '{}');
    navigate(userData.role === 'admin' ? '/admin' : '/profile');
  };

  return (
    <>
      <Helmet>
        <title>Log In – FIT FOR ALL</title>
        <meta name="description" content="Log in to your FIT FOR ALL account to access personalised fitness guidance." />
      </Helmet>

      <Navbar />

      <main className="auth-page" id="main-content">
        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-brand">FIT FOR ALL</div>
          <h1 id="login-title">Welcome back.</h1>
          <p>Log in to continue your fitness journey.</p>

          {submitError && (
            <div className="auth-error" role="alert" aria-live="assertive">
              {submitError}
            </div>
          )}

          <form className="auth-form" id="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                aria-describedby={errors.email ? 'login-email-err' : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <span className="field-error" id="login-email-err" role="alert">{errors.email}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                aria-describedby={errors.password ? 'login-password-err' : undefined}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <span className="field-error" id="login-password-err" role="alert">{errors.password}</span>
              )}
            </div>

            <button className="auth-submit" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="auth-switch">
            New to FIT FOR ALL? <Link to="/register">Create an account</Link>
          </p>

          <div className="auth-demo-hint">
            <strong>Demo admin:</strong> admin@fitforall.com / Admin@2026!
          </div>
        </section>
      </main>
    </>
  );
}
