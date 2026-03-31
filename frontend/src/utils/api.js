import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Proactive token refresh — if token is within 24h of expiry, refresh silently
let refreshPromise = null;
function shouldRefresh(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    return expiresIn > 0 && expiresIn < 24 * 60 * 60 * 1000; // less than 24h left
  } catch { return false; }
}
async function silentRefresh() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = axios.post('/api/users/refresh-token', {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).then(r => {
    localStorage.setItem('token', r.data.token);
    localStorage.setItem('role', r.data.role || 'user');
    refreshPromise = null;
  }).catch(() => { refreshPromise = null; });
  return refreshPromise;
}

// Response interceptor — handle 401 and trigger refresh when needed
api.interceptors.response.use(
  async (response) => {
    // Proactively refresh if token is aging
    const token = localStorage.getItem('token');
    if (token && shouldRefresh(token)) silentRefresh().catch(() => {});
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      const publicPaths = [
        '/login', '/register', '/verify-otp', '/', '/about-us', '/contact',
        '/faq', '/sgpa-calculator', '/leaderboard', '/vtu-news', '/scholarships',
        '/certificate', '/vtu-result', '/terms', '/privacy-policy',
      ];
      if (!publicPaths.some(p => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
