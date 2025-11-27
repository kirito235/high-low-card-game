import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, isGuest } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/game" className="navbar-logo">
          🎴 Card Game
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/game" className="navbar-link">
                🎮 Play
              </Link>
              <Link to="/stats" className="navbar-link">
                📊 Stats
              </Link>
              <Link to="/leaderboard" className="navbar-link">
                🏆 Leaderboard
              </Link>

              <div className="navbar-user">
                <span className="username">
                  {user?.username}
                  {isGuest && <span className="guest-badge">Guest</span>}
                </span>
                <Link to="/settings" className="navbar-link">
                  ⚙️ Settings
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/leaderboard" className="navbar-link">
                🏆 Leaderboard
              </Link>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/signup" className="navbar-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;