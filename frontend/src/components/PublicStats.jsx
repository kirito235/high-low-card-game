import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import statsService from '../services/statsService';
import { useAuth } from '../context/AuthContext';
import '../styles/Stats.css';

const PublicStats = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, [username]);

  const loadUserStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await statsService.getUserStats(username);

      // ✅ Check if it's the user's own stats
      const isOwnProfile = user && user.username === username;

      // ✅ If stats are private and it's not the user's own profile, block access
      if (!isOwnProfile && data.statsPublic === false) {
        setIsPrivate(true);
      } else {
        setStats(data);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsPrivate(true);
      } else if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load stats. Please try again.');
      }
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading-message">
          <div className="spinner">⏳</div>
          <p>Loading stats...</p>
        </div>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="stats-container">
        <div className="stats-header">
          <h1>🔒 Private Profile</h1>
          <button onClick={() => navigate('/leaderboard')} className="back-button">
            ← Back to Leaderboard
          </button>
        </div>
        <div className="private-profile-message">
          <div className="lock-icon">🔒</div>
          <h2>{username} has set their stats to private</h2>
          <p>This user has chosen not to share their statistics publicly.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="stats-header">
          <h1>❌ Error</h1>
          <button onClick={() => navigate('/leaderboard')} className="back-button">
            ← Back to Leaderboard
          </button>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1>📊 {username}'s Statistics</h1>
        <button onClick={() => navigate('/leaderboard')} className="back-button">
          ← Back to Leaderboard
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{stats.bestScore}</div>
            <div className="stat-label">Total Score</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎮</div>
            <div className="stat-value">{stats.totalGames}</div>
            <div className="stat-label">Total Games</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.gamesWon}</div>
            <div className="stat-label">Games Won</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.winRate.toFixed(1)}%</div>
            <div className="stat-label">Win Rate</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.averageScore.toFixed(1)}</div>
            <div className="stat-label">Avg Score</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🥇</div>
            <div className="stat-value">
              {stats.userRank !== null && stats.bestScore > 0
                ? `#${stats.userRank}`
                : 'N/A'}
            </div>
            <div className="stat-label">Global Rank</div>
          </div>

          <div className="stat-card streak">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{stats.currentWinStreak || 0}</div>
            <div className="stat-label">Win Streak</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💪</div>
            <div className="stat-value">{stats.longestWinStreak || 0}</div>
            <div className="stat-label">Best Streak</div>
          </div>
        </div>
      )}

      <div className="button-group">
        <button onClick={() => navigate('/leaderboard')} className="nav-button">
          🏆 View Leaderboard
        </button>
        <button onClick={() => navigate('/game')} className="nav-button primary">
          🎮 Play Game
        </button>
      </div>
    </div>
  );
};

export default PublicStats;