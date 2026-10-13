import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps routes that require authentication.
 * If requireAdmin is true, only admin users can access the route.
 * Non-admins accessing admin routes are redirected to /profile.
 * Unauthenticated users are redirected to /login (with the attempted path preserved).
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Preserve intended destination so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
