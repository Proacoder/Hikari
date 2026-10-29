// ─── Axios client + mock mode switch ────────────────────────────────────────
import axios from 'axios';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';
const BASE_URL  = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

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

// Global 401 handler → only clears session for genuine token expiration, never for public 401/403
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const hasAuthToken = Boolean(err.config?.headers?.Authorization || localStorage.getItem('kaiser_token'));
    // Only dispatch unauthorized session reset if a token was sent and rejected as expired/invalid (401), NOT 403 Forbidden
    if (err.response?.status === 401 && hasAuthToken) {
      window.dispatchEvent(new CustomEvent('kaiser:unauthorized'));
    }
    const backendMessage = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error;
    if (backendMessage) {
      err.message = typeof backendMessage === 'string' ? backendMessage : JSON.stringify(backendMessage);
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
