// ─────────────────────────────────────────────────────────────────────────────
// src/api/recommendationApi.js — University Recommendation API
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from './axiosInstance';

/**
 * Get university recommendations for a student profile.
 *
 * @param {object} profileData - { cgpa, gre_score, budget, preferred_country, course_interest }
 * @returns {Promise<Array>} - Array of university recommendation objects
 */
export const getRecommendations = async (profileData) => {
  const { data } = await axiosInstance.post('/recommend/', profileData);
  return data;
};
