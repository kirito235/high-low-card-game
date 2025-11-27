import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const userData = await authService.login(username, password);
    setUser(userData);
    return userData;
  };

  const signup = async (username, email, password) => {
    const response = await authService.signup(username, email, password);
    return response;
  };

  const loginAsGuest = async () => {
    const userData = await authService.loginAsGuest();
    setUser(userData);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);

    // ✅ Clear user-specific localStorage on logout
    localStorage.removeItem('gameTheme');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('cardBack');

    // ✅ Reset to default theme
    document.documentElement.style.setProperty(
      '--game-gradient',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    );
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginAsGuest,
    logout,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};