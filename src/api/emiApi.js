// ─────────────────────────────────────────────────────────────────────────────
// src/api/emiApi.js — EMI Calculator API
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from './axiosInstance';

/**
 * Calculate monthly EMI and full repayment breakdown.
 *
 * @param {object} emiData - { loan_amount, interest_rate, duration_years }
 * @returns {Promise<object>} - { monthly_emi, total_repayment, total_interest, amortization, bank_suggestions, ... }
 */
export const getEmiCalculation = async (emiData) => {
  const { data } = await axiosInstance.post('/emi/', emiData);
  return data;
};
