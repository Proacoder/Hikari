import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout, CitizenLayout, OfficerLayout, AdminLayout } from './components/layout/Layouts';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CitizenDashboard, ReportIssuePage, MyComplaintsPage, IssueMapPage } from './pages/CitizenPages';
import { OfficerDashboard } from './pages/OfficerPages';
import { AdminDashboard } from './pages/AdminPages';

export function App() {
  return (
    <AuthProvider>
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
            <Route path="notifications" element={<CitizenDashboard />} />
            <Route path="profile" element={<CitizenDashboard />} />
          </Route>

          {/* Ward Officer Portal */}
          <Route path="/officer" element={<OfficerLayout />}>
            <Route index element={<OfficerDashboard />} />
            <Route path="ward-overview" element={<OfficerDashboard />} />
            <Route path="performance" element={<OfficerDashboard />} />
            <Route path="notifications" element={<OfficerDashboard />} />
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
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
