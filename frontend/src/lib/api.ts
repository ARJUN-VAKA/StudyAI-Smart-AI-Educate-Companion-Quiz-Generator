import axios from 'axios';
import { auth } from '@/lib/firebase';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In local dev, it falls back to '/api' which Vite proxies to localhost:5000.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes default
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally — extract a readable message and reject with it
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message: string =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred';
    // Reject with a plain string so callers can just use err.message
    return Promise.reject(new Error(message));
  }
);

export default api;
