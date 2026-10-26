import axios from 'axios';

// Works on localhost and when the app is opened from a phone on the same Wi-Fi
function resolveBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  const host = window.location.hostname;
  const isLocalPage = host === 'localhost' || host === '127.0.0.1';
  if (!fromEnv) return `${window.location.protocol}//${host}:5000/api`;
  if (!isLocalPage && /\/\/(localhost|127\.0\.0\.1)/.test(fromEnv)) {
    return fromEnv.replace(/\/\/(localhost|127\.0\.0\.1)/, `//${host}`);
  }
  return fromEnv;
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 30000,
});

let onUnauthorized = null;

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('algomentor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_RETRIES = 3;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const cfg = err.config;
    const status = err.response?.status;

    // The database may be reconnecting for a moment. Retry quietly so pages
    // show their loading state instead of flashing an error banner.
    const dbWarmingUp = status === 503 && /database/i.test(err.response?.data?.error || '');
    const networkBlip = !err.response && err.code === 'ERR_NETWORK' && cfg?.method === 'get';
    if (cfg && (dbWarmingUp || networkBlip) && (cfg.__retries || 0) < MAX_RETRIES) {
      cfg.__retries = (cfg.__retries || 0) + 1;
      await sleep(700 * cfg.__retries);
      return api(cfg);
    }

    const url = cfg?.url || '';
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/google');
    if (status === 401 && onUnauthorized && !isAuthForm) {
      onUnauthorized();
    }
    return Promise.reject(err);
  }
);

export default api;
