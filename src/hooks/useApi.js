// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useApi.js — Reusable async data-fetching hook
//
// Provides a clean pattern for API calls with automatic:
//   - loading state
//   - error state (normalised from axiosInstance interceptor)
//   - data state
//   - manual re-trigger via execute()
//
// Usage:
//   const { execute, data, loading, error } = useApi(getRoiAnalysis);
//   <button onClick={() => execute({ tuition_fees: 2800000, ... })}>Calculate</button>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

/**
 * @param {Function} apiFn - An async function that calls the backend
 * @param {object}   options
 * @param {Function} options.onSuccess - Called with (data) on success
 * @param {Function} options.onError   - Called with (error) on failure
 */
const useApi = (apiFn, { onSuccess, onError } = {}) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFn(...args);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const msg = err.userMessage || 'Something went wrong. Please try again.';
      setError(msg);
      onError?.(err, msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError('');
    setLoading(false);
  }, []);

  return { execute, data, loading, error, reset };
};

export default useApi;
