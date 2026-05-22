import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getRecommendations } from '../api/recommendationApi';
import { useApp } from '../context/AppContext';
import {
  MapPin, DollarSign, TrendingUp, Award, ExternalLink,
  SlidersHorizontal, BookOpen, X, Loader2, SearchX, ArrowLeft,
  Info, AlertTriangle, RefreshCw,
} from 'lucide-react';

// ─── Country flag emoji helper ──────────────────────────────────────────────
const FLAG = { USA: '🇺🇸', Canada: '🇨🇦', UK: '🇬🇧', Australia: '🇦🇺', Germany: '🇩🇪' };

// ─── ROI badge colour ────────────────────────────────────────────────────────
const ROI_COLOUR = {
  Excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  High:      'bg-blue-500/10   text-blue-400   border-blue-500/20',
  Moderate:  'bg-amber-500/10  text-amber-400  border-amber-500/20',
};

// ─── Score colour ─────────────────────────────────────────────────────────────
const scoreColour = (s) =>
  s >= 80 ? '#10B981' : s >= 60 ? '#3B82F6' : s >= 40 ? '#F59E0B' : '#EF4444';

// ─── Score label ──────────────────────────────────────────────────────────────
const scoreLabel = (s) =>
  s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Low';

// ─── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.06 }}
    className="glass-card overflow-hidden"
  >
    <div className="h-1.5 w-full bg-white/5" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
      </div>
      <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
      <div className="h-8 bg-white/5 rounded-full animate-pulse" />
    </div>
  </motion.div>
);

// ─── University Card ──────────────────────────────────────────────────────────
const UniCard = ({ uni, index, onAnalyze }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.4 }}
    className="glass-card overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300"
  >
    {/* Score colour bar */}
    <div
      className="h-1.5 w-full shrink-0"
      style={{ background: `linear-gradient(90deg, ${scoreColour(uni.match_score)}, transparent)` }}
    />

    <div className="p-6 flex flex-col flex-grow gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-medium">
            {FLAG[uni.country] ?? '🌐'} {uni.country}
          </p>
          <h3 className="text-lg font-bold text-white leading-snug">
            {uni.university_name}
          </h3>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {uni.course}
          </p>
        </div>

        {/* Score ring */}
        <div className="shrink-0 relative w-14 h-14">
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1A2235" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={scoreColour(uni.match_score)} strokeWidth="3"
              strokeDasharray={`${uni.match_score} ${100 - uni.match_score}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            {uni.match_score}%
          </span>
        </div>
      </div>

      {/* Match quality badge */}
      <div
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full self-start border"
        style={{
          color: scoreColour(uni.match_score),
          borderColor: `${scoreColour(uni.match_score)}40`,
          background: `${scoreColour(uni.match_score)}10`,
        }}
      >
        {scoreLabel(uni.match_score)} match
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3" /> Tuition / yr
          </p>
          <p className="font-bold text-white text-sm">{uni.tuition_fees}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
            <TrendingUp className="h-3 w-3" /> Avg Salary
          </p>
          <p className="font-bold text-primary-400 text-sm">{uni.avg_salary}</p>
        </div>
      </div>

      {/* Recommendation reason */}
      {uni.recommendation_reason && (
        <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-lg p-3 mt-auto">
          <Info className="h-3.5 w-3.5 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {uni.recommendation_reason}
          </p>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${ROI_COLOUR[uni.roi_rating] ?? ROI_COLOUR.Moderate}`}>
          <Award className="h-3 w-3" />
          ROI: {uni.roi_rating}
        </span>
        <button
          onClick={() => onAnalyze(uni)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-500 text-background transition-colors shadow-md shadow-primary-500/20"
        >
          Analyze ROI <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ hasProfile }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center">
    <SearchX className="h-16 w-16 text-gray-600" />
    <h3 className="text-xl font-semibold text-gray-300">No universities matched</h3>
    <p className="text-gray-500 text-sm max-w-sm">
      {hasProfile
        ? 'No universities matched your current filters. Try widening your budget, adjusting GRE expectations, or selecting a different country.'
        : 'Submit your profile first so we can generate personalised recommendations for you.'}
    </p>
    <Link
      to="/profile"
      className="mt-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors"
    >
      {hasProfile ? 'Update Profile' : 'Complete Profile'}
    </Link>
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────
const ErrorState = ({ onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center">
    <AlertTriangle className="h-16 w-16 text-amber-500/60" />
    <h3 className="text-xl font-semibold text-gray-300">Could not load recommendations</h3>
    <p className="text-gray-500 text-sm max-w-sm">
      The backend server appears to be offline. Start the FastAPI server on port 8000, then retry.
    </p>
    <button
      onClick={onRetry}
      className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors"
    >
      <RefreshCw className="h-4 w-4" /> Retry
    </button>
  </div>
);

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl px-4 py-2 text-xs text-white shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }}>
          {p.name}: ₹{p.value}L
        </p>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const UniversityRecommendationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recommendations: ctxRecs, userProfile, setRecommendations } = useApp();

  const [allResults,    setAllResults]    = useState([]);
  const [filtered,      setFiltered]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [apiError,      setApiError]      = useState(false);
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterROI,     setFilterROI]     = useState('All');
  const [filterBudget,  setFilterBudget]  = useState('All');
  const [showFilters,   setShowFilters]   = useState(false);

  const navState = location.state;

  // ── Fetch recommendations ─────────────────────────────────────────────────
  const fetchRecs = async (profile) => {
    setLoading(true);
    setApiError(false);

    const payload = {
      cgpa:              profile.cgpa,
      gre_score:         profile.gre_score,
      budget:            profile.budget,
      preferred_country: profile.preferred_country,
      course_interest:   profile.course_interest,
    };



    try {
      const data = await getRecommendations(payload);

      setAllResults(data);
      setFiltered(data);
      setRecommendations(data);
    } catch (err) {

      setApiError(true);
      setAllResults([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Priority 1: Came directly from profile form (router state has fresh recs)
    if (navState?.recommendations?.length) {

      setAllResults(navState.recommendations);
      setFiltered(navState.recommendations);
      return;
    }

    // Priority 2: Recommendations already in global context
    if (ctxRecs?.length) {

      setAllResults(ctxRecs);
      setFiltered(ctxRecs);
      return;
    }

    // Priority 3: Profile exists in context — fetch fresh recommendations
    if (userProfile) {

      fetchRecs(userProfile);
      return;
    }

    // Priority 4: No profile at all — show empty state directing user to profile

  }, []);

  // ── Apply local filters ───────────────────────────────────────────────────
  useEffect(() => {
    let out = [...allResults];
    if (filterCountry !== 'All') out = out.filter((u) => u.country === filterCountry);
    if (filterROI !== 'All')     out = out.filter((u) => u.roi_rating === filterROI);
    if (filterBudget !== 'All') {
      const max = parseInt(filterBudget);
      out = out.filter((u) => u.tuition_raw <= max);
    }
    setFiltered(out);
  }, [filterCountry, filterROI, filterBudget, allResults]);

  const countries = ['All', ...new Set(allResults.map((u) => u.country))];

  // Analytics
  const barData = filtered.slice(0, 6).map((u) => ({
    name:    u.university_name.split(' ').slice(0, 2).join(' '),
    Tuition: Math.round(u.tuition_raw / 100000),
    Salary:  Math.round(u.salary_raw  / 100000),
  }));

  const profileName = navState?.profile?.full_name ?? userProfile?.full_name;
  const hasProfile  = !!(navState?.profile || userProfile);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            {navState && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-3 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Profile
              </button>
            )}
            <h1 className="text-3xl font-bold text-white">Top University Matches</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {loading
                ? 'Analyzing your profile…'
                : profileName
                  ? `Personalised for ${profileName} · ${filtered.length} matches found`
                  : `${filtered.length} universities matched`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Re-fetch button (only when profile is available) */}
            {hasProfile && !loading && (
              <button
                onClick={() => fetchRecs(navState?.profile ?? userProfile)}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {(filterCountry !== 'All' || filterROI !== 'All' || filterBudget !== 'All') && (
                <span className="w-2 h-2 rounded-full bg-primary-400" />
              )}
            </button>
            {(filterCountry !== 'All' || filterROI !== 'All' || filterBudget !== 'All') && (
              <button
                onClick={() => { setFilterCountry('All'); setFilterROI('All'); setFilterBudget('All'); }}
                className="flex items-center gap-1 px-3 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Filter bar ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="glass-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">Country</label>
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    {countries.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">ROI Rating</label>
                  <select
                    value={filterROI}
                    onChange={(e) => setFilterROI(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    {['All', 'Excellent', 'High', 'Moderate'].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">Max Tuition (₹L/yr)</label>
                  <select
                    value={filterBudget}
                    onChange={(e) => setFilterBudget(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="All">Any</option>
                    <option value="2000000">Up to ₹20L</option>
                    <option value="3000000">Up to ₹30L</option>
                    <option value="4000000">Up to ₹40L</option>
                    <option value="6000000">Up to ₹60L</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cards grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)
            : apiError
              ? <ErrorState onRetry={() => fetchRecs(navState?.profile ?? userProfile)} />
              : filtered.length > 0
                ? filtered.map((uni, i) => (
                    <UniCard
                      key={`${uni.university_name}-${i}`}
                      uni={uni}
                      onAnalyze={(u) => navigate('/roi-analysis', { state: { university: u } })}
                    />
                  ))
                : <EmptyState hasProfile={hasProfile} />}
        </div>

        {/* ── Analytics section ──────────────────────────────────────────────── */}
        {!loading && !apiError && filtered.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Analytics Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Tuition vs Salary Bar Chart */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-1">Tuition vs Avg Salary (₹L)</h3>
                <p className="text-xs text-gray-500 mb-6">Top matched universities comparison</p>
                <div className="w-full h-64 min-h-[256px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} unit="L" />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="Tuition" fill="var(--chart-accent)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Salary"  fill="var(--chart-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 justify-center mt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--chart-accent)' }} /> Tuition / yr
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--chart-primary)' }} /> Avg Salary
                  </div>
                </div>
              </div>

              {/* Match Score Distribution */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-1">Match Score Distribution</h3>
                <p className="text-xs text-gray-500 mb-6">How well each university fits your profile</p>
                <div className="space-y-3 mt-2">
                  {filtered.slice(0, 8).map((uni, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-32 truncate shrink-0">
                        {uni.university_name.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uni.match_score}%` }}
                          transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: scoreColour(uni.match_score) }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-10 text-right shrink-0">
                        {uni.match_score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Universities Matched', value: filtered.length },
                { label: 'Best Match Score',     value: `${Math.max(...filtered.map(u => u.match_score))}%` },
                { label: 'Lowest Tuition',        value: `₹${Math.min(...filtered.map(u => u.tuition_raw / 100000)).toFixed(0)}L` },
                { label: 'Highest Avg Salary',    value: `₹${Math.max(...filtered.map(u => u.salary_raw  / 100000)).toFixed(0)}L` },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-5 text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default UniversityRecommendationPage;
