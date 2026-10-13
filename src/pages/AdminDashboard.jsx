import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../css/style.css';
import '../css/admin.css';

// ─── Helpers ────────────────────────────────────────────────────────────────
function getUsersDb() {
  try { return JSON.parse(localStorage.getItem('fit_users_db') || '[]'); } catch { return []; }
}
function saveUsersDb(users) {
  localStorage.setItem('fit_users_db', JSON.stringify(users));
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab]         = useState('overview');
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

  // Activity log — stored in localStorage
  const [activityLog, setActivityLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fit_admin_log') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    setUsers(getUsersDb());
  }, [tab]);

  const logActivity = (message) => {
    const entry = { message, time: new Date().toLocaleString() };
    const updated = [entry, ...activityLog].slice(0, 50);
    setActivityLog(updated);
    localStorage.setItem('fit_admin_log', JSON.stringify(updated));
  };

  // ── User management ────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleDeactivate = (targetUser) => {
    const updated = users.map((u) =>
      u.id === targetUser.id ? { ...u, deactivated: !u.deactivated } : u
    );
    setUsers(updated);
    saveUsersDb(updated);
    const action = targetUser.deactivated ? 'Reactivated' : 'Deactivated';
    logActivity(`${action} user: ${targetUser.name} (${targetUser.email})`);
    addToast(`${action} ${targetUser.name}.`, 'success');
  };

  const handleDeleteConfirm = (u) => setDeleteConfirm(u);
  const handleDeleteCancel  = () => setDeleteConfirm(null);

  const handleDeleteExecute = () => {
    if (!deleteConfirm) return;
    const updated = users.filter((u) => u.id !== deleteConfirm.id);
    setUsers(updated);
    saveUsersDb(updated);
    logActivity(`Deleted user: ${deleteConfirm.name} (${deleteConfirm.email})`);
    addToast(`Deleted ${deleteConfirm.name}.`, 'info');
    setDeleteConfirm(null);
  };

  // ── Statistics ─────────────────────────────────────────────────────────────
  const totalUsers  = users.filter((u) => u.role !== 'admin').length;
  const newThisWeek = users.filter((u) => {
    if (!u.createdAt) return false;
    const created = new Date(u.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return created >= weekAgo;
  }).length;
  const activeCount = users.filter((u) => u.role !== 'admin' && !u.deactivated).length;

  // ── Sections content state (simple localStorage persistence) ─────────────
  const [content, setContent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fit_admin_content') || JSON.stringify({
        coaches: [
          { id: 1, name: 'Amina Rahman', role: 'Nutrition Coach', status: 'active' },
          { id: 2, name: 'Mohamed Ali',  role: 'Strength Coach',  status: 'active' },
          { id: 3, name: 'Sara Lewis',   role: 'Fitness Coach',   status: 'active' },
          { id: 4, name: 'Daniel Reed',  role: 'Performance Coach', status: 'active' },
        ],
      }));
    } catch { return { coaches: [] }; }
  });

  const saveContent = (newContent) => {
    setContent(newContent);
    localStorage.setItem('fit_admin_content', JSON.stringify(newContent));
  };

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users',    label: '👥 Users' },
    { id: 'coaches',  label: '🏋️ Coaches' },
    { id: 'activity', label: '📋 Activity' },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard – FIT FOR ALL</title>
      </Helmet>

      <Navbar />

      <div className="admin-layout" id="main-content">
        {/* Sidebar */}
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <div className="admin-sidebar-brand">
            <span>⚙️</span>
            <span>Admin Panel</span>
          </div>
          <nav>
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`admin-nav-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <p className="admin-user-info">
              Logged in as<br />
              <strong>{user?.name || 'Admin'}</strong>
            </p>
            <button className="admin-logout-btn" onClick={logout}>
              Log Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-main">
          {/* ── Overview ── */}
          {tab === 'overview' && (
            <section>
              <div className="admin-breadcrumb">Admin / Overview</div>
              <h1 className="admin-page-title">Dashboard Overview</h1>

              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <span className="admin-stat-icon">👤</span>
                  <div>
                    <div className="admin-stat-value">{totalUsers}</div>
                    <div className="admin-stat-label">Total Users</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-icon">📈</span>
                  <div>
                    <div className="admin-stat-value">{newThisWeek}</div>
                    <div className="admin-stat-label">New This Week</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-icon">✅</span>
                  <div>
                    <div className="admin-stat-value">{activeCount}</div>
                    <div className="admin-stat-label">Active Members</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-icon">🏋️</span>
                  <div>
                    <div className="admin-stat-value">{content.coaches?.length || 0}</div>
                    <div className="admin-stat-label">Coaches</div>
                  </div>
                </div>
              </div>

              <div className="admin-section-card">
                <h2>Quick Links</h2>
                <div className="admin-quick-links">
                  <button onClick={() => setTab('users')} className="admin-quick-link">
                    👥 Manage Users
                  </button>
                  <button onClick={() => setTab('coaches')} className="admin-quick-link">
                    🏋️ Manage Coaches
                  </button>
                  <button onClick={() => setTab('activity')} className="admin-quick-link">
                    📋 View Activity
                  </button>
                </div>
              </div>

              <div className="admin-section-card">
                <h2>Three Main Sections</h2>
                <p className="admin-note">Navigate to these pages to review user-facing content.</p>
                <div className="admin-quick-links">
                  <Link to="/food-guide"        className="admin-quick-link">🥗 AI Food Guide</Link>
                  <Link to="/gym-coach"          className="admin-quick-link">📷 AI Food Scanner</Link>
                  <Link to="/product-scanner"    className="admin-quick-link">🛒 Product Scanner</Link>
                </div>
              </div>

              <div className="admin-section-card">
                <h2>Future: 3D Machine Tutorial Content</h2>
                <p className="admin-note">
                  This section will allow management of gym machine entries, 3D model assets,
                  and tutorial steps when the AI feature is launched.
                </p>
                <span className="admin-badge admin-badge-soon">Coming Soon</span>
              </div>
            </section>
          )}

          {/* ── Users ── */}
          {tab === 'users' && (
            <section>
              <div className="admin-breadcrumb">Admin / Users</div>
              <h1 className="admin-page-title">User Management</h1>

              <div className="admin-toolbar">
                <input
                  type="search"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="admin-search"
                  aria-label="Search users"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="admin-filter"
                  aria-label="Filter by role"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="admin-empty">
                  <p>No users found.</p>
                  {totalUsers === 0 && (
                    <p style={{ color: 'var(--text-3)', fontSize: '14px', marginTop: '8px' }}>
                      No registered users yet. Register an account via the Register page to see it here.
                    </p>
                  )}
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table" aria-label="Users table">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Role</th>
                        <th scope="col">Status</th>
                        <th scope="col">Joined</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className={u.deactivated ? 'row-deactivated' : ''}>
                          <td>{u.name || '—'}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`admin-role-badge ${u.role}`}>
                              {u.role === 'admin' ? '🛡 Admin' : '👤 User'}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-status-badge ${u.deactivated ? 'inactive' : 'active'}`}>
                              {u.deactivated ? 'Inactive' : 'Active'}
                            </span>
                          </td>
                          <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                          <td className="admin-actions-cell">
                            {u.role !== 'admin' && (
                              <>
                                <button
                                  className="admin-action-btn"
                                  onClick={() => handleDeactivate(u)}
                                  aria-label={`${u.deactivated ? 'Reactivate' : 'Deactivate'} ${u.name}`}
                                >
                                  {u.deactivated ? 'Reactivate' : 'Deactivate'}
                                </button>
                                <button
                                  className="admin-action-btn danger"
                                  onClick={() => handleDeleteConfirm(u)}
                                  aria-label={`Delete ${u.name}`}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ── Coaches ── */}
          {tab === 'coaches' && (
            <section>
              <div className="admin-breadcrumb">Admin / Coaches</div>
              <h1 className="admin-page-title">Coach Management</h1>
              <p className="admin-note">
                Manage coaches shown on the Coaches page. Changes are saved locally.
              </p>

              <div className="admin-table-wrapper">
                <table className="admin-table" aria-label="Coaches table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(content.coaches || []).map((coach) => (
                      <tr key={coach.id}>
                        <td>{coach.name}</td>
                        <td>{coach.role}</td>
                        <td>
                          <span className={`admin-status-badge ${coach.status}`}>
                            {coach.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="admin-actions-cell">
                          <button
                            className="admin-action-btn"
                            onClick={() => {
                              const updated = {
                                ...content,
                                coaches: content.coaches.map((c) =>
                                  c.id === coach.id
                                    ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
                                    : c
                                ),
                              };
                              saveContent(updated);
                              logActivity(`Toggled coach status: ${coach.name}`);
                              addToast(`Updated ${coach.name}.`, 'success');
                            }}
                          >
                            {coach.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Activity ── */}
          {tab === 'activity' && (
            <section>
              <div className="admin-breadcrumb">Admin / Activity</div>
              <h1 className="admin-page-title">Recent Activity</h1>

              {activityLog.length === 0 ? (
                <div className="admin-empty">
                  <p>No activity recorded yet. Actions like user management will appear here.</p>
                </div>
              ) : (
                <div className="admin-activity-list">
                  {activityLog.map((entry, i) => (
                    <div key={i} className="admin-activity-entry">
                      <span className="admin-activity-dot" />
                      <div>
                        <p>{entry.message}</p>
                        <time dateTime={entry.time}>{entry.time}</time>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="admin-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="admin-dialog">
            <h2 id="confirm-title">Delete User</h2>
            <p>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong> (
              {deleteConfirm.email})?
            </p>
            <p className="admin-dialog-warning">This action cannot be undone.</p>
            <div className="admin-dialog-actions">
              <button className="admin-dialog-cancel" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="admin-dialog-confirm" onClick={handleDeleteExecute}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
