// ─────────────────────────────────────────────────────────────────────────────
// src/api/chatApi.js — AI Mentor Chat API
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from './axiosInstance';

/**
 * Send a message to the NextDegree AI Mentor (Gemini-powered).
 *
 * @param {string} message - The student's question
 * @param {Array}  chatHistory - Prior conversation turns [{ role, text }]
 * @returns {Promise<object>} - { reply, message, timestamp }
 */
export const sendChatMessage = async (message, chatHistory = []) => {
  const { data } = await axiosInstance.post('/chat/', {
    message,
    chat_history: chatHistory,
  });
  return data;
};

/**
 * Fetch the in-memory chat log (last 50 messages).
 * @returns {Promise<object>} - { count, messages }
 */
export const getChatHistory = async () => {
  const { data } = await axiosInstance.get('/chat/history');
  return data;
};
