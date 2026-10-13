import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import '../css/style.css';
import '../css/profile.css';

export default function PersonalDataPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const token =
      localStorage.getItem('token') ||
      new URLSearchParams(window.location.search).get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadAccountInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          logout();
          return;
        }

        const data = await response.json();
        setName(data.name || '');
        setEmail(data.email || '');
      } catch (error) {
        console.error('Error loading account information:', error);
        alert('Could not load your account information.');
      }
    };

    loadAccountInfo();
  }, [navigate, logout]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first.');
      navigate('/login');
      return;
    }

    if (newPassword && !currentPassword) {
      alert('Please enter your current password.');
      return;
    }

    if (currentPassword && !newPassword) {
      alert('Please enter your new password.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          email: email,
          current_password: currentPassword || null,
          new_password: newPassword || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          alert('Your session has expired. Please log in again.');
          return;
        }

        alert(data.detail || 'Failed to update personal information.');
        return;
      }

      alert('Personal information updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Could not connect to the server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main className="profile-page">
        <section className="profile-header">
          <span className="profile-kicker">ACCOUNT SETTINGS</span>
          <h1>Update your personal data.</h1>
          <p>
            Keep your name, email, and password current so your account stays
            secure and accurate.
          </p>
        </section>

        <form
          className="profile-form"
          id="personal-info-form"
          onSubmit={handleSubmit}
        >
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="profile-name">Full name</label>
              <input
                id="profile-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Email address</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-current-password">Current password</label>
              <input
                id="profile-current-password"
                name="current_password"
                type="password"
                placeholder="Enter your current password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-new-password">New password</label>
              <input
                id="profile-new-password"
                name="new_password"
                type="password"
                placeholder="Enter a new password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <p className="profile-form-note">
            Leave the password fields empty if you do not want to change your
            password.
          </p>

          <div className="profile-actions">
            <Link to="/profile" className="profile-cancel">
              Cancel
            </Link>
            <button type="submit" className="profile-save" disabled={saving}>
              Save Personal Data
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
