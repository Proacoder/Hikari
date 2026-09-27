import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { PublicLayout, CitizenLayout, OfficerLayout, AdminLayout } from './components/layout/Layouts';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CitizenDashboard, ReportIssuePage, MyComplaintsPage, IssueMapPage } from './pages/CitizenPages';
import { OfficerDashboard } from './pages/OfficerPages';
import { AdminDashboard } from './pages/AdminPages';
import { NotificationsPage } from './pages/NotificationsPage';

export function App() {
  return (
    <LanguageProvider>
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
            <Routes>
              {/* Public Marketing & Auth Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
              </Route>

              {/* Citizen App Portal */}
              <Route path="/app" element={<CitizenLayout />}>
                <Route index element={<CitizenDashboard />} />
                <Route path="report" element={<ReportIssuePage />} />
                <Route path="my-complaints" element={<MyComplaintsPage />} />
                <Route path="map" element={<IssueMapPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<CitizenDashboard />} />
              </Route>

              {/* Ward Officer Portal */}
              <Route path="/officer" element={<OfficerLayout />}>
                <Route index element={<OfficerDashboard />} />
                <Route path="ward-overview" element={<OfficerDashboard />} />
                <Route path="performance" element={<OfficerDashboard />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<OfficerDashboard />} />
              </Route>

              {/* BMC City Admin Console */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="wards" element={<AdminDashboard />} />
                <Route path="officers" element={<AdminDashboard />} />
                <Route path="analytics" element={<AdminDashboard />} />
                <Route path="complaints" element={<AdminDashboard />} />
                <Route path="reports" element={<AdminDashboard />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
