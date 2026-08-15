import axios from 'axios';

// Default API URL (proxied via Vite /api to backend on port 8000)
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('@619_auth_user');
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized - logging out');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('@619_auth_user');
      // If we are in the browser, dispatch an event or reload to clear state
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);
