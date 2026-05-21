// ─────────────────────────────────────────────────────────────────────────────
// src/api/roiApi.js — ROI Analysis API
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from './axiosInstance';

/**
 * Calculate Return on Investment for a study abroad decision.
 *
 * @param {object} roiData - { tuition_fees, living_cost, visa_cost, expected_salary }
 * @returns {Promise<object>} - { total_cost, roi_percentage, break_even_years, roi_category, cost_breakdown, salary_projection, ... }
 */
export const getRoiAnalysis = async (roiData) => {
  const { data } = await axiosInstance.post('/roi/', roiData);
  return data;
};
