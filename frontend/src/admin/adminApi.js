/**
 * adminApi.js — Axios instance for admin panel.
 * Reuses the same JWT from localStorage but targets /api/admin endpoints.
 * If the server returns 403, the user is redirected away from the admin panel.
 */
import axios from 'axios';

function getAdminBaseURL() {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    const base = envUrl.endsWith('/api') ? envUrl : envUrl.replace(/\/$/, '') + '/api';
    return `${base}/admin`;
  }
  return '/api/admin';
}

const adminApi = axios.create({
  baseURL: getAdminBaseURL(),
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
