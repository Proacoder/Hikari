import React, { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { SplashScreen } from './components/common/SplashScreen';
import { PublicLayout, CitizenLayout, OfficerLayout, AdminLayout } from './components/layout/Layouts';

// ── Lazy-loaded Route Components for Optimized Bundle Splitting ─────────────
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const OfficerLoginPage = lazy(() => import('./pages/OfficerLoginPage').then(m => ({ default: m.OfficerLoginPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const CivicLeaderboardPage = lazy(() => import('./pages/citizen/CivicLeaderboardPage').then(m => ({ default: m.CivicLeaderboardPage })));

// Lazy-loaded Citizen Portal Pages
const CitizenDashboard = lazy(() => import('./pages/CitizenPages').then(m => ({ default: m.CitizenDashboard })));
const ReportIssuePage = lazy(() => import('./pages/CitizenPages').then(m => ({ default: m.ReportIssuePage })));
const MyComplaintsPage = lazy(() => import('./pages/CitizenPages').then(m => ({ default: m.MyComplaintsPage })));
const IssueMapPage = lazy(() => import('./pages/CitizenPages').then(m => ({ default: m.IssueMapPage })));
const CitizenProfilePage = lazy(() => import('./pages/CitizenPages').then(m => ({ default: m.CitizenProfilePage })));
const ComplaintDetailPage = lazy(() => import('./pages/citizen/ComplaintDetailPage').then(m => ({ default: m.ComplaintDetailPage })));

// Lazy-loaded Portals & Assistants
const OfficerDashboard = lazy(() => import('./pages/OfficerPages').then(m => ({ default: m.OfficerDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminPages').then(m => ({ default: m.AdminDashboard })));
const CivicAiAssistant = lazy(() => import('./components/ai/CivicAiAssistant').then(m => ({ default: m.CivicAiAssistant })));

// ── Loading Fallback ────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center space-y-3">
      <img src="/kaiser-mark.png" alt="" className="w-14 mx-auto mix-blend-multiply animate-float" />
      <div className="w-28 h-1 mx-auto rounded-full bg-brand-100 overflow-hidden"><div className="h-full w-1/2 rounded-full bg-brand-500 animate-gradient" style={{animation:'marqueeX 1s linear infinite alternate'}} /></div>
      <p className="text-xs text-neutral-400 font-medium">Loading module…</p>
    </div>
  </div>
);

// ── Route Guard: requires authentication with specific role ─────────────────
const RequireAuth = ({ allowedRoles, children }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-neutral-500 font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on their actual role
    if (role === 'officer') return <Navigate to={`/officer/${user.id}`} replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/app" replace />;
  }

  return children;
};

// ── Guard: redirect to dashboard if already logged in ───────────────────────
const RedirectIfAuth = ({ children }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return children;

  if (user) {
    if (role === 'officer') return <Navigate to={`/officer/${user.id}`} replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/app" replace />;
  }

  return children;
};

function App() {
  const [splash, setSplash] = useState(() => sessionStorage.getItem('kaiser_splash') !== '1');
  const finishSplash = useCallback(() => { sessionStorage.setItem('kaiser_splash', '1'); setSplash(false); }, []);
  return (
    <ThemeProvider>
      <LanguageProvider>
        {splash && <SplashScreen onDone={finishSplash} />}
        <AuthProvider>
          <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
              }}
            />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Marketing & Auth Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/auth" element={<RedirectIfAuth><AuthPage /></RedirectIfAuth>} />
                    <Route path="/login" element={<RedirectIfAuth><AuthPage /></RedirectIfAuth>} />
                    <Route path="/register" element={<RedirectIfAuth><AuthPage /></RedirectIfAuth>} />
                  </Route>

                  {/* Officer Portal Login — standalone (no layout wrapper) */}
                  <Route path="/officer/login" element={<RedirectIfAuth><OfficerLoginPage /></RedirectIfAuth>} />
                  <Route path="/officer-login" element={<RedirectIfAuth><OfficerLoginPage /></RedirectIfAuth>} />

                  {/* Citizen App Portal — requires citizen role */}
                  <Route path="/app" element={
                    <RequireAuth allowedRoles={['citizen']}>
                      <CitizenLayout />
                    </RequireAuth>
                  }>
                    <Route index element={<CitizenDashboard />} />
                    <Route path="report" element={<ReportIssuePage />} />
                    <Route path="my-complaints" element={<MyComplaintsPage />} />
                    <Route path="map" element={<IssueMapPage />} />
                    <Route path="news" element={<CivicNewsPage />} />
                    <Route path="leaderboard" element={<CivicLeaderboardPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="profile" element={<CitizenProfilePage />} />
                    <Route path="complaint/:id" element={<ComplaintDetailPage />} />
                  </Route>

                  {/* Ward Officer Portal — requires officer role, scoped to own officer ID */}
                  <Route path="/officer" element={
                    <RequireAuth allowedRoles={['officer']}>
                      <OfficerLayout />
                    </RequireAuth>
                  }>
                    <Route index element={<OfficerDashboard />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path=":officerId/notifications" element={<NotificationsPage />} />
                    <Route path=":officerId/*" element={<OfficerDashboard />} />
                    <Route path="*" element={<OfficerDashboard />} />
                  </Route>

                  {/* BMC City Admin Console — requires admin role */}
                  <Route path="/admin" element={
                    <RequireAuth allowedRoles={['admin']}>
                      <AdminLayout />
                    </RequireAuth>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="wards" element={<AdminDashboard />} />
                    <Route path="officers" element={<AdminDashboard />} />
                    <Route path="analytics" element={<AdminDashboard />} />
                    <Route path="disaster" element={<AdminDashboard />} />
                    <Route path="complaints" element={<AdminDashboard />} />
                    <Route path="reports" element={<AdminDashboard />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <CivicAiAssistant />
              </Suspense>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
