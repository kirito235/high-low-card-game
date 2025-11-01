import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/game';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL, 
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Request made to:', config.url);
    // Attach JWT token from localStorage if available
    const token = localStorage.getItem('jwt');
    console.log('Using token:', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle expired tokens or unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Unauthorized - token may be invalid or expired');
      // Optionally clear token and redirect to login
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
