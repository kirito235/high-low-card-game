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
  { id: 'default', name: 'Black', preview: '/cards/back.png' },
  { id: 'blue', name: 'Blue', preview: '/cards/back-blue.png' },
  { id: 'red', name: 'Red', preview: '/cards/back-red.png' },
  { id: 'purple', name: 'Purple', preview: '/cards/back-purple.png' },
  { id: 'orange', name: 'Orange', preview: '/cards/back-orange.png' }
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

  // Original values to track changes
  const [originalAvatar, setOriginalAvatar] = useState(selectedAvatar);
  const [originalTheme, setOriginalTheme] = useState(selectedTheme);
  const [originalCardBack, setOriginalCardBack] = useState(selectedCardBack);
  const [originalStatsPublic, setOriginalStatsPublic] = useState(true);

  // Privacy settings
  const [statsPublic, setStatsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Track if changes were made
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadAllSettings();
  }, []);

  // Check for changes
  useEffect(() => {
    const changed =
      selectedAvatar !== originalAvatar ||
      selectedTheme !== originalTheme ||
      selectedCardBack !== originalCardBack ||
      statsPublic !== originalStatsPublic;

    setHasChanges(changed);
  }, [selectedAvatar, selectedTheme, selectedCardBack, statsPublic,
      originalAvatar, originalTheme, originalCardBack, originalStatsPublic]);

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      // Load from backend
      const response = await axios.get(`${API_BASE_URL}/api/user/settings`, {
        headers: authService.getAuthHeader()
      });

      const settings = response.data;

      // Apply avatar
      if (settings.avatar) {
        setSelectedAvatar(settings.avatar);
        setOriginalAvatar(settings.avatar);
        localStorage.setItem('userAvatar', settings.avatar);
      }

      // Apply theme
      if (settings.theme) {
        setSelectedTheme(settings.theme);
        setOriginalTheme(settings.theme);
        localStorage.setItem('gameTheme', settings.theme);
        applyTheme(settings.theme);
      } else {
        // Apply saved theme from localStorage
        applyTheme(selectedTheme);
      }

      // Apply card back
      if (settings.cardBack) {
        setSelectedCardBack(settings.cardBack);
        setOriginalCardBack(settings.cardBack);
        localStorage.setItem('cardBack', settings.cardBack);
      }

      // Apply privacy
      const isPublic = settings.statsPublic !== null ? settings.statsPublic : true;
      setStatsPublic(isPublic);
      setOriginalStatsPublic(isPublic);

    } catch (error) {
      console.error('Error loading settings:', error);
      // Still apply theme from localStorage
      applyTheme(selectedTheme);
    } finally {
      setLoading(false);
    }
  };

  const saveAllSettings = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/api/user/settings`,
        {
          avatar: selectedAvatar,
          theme: selectedTheme,
          cardBack: selectedCardBack,
          statsPublic: statsPublic
        },
        { headers: authService.getAuthHeader() }
      );

      // Update localStorage
      localStorage.setItem('userAvatar', selectedAvatar);
      localStorage.setItem('gameTheme', selectedTheme);
      localStorage.setItem('cardBack', selectedCardBack);

      // Update originals
      setOriginalAvatar(selectedAvatar);
      setOriginalTheme(selectedTheme);
      setOriginalCardBack(selectedCardBack);
      setOriginalStatsPublic(statsPublic);

      // Apply theme globally
      applyTheme(selectedTheme);

      setHasChanges(false);
      audioService.playCorrect();
      alert('Settings saved successfully! ✅');

    } catch (error) {
      console.error('Error saving settings:', error);
      audioService.playWrong();
      alert('Failed to save settings. Please try again.');
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

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    audioService.playSelect();
  };

  const applyTheme = (themeId) => {
    const theme = THEME_OPTIONS.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--game-gradient', theme.gradient);
      // Also apply to body for immediate visual feedback
      document.body.style.background = theme.gradient;
    }
  };

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    audioService.playSelect();
  };

  const handleCardBackSelect = (cardBackId) => {
    setSelectedCardBack(cardBackId);
    audioService.playSelect();
  };

  const handlePrivacyToggle = () => {
    setStatsPublic(!statsPublic);
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

  const handleBack = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/game');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <div className="header-buttons">
          {hasChanges && (
            <button
              onClick={saveAllSettings}
              className="save-button"
              disabled={saving}
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          )}
          <button onClick={handleBack} className="back-button">
            ← Back
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="unsaved-changes-banner">
          ⚠️ You have unsaved changes. Click "Save Changes" to apply them.
        </div>
      )}

      <div className="settings-content">

        {/* Audio Settings */}
        <div className="settings-section">
          <h2>🔊 Audio Settings</h2>
          <p className="section-note">Audio settings are saved automatically</p>

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

          <div className="sound-test-buttons">
            <button onClick={() => testSound('flip')}>🎴 Card Flip</button>
            <button onClick={() => testSound('correct')}>✅ Correct</button>
            <button onClick={() => testSound('wrong')}>❌ Wrong</button>
            <button onClick={() => testSound('victory')}>🎉 Victory</button>
          </div>
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

        {/* Privacy Settings */}
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
              disabled={loading}
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