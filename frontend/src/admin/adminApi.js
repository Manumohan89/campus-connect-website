/**
 * adminApi.js — Axios instance for admin panel.
 * Reuses the same JWT from localStorage but targets /api/admin endpoints.
 * If the server returns 403, the user is redirected away from the admin panel.
 */
import axios from 'axios';

const adminApi = axios.create({
  baseURL: '/api/admin',
  timeout: 30000,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      window.location.href = '/dashboard';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
