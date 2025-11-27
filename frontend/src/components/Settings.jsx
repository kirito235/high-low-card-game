import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import audioService from '../services/audioService';
import axios from 'axios';
import authService from '../services/authService';
import '../styles/Settings.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AVATAR_OPTIONS = [
  '🎴', '🃏', '🎲', '🎰', '🎯', '🏆', '👑', '💎',
  '🔥', '⚡', '🌟', '💫', '🎭', '🎪', '🎨', '🎬'
];

const THEME_OPTIONS = [
  { id: 'default', name: 'Classic Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'ocean', name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
  { id: 'sunset', name: 'Sunset Orange', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'forest', name: 'Forest Green', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'midnight', name: 'Midnight Dark', gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)' }
];

const CARD_BACK_OPTIONS = [
  { id: 'default', name: 'Classic Red', preview: '/cards/back.png' },
  { id: 'blue', name: 'Royal Blue', preview: '/cards/back-blue.png' },
  { id: 'purple', name: 'Emerald Green', preview: '/cards/back-purple.png' },
  { id: 'red', name: 'Golden Luxury', preview: '/cards/back-red.png' }
  { id: 'orange', name: 'Golden Luxury', preview: '/cards/back-orange.png' }
];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Audio settings
  const [volumes, setVolumes] = useState(audioService.getVolumes());

  // Visual settings
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem('userAvatar') || AVATAR_OPTIONS[0]
  );
  const [selectedTheme, setSelectedTheme] = useState(
    localStorage.getItem('gameTheme') || 'default'
  );
  const [selectedCardBack, setSelectedCardBack] = useState(
    localStorage.getItem('cardBack') || 'default'
  );

  // ✅ NEW: Privacy settings
  const [statsPublic, setStatsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    applyTheme(selectedTheme);
    loadPrivacySettings();
  }, []);

  useEffect(() => {
    applyTheme(selectedTheme);
    loadPrivacySettings();
  }, []);

  // ✅ Load user's saved avatar from backend
  const loadPrivacySettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/privacy`, {
        headers: authService.getAuthHeader()
      });
      setStatsPublic(response.data.statsPublic);

      // ✅ Load avatar if available
      if (response.data.avatar) {
        setSelectedAvatar(response.data.avatar);
        localStorage.setItem('userAvatar', response.data.avatar);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Save privacy settings
  const handlePrivacyToggle = async () => {
    setSaving(true);
    try {
      const newValue = !statsPublic;
      await axios.post(`${API_BASE_URL}/api/user/privacy`,
        { statsPublic: newValue },
        { headers: authService.getAuthHeader() }
      );
      setStatsPublic(newValue);
      audioService.playSelect();
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleVolumeChange = (type, value) => {
    audioService.setVolume(type, value);
    setVolumes(audioService.getVolumes());
  };

  const handleMuteToggle = () => {
    audioService.toggleMute();
    setVolumes(audioService.getVolumes());
  };

  const handleAvatarSelect = async (avatar) => {
    setSelectedAvatar(avatar);
    localStorage.setItem('userAvatar', avatar);
    audioService.playSelect();

    // ✅ Save to backend
    try {
      await axios.post(`${API_BASE_URL}/api/user/privacy`,
        { avatar },
        { headers: authService.getAuthHeader() }
      );
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  const applyTheme = (themeId) => {
    const theme = THEME_OPTIONS.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--game-gradient', theme.gradient);
    }
  };

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    localStorage.setItem('gameTheme', themeId);
    applyTheme(themeId);
    audioService.playSelect();
  };

  const handleCardBackSelect = (cardBackId) => {
    setSelectedCardBack(cardBackId);
    localStorage.setItem('cardBack', cardBackId);
    audioService.playSelect();
  };

  const testSound = (soundType) => {
    switch(soundType) {
      case 'flip':
        audioService.playCardFlip();
        break;
      case 'correct':
        audioService.playCorrect();
        break;
      case 'wrong':
        audioService.playWrong();
        break;
      case 'victory':
        audioService.playVictory();
        break;
      default:
        audioService.playSelect();
    }
  };

  // ✅ Don't stop music when navigating to settings
  useEffect(() => {
    // Music continues playing from GameBoard
    return () => {
      // Don't stop music on unmount
    };
  }, []);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
      </div>

      <div className="settings-content">

        {/* Audio Settings */}
        <div className="settings-section">
          <h2>🔊 Audio Settings</h2>

          <div className="setting-item">
            <div className="setting-label">
              <span>Mute All</span>
              <button
                className={`mute-button ${volumes.muted ? 'muted' : ''}`}
                onClick={handleMuteToggle}
              >
                {volumes.muted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Master Volume</span>
              <span className="volume-value">{Math.round(volumes.master * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumes.master}
              onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
              disabled={volumes.muted}
              className="volume-slider"
            />
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Music Volume</span>
              <span className="volume-value">{Math.round(volumes.music * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumes.music}
              onChange={(e) => handleVolumeChange('music', parseFloat(e.target.value))}
              disabled={volumes.muted}
              className="volume-slider"
            />
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Sound Effects</span>
              <span className="volume-value">{Math.round(volumes.sfx * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumes.sfx}
              onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
              disabled={volumes.muted}
              className="volume-slider"
            />
          </div>

{/*           <div className="sound-test-buttons"> */}
{/*             <button onClick={() => testSound('flip')}>🎴 Card Flip</button> */}
{/*             <button onClick={() => testSound('correct')}>✅ Correct</button> */}
{/*             <button onClick={() => testSound('wrong')}>❌ Wrong</button> */}
{/*             <button onClick={() => testSound('victory')}>🎉 Victory</button> */}
{/*           </div> */}
        </div>

        {/* Avatar Selection */}
        <div className="settings-section">
          <h2>😀 Choose Your Avatar</h2>
          <div className="avatar-grid">
            {AVATAR_OPTIONS.map(avatar => (
              <div
                key={avatar}
                className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(avatar)}
              >
                {avatar}
              </div>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="settings-section">
          <h2>🎨 Game Theme</h2>
          <div className="theme-grid">
            {THEME_OPTIONS.map(theme => (
              <div
                key={theme.id}
                className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <div
                  className="theme-preview"
                  style={{ background: theme.gradient }}
                ></div>
                <span className="theme-name">{theme.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Back Selection */}
        <div className="settings-section">
          <h2>🃏 Card Back Design</h2>
          <div className="card-back-grid">
            {CARD_BACK_OPTIONS.map(cardBack => (
              <div
                key={cardBack.id}
                className={`card-back-option ${selectedCardBack === cardBack.id ? 'selected' : ''}`}
                onClick={() => handleCardBackSelect(cardBack.id)}
              >
                <img src={cardBack.preview} alt={cardBack.name} />
                <span className="card-back-name">{cardBack.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ NEW: Privacy Settings */}
        <div className="settings-section">
          <h2>🔒 Privacy Settings</h2>

          <div className="privacy-setting">
            <div className="privacy-info">
              <h3>Show Stats on Leaderboard</h3>
              <p>When enabled, other players can click your name on the leaderboard to view your public stats.</p>
            </div>
            <button
              className={`toggle-button ${statsPublic ? 'active' : ''}`}
              onClick={handlePrivacyToggle}
              disabled={saving || loading}
            >
              <div className="toggle-slider"></div>
              <span>{statsPublic ? 'Public' : 'Private'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;