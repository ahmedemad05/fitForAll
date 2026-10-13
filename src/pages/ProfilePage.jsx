import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../css/style.css';
import '../css/home.css';
import '../css/dashboard.css';

// ─── Calculators (honest estimates with formulas) ────────────────────────────
function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--info)' };
  if (bmi < 25)   return { label: 'Normal weight', color: 'var(--success)' };
  if (bmi < 30)   return { label: 'Overweight', color: 'var(--warning)' };
  return            { label: 'Obese', color: 'var(--error)' };
}

function calcTDEE(weight, height, age, sex = 'male', activityLevel = 1.55) {
  if (!weight || !height || !age) return null;
  // Mifflin-St Jeor formula
  const bmr =
    sex === 'female'
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;
  return Math.round(bmr * activityLevel);
}

export default function ProfilePage() {
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');
  const [progressLog, setProgressLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fit_progress') || '[]'); } catch { return []; }
  });
  const [newWeight, setNewWeight] = useState('');

  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();
  const { addToast } = useToast();

  const formatGoal = (goal) => {
    if (goal === 'weight-loss')  return 'Weight Loss';
    if (goal === 'muscle-gain')  return 'Muscle Gain';
    if (goal === 'fitness')      return 'General Fitness';
    return goal || 'Not set';
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Try to load profile from backend; fall back to local user data.
    const token = localStorage.getItem('fit_token');

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000),
        });

        if (res.status === 401) { logout(); return; }
        if (res.ok) {
          const data = await res.json();
          if (data && data.message !== 'Health profile not created yet') {
            setProfile(data);
            setLoading(false);
            return;
          }
        }
      } catch (_) {
        // backend offline — use local data
      }

      // Local fallback: use auth user object
      setProfile({
        name:   user?.name,
        email:  user?.email,
        goal:   user?.goal,
        weight: user?.weight,
        height: user?.height,
        age:    user?.age,
      });
      setLoading(false);
    };

    fetchProfile();
  }, [isLoggedIn, navigate, logout, user]);

  // ── Progress tracking ─────────────────────────────────────────────────────
  const logWeight = () => {
    const w = parseFloat(newWeight);
    if (!w || w < 20 || w > 500) {
      addToast('Please enter a valid weight (20–500 kg).', 'error');
      return;
    }
    const entry = { weight: w, date: new Date().toLocaleDateString(), ts: Date.now() };
    const updated = [...progressLog, entry];
    setProgressLog(updated);
    localStorage.setItem('fit_progress', JSON.stringify(updated));
    setNewWeight('');
    addToast('Weight entry saved!', 'success');
  };

  // ── Computed values ───────────────────────────────────────────────────────
  const userName  = loading ? '…' : (profile?.name || user?.name || 'User');
  const userGoal  = loading ? '…' : formatGoal(profile?.goal);
  const weight    = profile?.weight ? Number(profile.weight) : null;
  const height    = profile?.height ? Number(profile.height) : null;
  const age       = profile?.age    ? Number(profile.age)    : null;
  const bmi       = calcBMI(weight, height);
  const bmiInfo   = bmi ? bmiCategory(Number(bmi)) : null;
  const tdee      = calcTDEE(weight, height, age);

  const TABS = [
    { id: 'overview',  label: '🏠 Overview' },
    { id: 'tools',     label: '🧮 Fitness Tools' },
    { id: 'progress',  label: '📈 Progress' },
    { id: 'settings',  label: '⚙️ Settings' },
  ];

  return (
    <>
      <Helmet>
        <title>My Dashboard – FIT FOR ALL</title>
        <meta name="description" content="Access your personalised FIT FOR ALL dashboard." />
      </Helmet>

      <Navbar />

      <main className="dashboard-layout" id="main-content">
        {/* Tab bar */}
        <div className="dashboard-tabs" role="tablist" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              className={`dashboard-tab ${activeTab === t.id ? 'active' : ''}`}
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="dashboard-content">
          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div>
              <section className="dash-welcome">
                <div>
                  <h1>Hi, {userName} 👋</h1>
                  <p>Your goal: <strong>{userGoal}</strong></p>
                </div>
                {!loading && (
                  <div className="dash-profile-chips">
                    {weight && <span className="dash-chip">⚖️ {weight} kg</span>}
                    {height && <span className="dash-chip">📏 {height} cm</span>}
                    {bmi    && <span className="dash-chip" style={{ color: bmiInfo?.color }}>BMI {bmi}</span>}
                  </div>
                )}
              </section>

              {/* Feature cards (the 3 main sections) */}
              <section className="features" aria-labelledby="features-heading">
                <h2 id="features-heading">What do you want to do?</h2>
                <div className="feature-cards">
                  <Link to="/food-guide" className="feature-card">
                    <span className="feature-icon">
                      <img src="/images/dish.png" alt="" aria-hidden="true" width="48" height="48" loading="lazy" />
                    </span>
                    <h3>AI Food Guide</h3>
                    <p>Get dish ideas from ingredients</p>
                    <span className="card-arrow" aria-hidden="true">→</span>
                  </Link>

                  <Link to="/gym-coach" className="feature-card">
                    <span className="feature-icon">
                      <img src="/images/plate2.png" alt="" aria-hidden="true" width="48" height="48" loading="lazy" />
                    </span>
                    <h3>AI Food Scanner</h3>
                    <p>Analyse your meal</p>
                    <span className="card-arrow" aria-hidden="true">→</span>
                  </Link>

                  <Link to="/product-scanner" className="feature-card">
                    <span className="feature-icon">
                      <img src="/images/cart.png" alt="" aria-hidden="true" width="48" height="48" loading="lazy" />
                    </span>
                    <h3>Product Scanner</h3>
                    <p>Is this product good for me?</p>
                    <span className="card-arrow" aria-hidden="true">→</span>
                  </Link>

                  <Link to="/coaches" className="feature-card">
                    <span className="feature-icon">
                      <img
                        src="/images/coach.png"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/dumble.png'; }}
                        alt="" aria-hidden="true" width="48" height="48" loading="lazy"
                      />
                    </span>
                    <h3>Coaches</h3>
                    <p>Subscribe to a coach</p>
                    <span className="card-arrow" aria-hidden="true">→</span>
                  </Link>

                  <Link to="/dashboard/machine-tutorial" className="feature-card feature-card-coming">
                    <span className="feature-icon">🤖</span>
                    <h3>3D Machine Tutorial</h3>
                    <p>AI-powered gym machine guide</p>
                    <span className="dash-coming-badge">Coming Soon</span>
                  </Link>
                </div>
              </section>

              {/* Profile summary */}
              <section className="profile-summary" aria-labelledby="profile-heading">
                <h2 id="profile-heading">Your Profile</h2>
                <div className="profile-info">
                  <div><span>Weight</span><strong>{weight ? `${weight} kg` : '— kg'}</strong></div>
                  <div><span>Height</span><strong>{height ? `${height} cm` : '— cm'}</strong></div>
                  <div><span>Goal</span><strong>{userGoal}</strong></div>
                </div>
                <div className="profile-actions-row">
                  <Link to="/personal-data" className="secondary-btn" style={{ color: 'var(--text-1)', borderColor: 'var(--border)' }}>
                    Update Personal Data
                  </Link>
                  <Link to="/update-profile" className="primary-btn">
                    Update Profile
                  </Link>
                </div>
              </section>
            </div>
          )}

          {/* ── Fitness Tools ── */}
          {activeTab === 'tools' && (
            <div>
              <h1 className="dash-section-title">Fitness Tools</h1>
              <p className="dash-disclaimer">
                ⚠️ These calculators provide <strong>estimates</strong> only. Results are not medical advice.
                Consult a qualified professional before starting any fitness or nutrition programme.
              </p>

              <div className="dash-tools-grid">
                {/* BMI Calculator */}
                <div className="dash-tool-card">
                  <h2>BMI Calculator</h2>
                  <p className="dash-tool-formula">Formula: weight (kg) ÷ height² (m²)</p>
                  {bmi && bmiInfo ? (
                    <div className="dash-tool-result">
                      <span className="dash-tool-value" style={{ color: bmiInfo.color }}>{bmi}</span>
                      <span className="dash-tool-label">{bmiInfo.label}</span>
                    </div>
                  ) : (
                    <p className="dash-tool-empty">
                      Add your weight and height in <Link to="/update-profile">Profile Settings</Link> to see your BMI.
                    </p>
                  )}
                </div>

                {/* TDEE Calculator */}
                <div className="dash-tool-card">
                  <h2>Daily Calorie Estimate (TDEE)</h2>
                  <p className="dash-tool-formula">Formula: Mifflin-St Jeor BMR × activity factor (1.55 = moderately active)</p>
                  {tdee ? (
                    <div className="dash-tool-result">
                      <span className="dash-tool-value">{tdee}</span>
                      <span className="dash-tool-label">kcal / day (estimate)</span>
                    </div>
                  ) : (
                    <p className="dash-tool-empty">
                      Add your weight, height, and age in <Link to="/update-profile">Profile Settings</Link> to see your TDEE.
                    </p>
                  )}
                </div>

                {/* Macros calculator */}
                {tdee && (
                  <div className="dash-tool-card">
                    <h2>Macros Estimate</h2>
                    <p className="dash-tool-formula">Based on your TDEE and goal ({userGoal})</p>
                    <div className="dash-macros-grid">
                      {(() => {
                        let p, c, f;
                        const goal = profile?.goal;
                        if (goal === 'weight-loss') {
                          p = Math.round(weight * 2.2 || tdee * 0.35 / 4);
                          f = Math.round(tdee * 0.30 / 9);
                          c = Math.round((tdee - p * 4 - f * 9) / 4);
                        } else if (goal === 'muscle-gain') {
                          p = Math.round(weight * 2.4 || tdee * 0.30 / 4);
                          f = Math.round(tdee * 0.25 / 9);
                          c = Math.round((tdee - p * 4 - f * 9) / 4);
                        } else {
                          p = Math.round(tdee * 0.25 / 4);
                          f = Math.round(tdee * 0.30 / 9);
                          c = Math.round((tdee - p * 4 - f * 9) / 4);
                        }
                        return (
                          <>
                            <div className="dash-macro-item">
                              <span>💪 Protein</span><strong>{p}g</strong>
                            </div>
                            <div className="dash-macro-item">
                              <span>🌾 Carbs</span><strong>{c}g</strong>
                            </div>
                            <div className="dash-macro-item">
                              <span>🥑 Fat</span><strong>{f}g</strong>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Progress ── */}
          {activeTab === 'progress' && (
            <div>
              <h1 className="dash-section-title">Progress Tracking</h1>
              <p className="dash-disclaimer">
                Log your real weight measurements to track progress over time.
              </p>

              <div className="dash-progress-form">
                <input
                  type="number"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Today's weight (kg)"
                  min="20"
                  max="500"
                  step="0.1"
                  aria-label="Today's weight in kilograms"
                />
                <button onClick={logWeight} className="primary-btn">Log Weight</button>
              </div>

              {progressLog.length === 0 ? (
                <div className="dash-empty-state">
                  <p>📊 No weight entries yet. Log your first measurement above.</p>
                </div>
              ) : (
                <div className="dash-log-list">
                  {[...progressLog].reverse().map((entry, i) => (
                    <div key={i} className="dash-log-entry">
                      <span className="dash-log-date">{entry.date}</span>
                      <span className="dash-log-value">{entry.weight} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="dash-section-title">Account Settings</h1>
              <div className="dash-settings-links">
                <Link to="/personal-data" className="dash-settings-item">
                  <span>✏️</span>
                  <div>
                    <strong>Personal Data</strong>
                    <p>Update name, email, and password</p>
                  </div>
                  <span className="dash-settings-arrow">→</span>
                </Link>
                <Link to="/update-profile" className="dash-settings-item">
                  <span>🏃</span>
                  <div>
                    <strong>Fitness Profile</strong>
                    <p>Update weight, height, goal, and diet preferences</p>
                  </div>
                  <span className="dash-settings-arrow">→</span>
                </Link>
                <div
                  className="dash-settings-item"
                  style={{ cursor: 'default' }}
                >
                  <span>🌙</span>
                  <div>
                    <strong>Theme</strong>
                    <p>Use the moon/sun icon in the navbar to toggle dark mode</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
