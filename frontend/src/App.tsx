import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MasterProfilePage } from './pages/MasterProfilePage';
import { JobFeedPage } from './pages/JobFeedPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ColdEmailPage } from './pages/ColdEmailPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<MasterProfilePage />} />
              <Route path="/jobs" element={<JobFeedPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/cold-email" element={<ColdEmailPage />} />
              <Route path="/interview-prep" element={<InterviewPrepPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
