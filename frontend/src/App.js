import axios from 'axios';
import authService from './services/authService';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import GameBoard from './components/GameBoard';
import Stats from './components/Stats';
import Leaderboard from './components/Leaderboard';
import Navbar from './components/Navbar';
import PublicStats from './components/PublicStats';
import Settings from './components/Settings';

import './App.css';

// ✅ Theme configuration
const THEME_OPTIONS = {
  'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'ocean': 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
  'sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'forest': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'midnight': 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)'
};

// ✅ NEW: Separate component that uses AuthContext
function AppContent() {
  const { user, isAuthenticated } = useAuth();

  // ✅ Apply saved theme on app load AND when user changes
  useEffect(() => {
    const loadUserTheme = async () => {
      if (isAuthenticated && user) {
        // Load from backend for logged-in users
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/user/settings`,
            {
              headers: authService.getAuthHeader()
            }
          );

          const userTheme = response.data.theme || 'default';
          const userCardBack = response.data.cardBack || 'default';
          const userAvatar = response.data.avatar || '🎴';

          const themeGradient = THEME_OPTIONS[userTheme] || THEME_OPTIONS['default'];

          document.documentElement.style.setProperty('--game-gradient', themeGradient);
          document.body.style.background = themeGradient;

          // ✅ Cache user settings in localStorage
          localStorage.setItem('gameTheme', userTheme);
          localStorage.setItem('cardBack', userCardBack);
          localStorage.setItem('userAvatar', userAvatar);

          console.log('✅ Applied user theme:', userTheme);
          console.log('✅ Applied user card back:', userCardBack);
          console.log('✅ Applied user avatar:', userAvatar);

        } catch (err) {
          console.error('Failed to load user settings:', err);
          // Fall back to localStorage
          const savedTheme = localStorage.getItem('gameTheme') || 'default';
          const themeGradient = THEME_OPTIONS[savedTheme] || THEME_OPTIONS['default'];
          document.documentElement.style.setProperty('--game-gradient', themeGradient);
          document.body.style.background = themeGradient;
        }
      } else {
        // For non-authenticated users, use localStorage or default
        const savedTheme = localStorage.getItem('gameTheme') || 'default';
        const themeGradient = THEME_OPTIONS[savedTheme] || THEME_OPTIONS['default'];
        document.documentElement.style.setProperty('--game-gradient', themeGradient);
        document.body.style.background = themeGradient;
      }
    };

    loadUserTheme();
  }, [user, isAuthenticated]); // ✅ Re-run when user changes

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Protected Routes */}
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GameBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route path="/stats/:username" element={<PublicStats />} />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

// ✅ Main App component wraps everything with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;