import axios from 'axios';
import { AUTH_STORAGE_KEY } from '../utils/constants';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== null
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:8080';

export function getStoredAuth() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredAuth(auth) {
  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

function isFormData(data) {
  return (
    data &&
    (data instanceof FormData ||
      Object.prototype.toString.call(data) === '[object FormData]' ||
      (typeof data === 'object' && typeof data.append === 'function'))
  );
}

axiosClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  if (isFormData(config.data)) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    }
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      delete config.headers['CONTENT-TYPE'];
    }
  }
  return config;
});

// Queues requests that arrive while a token refresh is already in flight, so a
// burst of parallel 401s only triggers a single POST /api/auth/refresh call.
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, accessToken) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(accessToken);
  });
  pendingQueue = [];
}

function redirectToLogin() {
  setStoredAuth(null);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = originalRequest?.url?.startsWith('/api/auth/');

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const auth = getStoredAuth();
    if (!auth?.refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((accessToken) => {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken: auth.refreshToken,
      });
      const payload = data.data;
      const nextAuth = { ...auth, accessToken: payload.accessToken, refreshToken: payload.refreshToken };
      setStoredAuth(nextAuth);
      resolveQueue(null, nextAuth.accessToken);

      originalRequest.headers.Authorization = `Bearer ${nextAuth.accessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosClient;