import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Constants ──────────────────────────────────────────────────────────────
const TOKEN_KEY   = 'fit_token';
const USER_KEY    = 'fit_user';
const USERS_KEY   = 'fit_users_db';

// Admin credentials (frontend-only demo — not truly secure, but role-enforced
// within the app. Real security requires a backend with hashed passwords.)
// These come from env vars if available; otherwise fall back to demo values.
const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || 'admin@fitforall.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@2026!';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getUsersDb() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsersDb(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateToken() {
  // Pseudo-token: not cryptographically secure — acceptable for frontend-only demo.
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

// Seed admin account idempotently (only if it doesn't exist).
function seedAdmin() {
  const users = getUsersDb();
  const exists = users.find((u) => u.email === ADMIN_EMAIL);
  if (!exists) {
    users.push({
      id:        'admin-001',
      name:      'Administrator',
      email:     ADMIN_EMAIL,
      // Never store real passwords in plain text in production.
      // Here we store a flag so the check is done against the env var at runtime.
      isAdmin:   true,
      role:      'admin',
      createdAt: new Date().toISOString(),
      goal:      null,
      weight:    null,
      height:    null,
      avatar:    null,
    });
    saveUsersDb(users);
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  // Seed admin on first load.
  useEffect(() => {
    seedAdmin();
  }, []);

  // Keep user state in sync if localStorage changes in another tab.
  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem(TOKEN_KEY));
      try {
        setUser(JSON.parse(localStorage.getItem(USER_KEY)));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  /**
   * Attempts login against the remote backend first.
   * Falls back to local user database when the backend is offline.
   * Returns { success: boolean, error?: string }
   */
  const login = useCallback(async (email, password, apiBaseUrl) => {
    // 1. Try remote backend
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        const newToken = data.access_token;
        // Fetch user info
        const meRes = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        const meData = meRes.ok ? await meRes.json() : { name: email, email, role: 'user' };

        const userData = { ...meData, role: meData.role || 'user' };
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true };
      }

      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.detail || 'Invalid email or password.' };
    } catch (_) {
      // Backend unreachable — fall through to local auth
    }

    // 2. Local fallback auth
    // Check admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const users = getUsersDb();
      const admin = users.find((u) => u.email === ADMIN_EMAIL) || {
        id: 'admin-001', name: 'Administrator', email: ADMIN_EMAIL, role: 'admin',
      };
      const newToken = generateToken();
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(admin));
      setToken(newToken);
      setUser(admin);
      return { success: true };
    }

    // Check regular users
    const users = getUsersDb();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const { password: _pw, ...safeUser } = found;
    const newToken = generateToken();
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    setToken(newToken);
    setUser(safeUser);
    return { success: true };
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, apiBaseUrl) => {
    // 1. Try remote backend
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) return { success: true };
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.detail || 'Registration failed.' };
    } catch (_) {
      // Backend unreachable — fall through to local store
    }

    // 2. Local fallback
    const users = getUsersDb();

    if (users.find((u) => u.email === email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // NOTE: In production, hash the password on the server.
    // We store it in plain text here only because this is a frontend-only demo.
    const newUser = {
      id:        crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      email,
      password,  // plain-text only for offline demo
      role:      'user',
      createdAt: new Date().toISOString(),
      goal:      null,
      weight:    null,
      height:    null,
      avatar:    null,
    };

    users.push(newUser);
    saveUsersDb(users);
    return { success: true };
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ── Update profile (local) ─────────────────────────────────────────────────
  const updateLocalProfile = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));

      // Also update users DB
      const users = getUsersDb();
      const idx = users.findIndex((u) => u.id === prev.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveUsersDb(users);
      }
      return updated;
    });
  }, []);

  const value = {
    token,
    user,
    isLoggedIn: Boolean(token),
    isAdmin: user?.role === 'admin',
    login,
    logout,
    register,
    updateLocalProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
