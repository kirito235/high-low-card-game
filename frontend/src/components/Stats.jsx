import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import statsService from '../services/statsService';
import '../styles/Stats.css';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadStats();
  }, [isAuthenticated, navigate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        statsService.getMyStats(),
        statsService.getMyHistory()
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (err) {
      setError('Failed to load stats. Please try again.');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading-message">
          <div className="spinner">⏳</div>
          <p>Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/game')} className="back-button">
          Back to Game
        </button>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1>📊 Your Statistics</h1>
        <button onClick={() => navigate('/game')} className="back-button">
          ← Back to Game
        </button>
      </div>

      {stats && (
              <div className="stats-grid">
                <div className="stat-card highlight">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">{stats.bestScore}</div>
                  <div className="stat-label">Best Score</div>
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
                  <div className="stat-value">#{stats.userRank || 'N/A'}</div>
                  <div className="stat-label">Global Rank</div>
                </div>

                {/* ✅ NEW: Current Win Streak */}
                <div className="stat-card streak">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">{stats.currentWinStreak || 0}</div>
                  <div className="stat-label">Win Streak</div>
                </div>

                {/* ✅ NEW: Longest Win Streak */}
                <div className="stat-card">
                  <div className="stat-icon">💪</div>
                  <div className="stat-value">{stats.longestWinStreak || 0}</div>
                  <div className="stat-label">Best Streak</div>
                </div>
              </div>
            )}
      <div className="history-section">
        <h2>📜 Game History</h2>
        {history.length === 0 ? (
          <p className="no-history">No games played yet. Start playing to build your history!</p>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Decks</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((game) => (
                  <tr key={game.id} className={game.won ? 'won' : 'lost'}>
                    <td>{formatDate(game.playedAt)}</td>
                    <td className="score-cell">{game.score}</td>
                    <td>{game.numDecks}</td>
                    <td>
                      {game.won ? (
                        <span className="badge won-badge">🎉 Won</span>
                      ) : (
                        <span className="badge lost-badge">❌ Lost</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="button-group">
        <button onClick={() => navigate('/leaderboard')} className="nav-button">
          🏆 View Leaderboard
        </button>
        <button onClick={() => navigate('/game')} className="nav-button primary">
          🎮 Play Again
        </button>
      </div>
    </div>
  );
};

export default Stats;