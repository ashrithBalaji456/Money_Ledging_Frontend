import axios from 'axios';

// Allows environment override or defaults to the deployed backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://money-ledging-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45s to accommodate potential cloud backend cold starts
});

/**
 * Clear stored user authentication session
 */
export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
};

/**
 * Check if the stored JWT token is valid and not expired
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      clearAuthSession();
      return false;
    }
    const payload = JSON.parse(atob(parts[1]));
    // Check if exp exists and is past current time
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearAuthSession();
      return false;
    }
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthorized / forbidden
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      clearAuthSession();
      // Redirect to login only if not already on the login or register page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
