import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import statsService from '../services/statsService';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await statsService.getLeaderboard(100);
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard. Please try again.');
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading-message">
          <div className="spinner">⏳</div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/game')} className="back-button">
          Back to Game
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Global Leaderboard</h1>
        <button onClick={() => navigate('/game')} className="back-button">
          ← Back to Game
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="no-data">
          <p>No scores yet. Be the first to complete a game!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="podium">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <div
                key={entry.rank}
                className={`podium-card rank-${index + 1} ${entry.isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="podium-rank">{getRankIcon(entry.rank)}</div>
                <div className="podium-username">{entry.username}</div>
                <div className="podium-score">{entry.score} pts</div>
                <div className="podium-streak">🔥 {entry.longestStreak} streak</div>
              </div>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="leaderboard-table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Total Points</th>
                  <th>Best Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(3).map((entry) => (
                  <tr
                    key={entry.rank}
                    className={entry.isCurrentUser ? 'current-user-row' : ''}
                  >
                    <td className="rank-cell">{getRankIcon(entry.rank)}</td>
                    <td className="username-cell">
                      {entry.username}
                      {entry.isCurrentUser && <span className="you-badge">YOU</span>}
                    </td>
                    <td className="score-cell">{entry.score}</td>
                    <td className="streak-cell">
                      <span className="streak-badge">🔥 {entry.longestStreak}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="button-group">
        <button onClick={() => navigate('/stats')} className="nav-button">
          📊 View My Stats
        </button>
        <button onClick={() => navigate('/game')} className="nav-button primary">
          🎮 Play Game
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;