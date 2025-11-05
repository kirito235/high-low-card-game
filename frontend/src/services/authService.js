import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/auth';

const authService = {
  // Login with username and password
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password
      });

      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  signup: async (username, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // Login as guest
  loginAsGuest: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/guest`);

      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // Get auth header for API requests
  getAuthHeader: () => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token };
    }
    return {};
  },

  // Validate token
  validateToken: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/validate`, {
        headers: authService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      authService.logout();
      return null;
    }
  }
};

export default authService;