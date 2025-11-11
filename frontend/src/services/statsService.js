import axios from 'axios';
import authService from './authService';

axios.defaults.withCredentials = true;


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

console.log('🔗 Stats API URL:', API_BASE_URL);

const statsService = {
  // Get my stats
  getMyStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats/me`, {
        headers: authService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Get my game history
  getMyHistory: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats/history`, {
        headers: authService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Get user stats by username
  getUserStats: async (username) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats/user/${username}`, {
        headers: authService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Get leaderboard
  getLeaderboard: async (limit = 100) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard?limit=${limit}`, {
        headers: authService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  // Get top 10
  getTop10: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard/top10`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top 10:', error);
      throw error;
    }
  },

  // Save game result
  saveGameResult: async (score, numDecks, won) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/game/save`,
        { score, numDecks, won },
        { headers: authService.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving game result:', error);
      throw error;
    }
  }
};

export default statsService;