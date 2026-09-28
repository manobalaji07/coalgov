import axios from 'axios';

// Use relative API path if served from same origin, or fallback to localhost:8000
const API_BASE_URL = typeof window !== 'undefined' && window.location.origin ? `${window.location.origin}/api` : 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coalgov_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
