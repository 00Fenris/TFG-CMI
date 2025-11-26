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

export default api;
