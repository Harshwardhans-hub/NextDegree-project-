// ─────────────────────────────────────────────────────────────────────────────
// src/components/BackendStatus.jsx
// Small pill indicator shown in the Navbar when backend is offline
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useApp } from '../context/AppContext';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const BackendStatus = () => {
  const { backendOnline, pingBackend } = useApp();

  if (backendOnline === null) {
    // Still checking
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-500 px-2 py-1 rounded-full border border-white/5">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">Connecting…</span>
      </div>
    );
  }

  if (backendOnline) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="hidden sm:inline">Backend live</span>
      </div>
    );
  }

  return (
    <button
      onClick={pingBackend}
      className="flex items-center gap-1.5 text-xs text-red-400 px-2 py-1 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"
      title="Backend offline — click to retry"
    >
      <WifiOff className="h-3 w-3" />
      <span className="hidden sm:inline">Backend offline</span>
    </button>
  );
};

export default BackendStatus;
