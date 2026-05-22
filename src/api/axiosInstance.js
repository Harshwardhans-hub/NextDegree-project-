// ─────────────────────────────────────────────────────────────────────────────
// src/api/axiosInstance.js — Shared Axios configuration for all API calls
//
// Features:
//   - Base URL pointing to FastAPI backend (port 8000)
//   - 15-second request timeout
//   - Request interceptor: logs outgoing requests in dev mode
//   - Response interceptor: normalises error messages from FastAPI/Pydantic
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://nextdegree-backend.onrender.com/api' : 'http://127.0.0.1:8000/api'),
  timeout: 15000,                        // 15 seconds before timeout error
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {

    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  // Success: pass through unchanged
  (response) => response,

  // Error: extract a clean human-readable message
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.userMessage =
        'Request timed out. The backend may be slow — please try again.';
      return Promise.reject(error);
    }

    if (!error.response) {
      error.userMessage =
        'Cannot connect to the backend. Make sure the server is running on port 8000.';
      return Promise.reject(error);
    }

    const detail = error.response?.data?.detail;

    if (typeof detail === 'string') {
      error.userMessage = detail;
    } else if (Array.isArray(detail)) {
      // Pydantic validation errors: [{ loc, msg, type }]
      error.userMessage = detail
        .map((e) => `${e.loc?.slice(-1)[0] ?? 'field'}: ${e.msg}`)
        .join(' · ');
    } else if (detail?.messages) {
      error.userMessage = detail.messages.join(', ');
    } else if (detail?.message) {
      error.userMessage = detail.message;
    } else {
      error.userMessage = `Server error (${error.response.status}). Please try again.`;
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
