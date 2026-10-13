import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Eager-loaded pages (small / critical path)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy-loaded pages (heavier / behind auth)
const CoachesPage = lazy(() => import('./pages/CoachesPage'));
const CoachProfilePage = lazy(() => import('./pages/CoachProfilePage'));
const FoodGuidePage = lazy(() => import('./pages/FoodGuidePage'));
const GymCoachPage = lazy(() => import('./pages/GymCoachPage'));
const ProductScannerPage = lazy(() => import('./pages/ProductScannerPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PersonalDataPage = lazy(() => import('./pages/PersonalDataPage'));
const UpdateProfilePage = lazy(() => import('./pages/UpdateProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MachineTutorialPage = lazy(() => import('./pages/MachineTutorialPage'));

// Loading fallback
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-2)',
        fontSize: '15px',
        fontWeight: 600,
      }}
    >
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Coaches (public) */}
                    <Route path="/coaches" element={<CoachesPage />} />
                    <Route path="/coach-profile" element={<CoachProfilePage />} />

                    {/* Three main sections (public, but profile-aware) */}
                    <Route path="/food-guide" element={<FoodGuidePage />} />
                    <Route path="/gym-coach" element={<GymCoachPage />} />
                    <Route path="/product-scanner" element={<ProductScannerPage />} />

                    {/* User dashboard (protected) */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/personal-data"
                      element={
                        <ProtectedRoute>
                          <PersonalDataPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/update-profile"
                      element={
                        <ProtectedRoute>
                          <UpdateProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/machine-tutorial"
                      element={
                        <ProtectedRoute>
                          <MachineTutorialPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin dashboard (protected + admin only) */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}