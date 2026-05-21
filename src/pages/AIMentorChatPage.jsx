import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, MessageSquare, User, RefreshCw, Copy, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../api/chatApi';
import { useApp } from '../context/AppContext';
import { CHAT_SUGGESTIONS } from '../utils/demoData';

// ── Quick-prompt suggestion chips shown on first load ────────────────────────
// Imported from demoData for single source of truth
const SUGGESTION_CHIPS = CHAT_SUGGESTIONS;

// ── Sidebar topic links ───────────────────────────────────────────────────────
const RECENT_TOPICS = [
  "Visa Interview Tips",
  "ASU vs UTD Comparison",
  "SOP Writing Guide",
  "GRE Prep Strategy",
];

const SAVED_UNIVERSITIES = [
  "Arizona State University",
  "Purdue University",
  "University of Toronto",
];

// ── Opening message shown on first load ──────────────────────────────────────
const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'model',
  text: "👋 Hi! I'm **NextDegree AI** — your personal study abroad mentor.\n\nI can help you with:\n• University comparisons and shortlisting\n• GRE, IELTS score requirements\n• Education loan and EMI planning\n• ROI analysis for studying abroad\n• SOP, LOR, and visa guidance\n\nWhat would you like to know today?",
  timestamp: new Date().toISOString(),
};

// ── Render text with basic markdown: **bold**, bullet points, newlines ────────
const FormattedText = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, i) => {
        // Convert **text** to bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        });

        // Bullet point lines
        if (line.startsWith('•') || line.startsWith('-')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-primary-400 mt-0.5 shrink-0">•</span>
              <span>{rendered.map((r, j) => (r.props?.children || r))}</span>
            </div>
          );
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
};

// ── Typing indicator (three bouncing dots) ────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-4 max-w-3xl">
    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
      <Sparkles className="h-4 w-4 text-primary-400" />
    </div>
    <div className="glass-card px-5 py-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  </div>
);

// ── Individual message bubble ─────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-3 max-w-3xl group ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
        isUser ? 'bg-white/10' : 'bg-gradient-to-tr from-primary-500 to-accent-500'
      }`}>
        {isUser
          ? <User className="h-4 w-4 text-gray-300" />
          : <Sparkles className="h-4 w-4 text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`relative flex flex-col gap-1 max-w-[80%]`}>
        <div className={`px-4 py-3 rounded-2xl text-sm ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-none'
            : 'glass-card text-gray-200 rounded-tl-none border border-white/5'
        }`}>
          {isUser
            ? <p className="leading-relaxed">{msg.text}</p>
            : <FormattedText text={msg.text} />
          }
        </div>

        {/* Timestamp + copy button */}
        <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
          {msg.timestamp && (
            <span className="text-xs text-gray-600">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AIMentorChatPage — Main Component
// ─────────────────────────────────────────────────────────────────────────────
const AIMentorChatPage = () => {
  const [messages,  setMessages]  = useState([WELCOME_MESSAGE]);
  const [input,     setInput]     = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const [error,     setError]     = useState('');
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Build Gemini-compatible chat history from current messages
  const buildHistory = useCallback(() => {
    return messages
      .filter((m) => m.id !== 'welcome')   // exclude welcome message (it's not from API)
      .map((m) => ({
        role: m.role,          // "user" or "model"
        text: m.text,
      }));
  }, [messages]);

  // ── Send message to backend ─────────────────────────────────────────────────
  const handleSend = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isTyping) return;

    const userMsg = {
      id:        Date.now(),
      role:      'user',
      text:      userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError('');

    try {
      const history = buildHistory();

      // Call backend POST /api/chat
      const data = await sendChatMessage(userText, history);

      const aiMsg = {
        id:        Date.now() + 1,
        role:      'model',
        text:      data.reply,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      let errText = 'Something went wrong. Please try again.';

      if (typeof detail === 'string') {
        errText = detail;
      } else if (detail?.message) {
        errText = detail.message;
      } else if (err?.response?.status === 429) {
        errText = 'API quota exceeded. Please wait a moment and try again.';
      } else if (!err?.response) {
        errText = 'Cannot connect to backend. Make sure the server is running on port 8000.';
      }

      setError(errText);

      // Show error as a system message in chat
      setMessages((prev) => [...prev, {
        id:        Date.now() + 1,
        role:      'model',
        text:      `⚠️ ${errText}`,
        timestamp: new Date().toISOString(),
        isError:   true,
      }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  // Handle suggestion chip click
  const handleChipClick = (chip) => {
    setInput(chip);
    handleSend(chip);
  };

  // Clear conversation
  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setError('');
    setInput('');
    inputRef.current?.focus();
  };

  const showChips = messages.length === 1;  // Only show chips on fresh chat

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-surface/30 shrink-0">
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-white text-sm font-medium transition-colors shadow-lg shadow-primary-500/20"
          >
            <MessageSquare className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
          {/* Recent Topics */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Recent Topics
            </h3>
            <div className="space-y-0.5">
              {RECENT_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleChipClick(topic)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors truncate"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Universities */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Saved Universities
            </h3>
            <div className="space-y-0.5">
              {SAVED_UNIVERSITIES.map((uni, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors truncate"
                >
                  {uni}
                </button>
              ))}
            </div>
          </div>

          {/* What I can help with */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-400 mb-2">I can help with:</p>
            <ul className="space-y-1 text-xs text-gray-500">
              {['University selection', 'GRE / IELTS prep', 'Education loans', 'ROI analysis', 'SOP guidance', 'Visa tips'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="text-primary-500">•</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">

        {/* Header */}
        <header className="px-6 py-3 border-b border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">NextDegree AI Mentor</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Online · Powered by Gemini
              </div>
            </div>
          </div>

          {/* New chat button (mobile) */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className="h-3 w-3" /> New Chat
          </button>
        </header>

        {/* ── Message List ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ─────────────────────────────────────────────── */}
        <div className="px-4 pb-4 pt-2 bg-background border-t border-white/5 shrink-0">
          <div className="max-w-4xl mx-auto">

            {/* Suggestion chips — only on fresh chat */}
            <AnimatePresence>
              {showChips && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-wrap gap-2 mb-3"
                >
                  {SUGGESTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-300 hover:bg-white/5 hover:border-primary-500/40 hover:text-white transition-all"
                    >
                      {chip}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text input */}
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize textarea
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything about your study abroad journey… (Enter to send, Shift+Enter for new line)"
                  className="w-full bg-surface border border-white/10 rounded-2xl pl-5 pr-4 py-3.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all shadow-lg resize-none overflow-hidden"
                  disabled={isTyping}
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-3 bg-primary-600 hover:bg-primary-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all shrink-0 shadow-lg shadow-primary-500/20"
              >
                {isTyping
                  ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send className="h-5 w-5" />
                }
              </button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-2">
              NextDegree AI can make mistakes. Always verify important decisions with official university sources.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIMentorChatPage;
