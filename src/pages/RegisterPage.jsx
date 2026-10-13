import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../css/style.css';
import '../css/auth.css';

function validate(name, email, password) {
  const errors = {};
  if (!name || name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = 'Password must contain uppercase, lowercase, and a number.';
  }
  return errors;
}

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const errs = validate(name, email, password);
    setErrors(errs);
    if (Object.keys(errs).length) {
      // Focus first error
      if (errs.name) document.getElementById('register-name')?.focus();
      else if (errs.email) document.getElementById('register-email')?.focus();
      else document.getElementById('register-password')?.focus();
      return;
    }

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password, API_BASE_URL);
    setLoading(false);

    if (!result.success) {
      setSubmitError(result.error || 'Registration failed. Please try again.');
      return;
    }

    addToast('Account created successfully! Please log in.', 'success');
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Create Account – FIT FOR ALL</title>
        <meta name="description" content="Create your free FIT FOR ALL account to start your personalised fitness journey." />
      </Helmet>

      <Navbar />

      <main className="auth-page" id="main-content">
        <section className="auth-card" aria-labelledby="register-title">
          <div className="auth-brand">FIT FOR ALL</div>
          <h1 id="register-title">Start stronger.</h1>
          <p>Create your account and make your health goals personal.</p>

          {submitError && (
            <div className="auth-error" role="alert" aria-live="assertive">
              {submitError}
            </div>
          )}

          <form className="auth-form" id="register-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                aria-describedby={errors.name ? 'register-name-err' : undefined}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <span className="field-error" id="register-name-err" role="alert">{errors.name}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                aria-describedby={errors.email ? 'register-email-err' : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <span className="field-error" id="register-email-err" role="alert">{errors.email}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                aria-describedby={errors.password ? 'register-password-err' : 'register-password-hint'}
                aria-invalid={!!errors.password}
              />
              <span id="register-password-hint" className="field-hint">
                At least 8 characters with uppercase, lowercase, and a number.
              </span>
              {errors.password && (
                <span className="field-error" id="register-password-err" role="alert">{errors.password}</span>
              )}
            </div>

            <button className="auth-submit" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </section>
      </main>
    </>
  );
}
