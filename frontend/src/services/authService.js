import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/auth`
  : 'http://localhost:8080/api/auth';

console.log('🔗 Auth API URL:', API_BASE_URL);

const authService = {
  // Login with username and password
  login: async (username, password) => {
    try {
      console.log('🔐 Attempting login for:', username);
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password
      });

      console.log('✅ Login successful:', response.data);

      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('💾 User data saved to localStorage');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Register new user
  signup: async (username, email, password) => {
    try {
      console.log('📝 Attempting signup for:', username);
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        username,
        email,
        password
      });
      console.log('✅ Signup successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Signup error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Login as guest
  loginAsGuest: async () => {
    try {
      console.log('👤 Attempting guest login...');
      const response = await axios.post(`${API_BASE_URL}/guest`);

      console.log('✅ Guest login successful:', response.data);

      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('💾 Guest user data saved to localStorage');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Guest login error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Logout
  logout: () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('👤 Current user:', user.username);
      return user;
    }
    console.log('👤 No user logged in');
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
      console.error('❌ Token validation failed');
      authService.logout();
      return null;
    }
  }
};

export default authService;