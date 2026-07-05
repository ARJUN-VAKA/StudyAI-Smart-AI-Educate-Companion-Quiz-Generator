import axios from 'axios';
import { auth } from '@/lib/firebase';

const api = axios.create({
  baseURL: '/api',
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

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
