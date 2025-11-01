import axios from 'axios';
import { toast } from "react-hot-toast";
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
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//handle expired tokens or unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    debugger
    if (error.response?.data) {
      console.error("API error response:", error.response.data);
    } else if (error.response.status === 401 || error.response.status === 403) {
      console.warn("Unauthorized - token may be invalid or expired");
      localStorage.removeItem("jwt");
      window.location.replace("/login");
    }
    else if (error.request) {
      console.error("No response received:", error.request);
      toast.error("Cannot reach server. Please check your connection.");
    } else {
      console.error("Axios setup error:", error.message);
      toast.error("Unexpected error occurred. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default api;
