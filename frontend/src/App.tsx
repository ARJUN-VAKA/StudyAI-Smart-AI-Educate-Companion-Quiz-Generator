import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import PrivateRoute from '@/components/PrivateRoute';
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import UploadPage from '@/pages/dashboard/UploadPage';
import SummaryPage from '@/pages/dashboard/SummaryPage';
import FlashcardsPage from '@/pages/dashboard/FlashcardsPage';
import QuizPage from '@/pages/dashboard/QuizPage';
import SchedulePage from '@/pages/dashboard/SchedulePage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="summary" element={<SummaryPage />} />
              <Route path="flashcards" element={<FlashcardsPage />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
