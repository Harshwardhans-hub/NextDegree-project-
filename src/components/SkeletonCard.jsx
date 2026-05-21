// ─────────────────────────────────────────────────────────────────────────────
// src/components/SkeletonCard.jsx — Loading skeleton placeholder components
//
// Usage:
//   import { SkeletonCard, SkeletonText, SkeletonChart } from './SkeletonCard';
//   {loading && <SkeletonCard />}
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

// Animated shimmer base
const Shimmer = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-white/5 rounded-lg ${className}`}
  />
);

// ── Generic card skeleton ─────────────────────────────────────────────────────
export const SkeletonCard = ({ lines = 3, className = '' }) => (
  <div className={`glass-card p-6 space-y-3 ${className}`}>
    <Shimmer className="h-4 w-2/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <Shimmer key={i} className={`h-3 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
    ))}
  </div>
);

// ── University recommendation card skeleton ───────────────────────────────────
export const SkeletonUniversityCard = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
      </div>
      {/* Score ring placeholder */}
      <Shimmer className="h-16 w-16 rounded-full shrink-0" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Shimmer className="h-8 rounded-lg" />
      <Shimmer className="h-8 rounded-lg" />
      <Shimmer className="h-8 rounded-lg" />
    </div>
    <Shimmer className="h-1.5 w-full rounded-full" />
  </div>
);

// ── Stat card skeleton ────────────────────────────────────────────────────────
export const SkeletonStatCard = () => (
  <div className="glass-card p-5 space-y-2">
    <Shimmer className="h-3 w-1/2" />
    <Shimmer className="h-7 w-3/4" />
    <Shimmer className="h-2 w-1/3" />
  </div>
);

// ── Chart area skeleton ───────────────────────────────────────────────────────
export const SkeletonChart = ({ height = 260 }) => (
  <div className="glass-card p-6 space-y-4">
    <Shimmer className="h-4 w-1/3" />
    <Shimmer className="h-3 w-1/2" />
    <div className="flex items-end gap-2" style={{ height }}>
      {[60, 80, 45, 90, 70, 55, 85, 65, 75, 50].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-white/5 animate-pulse rounded-t-md"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  </div>
);

// ── Chat message skeleton ─────────────────────────────────────────────────────
export const SkeletonChatMessage = ({ isUser = false }) => (
  <div className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
    <Shimmer className="h-8 w-8 rounded-full shrink-0" />
    <div className="space-y-1.5 flex-1">
      <Shimmer className={`h-10 rounded-2xl ${isUser ? 'w-2/3 ml-auto' : 'w-3/4'}`} />
    </div>
  </div>
);

export default SkeletonCard;
