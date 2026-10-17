// ─── Axios client + mock mode switch ────────────────────────────────────────
import axios from 'axios';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';
const BASE_URL  = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Optimized network delay (ms) for responsive local execution
const MOCK_DELAY = 0;
export const mockDelay = (ms = MOCK_DELAY) =>
  ms > 0 ? new Promise((r) => setTimeout(r, Math.min(ms, 40))) : Promise.resolve();

export { MOCK_MODE };

// Real axios instance — swap mock by setting VITE_MOCK_MODE=false
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage (populated by AuthContext)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kaiser_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler → will be overridden by AuthContext listener
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('kaiser:unauthorized'));
    }
    return Promise.reject(err);
  }
);

// Standard success/error shape helpers
export const successResponse = (data, meta = null) => ({
  success: true,
  data,
  ...(meta ? { meta } : {}),
});
