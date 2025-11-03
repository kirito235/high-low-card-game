import api from '../api/axiosInstance';

const gameService = {
  // Start a new game
  startGame: async (numDecks) => {
    try {
      const response = await api.post(`/start`, { numDecks });
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },

  // Make a guess
  makeGuess: async (deckNumber, guess) => {
    try {
      const response = await api.post(`/guess`, {
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
      const response = await api.get(`/state`);
      return response.data;
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  },

  // Get probabilities for all decks
  getProbabilities: async () => {
    try {
      const response = await api.get(`/probabilities`);
      return response.data;
    } catch (error) {
      console.error('Error getting probabilities:', error);
      throw error;
    }
  },

  // Reset game
  resetGame: async () => {
    try {
      await api.post(`/reset`);
    } catch (error) {
      console.error('Error resetting game:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get(`/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
};

export default gameService;