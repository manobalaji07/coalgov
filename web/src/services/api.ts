import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customIp = localStorage.getItem('coalgov_server_ip');
    if (customIp) return `${customIp}/api`;

    const origin = window.location.origin;
    // Native Mobile Capacitor App origin is capacitor://localhost or https://localhost
    if (origin.includes('capacitor://') || origin.startsWith('file://')) {
      return 'http://10.0.2.2:8000/api'; // Android Emulator default host loopback
    }
    return `${origin}/api`;
  }
  return 'http://localhost:8000/api';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coalgov_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Re-evaluate baseURL dynamically in case user saved server IP
  config.baseURL = getBaseUrl();
  return config;
});

export default api;
