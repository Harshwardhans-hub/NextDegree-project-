// ─────────────────────────────────────────────────────────────────────────────
// src/api/profileApi.js — Profile & Recommendations API
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from './axiosInstance';

/** Save student profile to SQLite via POST /api/profile */
export const submitProfile = async (profileData) => {
  const { data } = await axiosInstance.post('/profile/', profileData);
  return data;
};

/** Fetch all saved profiles via GET /api/profile/all */
export const getAllProfiles = async () => {
  const { data } = await axiosInstance.get('/profile/all');
  return data;
};

/** Get university recommendations via POST /api/recommend */
export const getRecommendations = async (profileData) => {
  const { data } = await axiosInstance.post('/recommend/', profileData);
  return data;
};
