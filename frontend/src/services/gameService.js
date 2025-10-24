import axios from 'axios';

const API_BASE_URL = 'https://high-low-card-game.onrender.com';

const gameService = {
  // Start a new game
  startGame: async (numDecks) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/start`, { numDecks });
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },

  // Make a guess
  makeGuess: async (deckNumber, guess) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/guess`, {
        deckNumber,
        guess
      });
      return response.data;
    } catch (error) {
      console.error('Error making guess:', error);
      throw error;
    }
  },

  // Get current game state
  getGameState: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/state`);
      return response.data;
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  },

  // Get probabilities for all decks
  getProbabilities: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/probabilities`);
      return response.data;
    } catch (error) {
      console.error('Error getting probabilities:', error);
      throw error;
    }
  },

  // Reset game
  resetGame: async () => {
    try {
      await axios.post(`${API_BASE_URL}/reset`);
    } catch (error) {
      console.error('Error resetting game:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
};

export default gameService;