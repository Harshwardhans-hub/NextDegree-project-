// ─────────────────────────────────────────────────────────────────────────────
// src/context/AppContext.jsx — Global State Management for NextDegree AI
//
// Stores across all pages (survives navigation):
//   - userProfile     : submitted student profile data
//   - recommendations : university matches from /api/recommend
//   - roiResult       : ROI analysis result from /api/roi
//   - emiResult       : EMI calculation result from /api/emi
//   - chatHistory     : full conversation history for AI Mentor
//   - backendOnline   : whether the FastAPI server is reachable
//
// Usage:
//   import { useApp } from '../context/AppContext';
//   const { userProfile, setUserProfile } = useApp();
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

// Create the context
const AppContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// AppProvider — wraps the entire app in App.jsx
// ─────────────────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }) => {

  // ── Student profile (set after ProfileFormPage submit) ───────────────────
  const [userProfile, setUserProfile] = useState(() => {
    // Persist across page refresh using sessionStorage
    try {
      const saved = sessionStorage.getItem('nd_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── University recommendations (set after profile submit) ─────────────────
  const [recommendations, setRecommendations] = useState(() => {
    try {
      const saved = sessionStorage.getItem('nd_recommendations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── ROI Analysis result ───────────────────────────────────────────────────
  const [roiResult, setRoiResult] = useState(null);

  // ── EMI Calculation result ────────────────────────────────────────────────
  const [emiResult, setEmiResult] = useState(null);

  // ── AI Mentor chat history (multi-turn context for Gemini) ───────────────
  const [chatHistory, setChatHistory] = useState([]);

  // ── Backend health status ─────────────────────────────────────────────────
  const [backendOnline, setBackendOnline] = useState(null); // null = checking

  // ── Persist profile and recommendations to sessionStorage ─────────────────
  useEffect(() => {
    if (userProfile) {
      sessionStorage.setItem('nd_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    if (recommendations.length) {
      sessionStorage.setItem('nd_recommendations', JSON.stringify(recommendations));
    }
  }, [recommendations]);

  // ── Backend health ping on mount ──────────────────────────────────────────
  const pingBackend = useCallback(async () => {
    try {
      await axiosInstance.get('/../');  // GET http://127.0.0.1:8000/
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    pingBackend();
    // Re-check every 30 seconds
    const id = setInterval(pingBackend, 30000);
    return () => clearInterval(id);
  }, [pingBackend]);

  // ── Clear all stored state (e.g. on logout) ───────────────────────────────
  const clearAppState = () => {
    setUserProfile(null);
    setRecommendations([]);
    setRoiResult(null);
    setEmiResult(null);
    setChatHistory([]);
    sessionStorage.removeItem('nd_profile');
    sessionStorage.removeItem('nd_recommendations');
  };

  const value = {
    // State
    userProfile,
    recommendations,
    roiResult,
    emiResult,
    chatHistory,
    backendOnline,

    // Setters
    setUserProfile,
    setRecommendations,
    setRoiResult,
    setEmiResult,
    setChatHistory,

    // Helpers
    clearAppState,
    pingBackend,

    // Derived
    hasProfile:          !!userProfile,
    hasRecommendations:  recommendations.length > 0,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// useApp — hook for consuming AppContext in any component
// ─────────────────────────────────────────────────────────────────────────────
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside <AppProvider>');
  }
  return ctx;
};

export default AppContext;
