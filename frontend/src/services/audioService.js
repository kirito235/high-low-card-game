// src/services/audioService.js

class AudioService {
  constructor() {
    // Initialize all audio elements
    this.sounds = {
      // Background music
      bgMusic: null,

      // Game sounds
      cardFlip: null,
      correctGuess: null,
      wrongGuess: null,
      victory: null,
      gameOver: null,
      cardSelect: null,
      hintActivate: null,
    };

    // Load volume settings from localStorage
    this.volumes = this.loadVolumes();

    // Track if audio is initialized
    this.initialized = false;

    // Track if music is playing
    this.musicPlaying = false;
  }

  /**
   * Initialize all audio files
   * Call this after user interaction to avoid autoplay blocks
   */
  initialize() {
    if (this.initialized) return;

    try {
      // Initialize background music
      this.sounds.bgMusic = new Audio('/sounds/background.mp3');
      this.sounds.bgMusic.loop = true;

      // Initialize sound effects
      this.sounds.cardFlip = new Audio('/sounds/card-flip.mp3');
      this.sounds.correctGuess = new Audio('/sounds/correct.mp3');
      this.sounds.wrongGuess = new Audio('/sounds/wrong.mp3');
      this.sounds.victory = new Audio('/sounds/victory.mp3');
      this.sounds.gameOver = new Audio('/sounds/gameover.mp3');
      this.sounds.cardSelect = new Audio('/sounds/select.mp3');
      this.sounds.hintActivate = new Audio('/sounds/hint.mp3');

      // Apply saved volumes
      this.applyVolumes();

      this.initialized = true;
      console.log('✅ Audio initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing audio:', error);
    }
  }

  /**
   * Load volume settings from localStorage
   */
  loadVolumes() {
    const saved = localStorage.getItem('audioSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing audio settings:', e);
      }
    }

    // Default settings
    return {
      master: 0.7,
      music: 0.5,
      sfx: 0.8,
      muted: false
    };
  }

  /**
   * Save volume settings to localStorage
   */
  saveVolumes() {
    try {
      localStorage.setItem('audioSettings', JSON.stringify(this.volumes));
    } catch (e) {
      console.error('Error saving audio settings:', e);
    }
  }

  /**
   * Apply current volume settings to all audio elements
   */
  applyVolumes() {
    if (!this.initialized) return;

    const musicVolume = this.volumes.muted ? 0 : this.volumes.master * this.volumes.music;
    const sfxVolume = this.volumes.muted ? 0 : this.volumes.master * this.volumes.sfx;

    // Set music volume
    if (this.sounds.bgMusic) {
      this.sounds.bgMusic.volume = musicVolume;
    }

    // Set SFX volumes
    Object.keys(this.sounds).forEach(key => {
      if (key !== 'bgMusic' && this.sounds[key]) {
        this.sounds[key].volume = sfxVolume;
      }
    });
  }

  /**
   * Set volume for a specific type
   * @param {string} type - 'master', 'music', or 'sfx'
   * @param {number} value - Volume level (0.0 to 1.0)
   */
  setVolume(type, value) {
    if (type in this.volumes) {
      this.volumes[type] = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
      this.saveVolumes();
      this.applyVolumes();
    }
  }

  /**
   * Toggle mute on/off
   */
  toggleMute() {
    this.volumes.muted = !this.volumes.muted;
    this.saveVolumes();
    this.applyVolumes();

    if (this.volumes.muted) {
      this.stopMusic();
    } else if (this.musicPlaying) {
      this.playMusic();
    }
  }

  /**
   * Get current volume settings
   */
  getVolumes() {
    return { ...this.volumes };
  }

  /**
   * Check if audio is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Play background music
   */
  playMusic() {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.volumes.muted || !this.sounds.bgMusic) return;

    try {
      this.sounds.bgMusic.play()
        .then(() => {
          this.musicPlaying = true;
          console.log('🎵 Background music started');
        })
        .catch(e => {
          console.log('Music autoplay blocked. User interaction needed.', e);
        });
    } catch (error) {
      console.error('Error playing music:', error);
    }
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (this.sounds.bgMusic) {
      this.sounds.bgMusic.pause();
      this.sounds.bgMusic.currentTime = 0;
      this.musicPlaying = false;
    }
  }

  /**
   * Pause background music (keeps position)
   */
  pauseMusic() {
    if (this.sounds.bgMusic) {
      this.sounds.bgMusic.pause();
      this.musicPlaying = false;
    }
  }

  /**
   * Resume background music
   */
  resumeMusic() {
    if (!this.volumes.muted && this.sounds.bgMusic) {
      this.sounds.bgMusic.play()
        .then(() => {
          this.musicPlaying = true;
        })
        .catch(e => console.log('Resume music error:', e));
    }
  }

  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound to play
   */
  playSound(soundName) {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.volumes.muted || !this.sounds[soundName]) return;

    try {
      // Clone the audio to allow overlapping sounds
      const sound = this.sounds[soundName].cloneNode();
      sound.volume = this.volumes.master * this.volumes.sfx;

      sound.play().catch(e => {
        console.log(`Sound ${soundName} blocked or failed:`, e);
      });
    } catch (error) {
      console.error(`Error playing ${soundName}:`, error);
    }
  }

  /**
   * Play card flip sound
   */
  playCardFlip() {
    this.playSound('cardFlip');
  }

  /**
   * Play correct guess sound
   */
  playCorrect() {
    this.playSound('correctGuess');
  }

  /**
   * Play wrong guess sound
   */
  playWrong() {
    this.playSound('wrongGuess');
  }

  /**
   * Play victory sound
   */
  playVictory() {
    this.playSound('victory');
  }

  /**
   * Play game over sound
   */
  playGameOver() {
    this.playSound('gameOver');
  }

  /**
   * Play card selection sound
   */
  playSelect() {
    this.playSound('cardSelect');
  }

  /**
   * Play hint activation sound
   */
  playHint() {
    this.playSound('hintActivate');
  }

  /**
   * Preload all sounds (optional, for better performance)
   */
  preloadSounds() {
    if (!this.initialized) {
      this.initialize();
    }

    Object.keys(this.sounds).forEach(key => {
      if (this.sounds[key]) {
        this.sounds[key].load();
      }
    });

    console.log('🎵 All sounds preloaded');
  }

  /**
   * Clean up audio resources
   */
  cleanup() {
    this.stopMusic();

    Object.keys(this.sounds).forEach(key => {
      if (this.sounds[key]) {
        this.sounds[key].pause();
        this.sounds[key].src = '';
        this.sounds[key] = null;
      }
    });

    this.initialized = false;
    console.log('🧹 Audio cleaned up');
  }
}

// Export singleton instance
const audioService = new AudioService();

// Auto-initialize on first user interaction (optional)
if (typeof window !== 'undefined') {
  const initAudio = () => {
    audioService.initialize();
    // Remove listeners after first interaction
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
    document.removeEventListener('touchstart', initAudio);
  };

  // Listen for user interactions
  document.addEventListener('click', initAudio, { once: true });
  document.addEventListener('keydown', initAudio, { once: true });
  document.addEventListener('touchstart', initAudio, { once: true });
}

export default audioService;