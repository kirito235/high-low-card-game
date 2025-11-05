import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/game`
  : 'http://localhost:8081/api/game';

console.log('🔗 Game API URL:', API_BASE_URL);

const gameService = {
  // Start a new game
  startGame: async (numDecks) => {
    try {
      console.log('🎮 Starting game with', numDecks, 'decks');
      const response = await axios.post(
        `${API_BASE_URL}/start`,
        { numDecks },
        { headers: authService.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error starting game:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Make a guess
  makeGuess: async (deckNumber, guess) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/guess`,
        { deckNumber, guess },
        { headers: authService.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error making guess:', error);
      throw error;
    }
  },

  // Get current game state
  getGameState: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/state`, {
        headers: authService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting game state:', error);
      throw error;
    }
  },

  // Get probabilities for all decks
  getProbabilities: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/probabilities`, {
        headers: authService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting probabilities:', error);
      throw error;
    }
  },

  // Reset game
  resetGame: async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/reset`,
        {},
        { headers: authService.getAuthHeader() }
      );
    } catch (error) {
      console.error('❌ Error resetting game:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend health check passed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      throw error;
    }
  }
};

export default gameService;