import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Smart base URL resolution:
//   • If REACT_APP_API_URL is set → use it (ensure it ends with /api)
//   • If running locally → use '/api' (proxied by React dev server to :5000)
// ─────────────────────────────────────────────────────────────────────────────
function getBaseURL() {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    // Ensure the URL ends with /api — handles both:
    //   https://myapp.onrender.com      → https://myapp.onrender.com/api
    //   https://myapp.onrender.com/api  → https://myapp.onrender.com/api  (unchanged)
    return envUrl.endsWith('/api') ? envUrl : envUrl.replace(/\/$/, '') + '/api';
  }
  return '/api'; // local dev — proxied via package.json "proxy"
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // Allow axios to properly serialize FormData with boundary
    if (config.data instanceof FormData) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete config.headers['Content-Type'];
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      const publicPaths = [
        '/login', '/register', '/', '/about-us', '/contact',
        '/faq', '/sgpa-calculator', '/leaderboard', '/vtu-news',
        '/scholarships', '/certificate', '/vtu-result', '/terms', '/privacy-policy',
      ];
      if (!publicPaths.some(p => window.location.pathname.startsWith(p))) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
