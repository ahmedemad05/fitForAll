import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import '../css/style.css';
import '../css/profile.css';

export default function UpdateProfilePage() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('weight-loss');
  const [budget, setBudget] = useState('low');
  const [allergies, setAllergies] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
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

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          logout();
          alert('Your session has expired. Please log in again.');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          alert(data.detail || 'Could not load your profile.');
          return;
        }

        if (data.message === 'Health profile not created yet') {
          return;
        }

        if (data.age !== undefined && data.age !== null) setAge(data.age);
        if (data.weight !== undefined && data.weight !== null)
          setWeight(data.weight);
        if (data.height !== undefined && data.height !== null)
          setHeight(data.height);
        if (data.goal) setGoal(data.goal);
        if (data.budget) setBudget(data.budget);
        if (data.allergies) setAllergies((data.allergies || []).join(', '));
        if (data.dietary_preferences)
          setDietaryPreferences((data.dietary_preferences || []).join(', '));
      } catch (error) {
        console.error('Error loading profile:', error);
        alert('Could not connect to the server.');
      }
    };

    loadProfile();
  }, [navigate, logout]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first.');
      navigate('/login');
      return;
    }

    const allergiesArray = allergies
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');

    const preferencesArray = dietaryPreferences
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: Number(age),
          weight: Number(weight),
          height: Number(height),
          goal: goal,
          budget: budget,
          allergies: allergiesArray,
          dietary_preferences: preferencesArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          alert('Your session has expired. Please log in again.');
          return;
        }

        alert(data.detail || 'Failed to update profile.');
        return;
      }

      alert('Profile saved successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
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
          <span className="profile-kicker">YOUR PERSONAL PLAN</span>
          <h1>Build a plan that fits you.</h1>
          <p>
            Keep your details up to date so FIT FOR ALL can personalize your
            guidance.
          </p>
        </section>

        <form className="profile-form" id="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            {/* Age */}
            <div className="profile-field">
              <label htmlFor="profile-age">Age</label>
              <input
                id="profile-age"
                name="age"
                type="number"
                min="1"
                max="120"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-weight">Weight (kg)</label>
              <input
                id="profile-weight"
                name="weight"
                type="number"
                min="1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-height">Height (cm)</label>
              <input
                id="profile-height"
                name="height"
                type="number"
                min="1"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-goal">Primary goal</label>
              <select
                id="profile-goal"
                name="goal"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="weight-loss">Weight loss</option>
                <option value="muscle-gain">Muscle gain</option>
                <option value="fitness">General fitness</option>
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-budget">Food budget</label>
              <select
                id="profile-budget"
                name="budget"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Allergies */}
            <div className="profile-field">
              <label htmlFor="profile-allergies">Allergies</label>
              <input
                id="profile-allergies"
                name="allergies"
                type="text"
                placeholder="e.g. peanuts, milk"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
              <small>Separate multiple allergies with commas.</small>
            </div>

            {/* Dietary Preferences */}
            <div className="profile-field">
              <label htmlFor="profile-dietary-preferences">
                Dietary preferences
              </label>
              <input
                id="profile-dietary-preferences"
                name="dietary_preferences"
                type="text"
                placeholder="e.g. vegetarian, low-carb"
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
              />
              <small>Separate multiple preferences with commas.</small>
            </div>
          </div>

          <div className="profile-actions">
            <Link to="/profile" className="profile-cancel">
              Cancel
            </Link>
            <button type="submit" className="profile-save" disabled={saving}>
              Save Profile
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
