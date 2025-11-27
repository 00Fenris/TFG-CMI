import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';
const rawBase = process.env.REACT_APP_API_URL;
let baseURL;
if (isDev) {
  // In development, prefer using CRA proxy if REACT_APP_API_URL is missing.
  baseURL = rawBase ? String(rawBase).replace(/^['"]+|['"]+$/g, '') : '';
} else {
  baseURL = String(rawBase || 'http://localhost:4000').replace(/^['"]+|['"]+$/g, '');
}

// Debug: show the computed baseURL in development so we can troubleshoot mismatches
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log('API baseURL configured to:', baseURL);
}

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercept 401 responses to handle expired/invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || '';
    if (status === 401 && (message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid') || message.toLowerCase().includes('authentication'))) {
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      // eslint-disable-next-line no-console
      console.warn('Session expired or invalid. Redirecting to login.');
      try { window.location.href = '/login'; } catch (e) { /* ignore in non-browser env */ }
    }
    return Promise.reject(error);
  }
);

export default api;
