import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getEmiCalculation } from '../api/emiApi';
import { useApp } from '../context/AppContext';
import {
  Calculator, Landmark, Loader2, AlertTriangle, CheckCircle,
  TrendingUp, DollarSign, Clock, Zap, Info, ChevronRight,
  ShieldCheck, BarChart2, PieChart as PieIcon, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Colour config ─────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#f59e0b'];
const INSIGHT_COLOR = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  blue:    'text-blue-400    bg-blue-500/10    border-blue-500/20',
  amber:   'text-amber-400   bg-amber-500/10   border-amber-500/20',
  red:     'text-red-400     bg-red-500/10     border-red-500/20',
};
const INSIGHT_ICON = {
  'check-circle': CheckCircle,
  'trending-up':  TrendingUp,
  'dollar-sign':  DollarSign,
  'alert-circle': AlertTriangle,
  'clock':        Clock,
  'zap':          Zap,
};

// ─── Bank metadata ─────────────────────────────────────────────────────────────
const BANK_META = {
  'State Bank of India':    { abbr: 'SBI',    speed: 'Fast',   speedColor: 'text-emerald-400', fee: '0.5%' },
  'Punjab National Bank':   { abbr: 'PNB',    speed: 'Medium', speedColor: 'text-blue-400',    fee: '1.0%' },
  'Bank of Baroda':         { abbr: 'BoB',    speed: 'Fast',   speedColor: 'text-emerald-400', fee: '0.5%' },
  'Axis Bank':              { abbr: 'AXIS',   speed: 'Instant',speedColor: 'text-purple-400',  fee: '1.5%' },
  'HDFC Credila':           { abbr: 'HDFC',   speed: 'Fast',   speedColor: 'text-emerald-400', fee: '1.0%' },
  'Avanse Financial':       { abbr: 'AVN',    speed: 'Medium', speedColor: 'text-blue-400',    fee: '2.0%' },
};

// ─── Eligibility engine (client-side, instant) ─────────────────────────────────
const computeEligibility = (income, loanAmount, monthlyEmi) => {
  if (!income || income <= 0) return null;
  const monthlyIncome = income / 12;
  const emiToIncome   = monthlyEmi / monthlyIncome;
  const maxLoan       = income * 10;  // rule of thumb: 10x annual income
  const canCover      = loanAmount <= maxLoan;

  let label, color, prob, advice;
  if (income >= 1500000 && emiToIncome <= 0.4) {
    label = 'High'; color = 'emerald'; prob = 92;
    advice = 'Your income strongly supports this loan. Govt. banks like SBI offer best rates.';
  } else if (income >= 800000 && emiToIncome <= 0.55) {
    label = 'Medium'; color = 'blue'; prob = 72;
    advice = 'Approval likely with a co-applicant (parent). Consider reducing loan amount slightly.';
  } else if (income >= 400000) {
    label = 'Low'; color = 'amber'; prob = 48;
    advice = 'Apply with collateral or a strong co-borrower. Government schemes may help.';
  } else {
    label = 'Very Low'; color = 'red'; prob = 22;
    advice = 'Explore scholarships and partial funding first. Government grants may cover up to 50%.';
  }

  return { label, color, prob, advice, emiToIncome: (emiToIncome * 100).toFixed(1), canCover };
};

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl px-4 py-2 text-xs text-white shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }}>
          {p.name}: ₹{(p.value / 100000).toFixed(1)}L
        </p>
      ))}
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, cls = 'text-white', loading }) => (
  <div className="glass-card p-5">
    {loading ? (
      <div className="space-y-2 animate-pulse">
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-6 w-24 bg-white/10 rounded" />
        <div className="h-2 w-28 bg-white/5 rounded" />
      </div>
    ) : (
      <>
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{label}</p>
        <p className={`text-xl font-bold ${cls}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </>
    )}
  </div>
);

// ─── Insight Card ──────────────────────────────────────────────────────────────
const InsightCard = ({ insight, index }) => {
  const Icon     = INSIGHT_ICON[insight.icon] ?? Info;
  const colorCls = INSIGHT_COLOR[insight.color] ?? INSIGHT_COLOR.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4"
    >
      <div className={`p-2 rounded-lg border ${colorCls} shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-0.5">{insight.title}</p>
        <p className="text-xs text-gray-400 leading-relaxed">{insight.body}</p>
      </div>
    </motion.div>
  );
};

// ─── Slider + Input Pair ───────────────────────────────────────────────────────
const SliderField = ({ label, value, min, max, step, onChange, display, hint }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-400">{label}</label>
      <span className="text-sm font-bold text-white">{display}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-500"
    />
    <div className="flex justify-between text-[10px] text-gray-600">
      <span>{hint?.min}</span><span>{hint?.max}</span>
    </div>
  </div>
);

// ─── Eligibility Badge ─────────────────────────────────────────────────────────
const EligibilityPanel = ({ eligibility, monthlyEmi }) => {
  if (!eligibility) return null;
  const barColor = {
    emerald: '#10B981', blue: '#3B82F6', amber: '#F59E0B', red: '#EF4444',
  }[eligibility.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary-400" />
          <h3 className="text-base font-semibold text-white">Loan Eligibility</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border
          ${eligibility.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            eligibility.color === 'blue'    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
            eligibility.color === 'amber'   ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                              'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {eligibility.label} Chance
        </span>
      </div>

      {/* Approval probability bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Approval Probability</span>
          <span className="font-bold text-white">{eligibility.prob}%</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${eligibility.prob}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: barColor }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">EMI-to-Income</p>
          <p className={`text-lg font-bold ${parseFloat(eligibility.emiToIncome) <= 40 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {eligibility.emiToIncome}%
          </p>
          <p className="text-[10px] text-gray-600">ideal ≤ 40%</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Loan Feasibility</p>
          <p className={`text-lg font-bold ${eligibility.canCover ? 'text-emerald-400' : 'text-amber-400'}`}>
            {eligibility.canCover ? 'Feasible' : 'Stretch'}
          </p>
          <p className="text-[10px] text-gray-600">vs income × 10</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
        <p className="text-xs text-gray-400 leading-relaxed">{eligibility.advice}</p>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Loan Estimator Page
// ─────────────────────────────────────────────────────────────────────────────
const LoanEstimatorPage = () => {
  const { roiResult } = useApp();

  // Pre-fill loan amount from ROI if available
  const prefilledLoan = roiResult?.total_cost
    ? Math.round(roiResult.total_cost * 0.8)  // assume 80% loan coverage
    : 2500000;

  const [loan_amount,    setLoanAmount]    = useState(prefilledLoan);
  const [interest_rate,  setInterestRate]  = useState(10.5);
  const [duration_years, setDurationYears] = useState(10);
  const [family_income,  setFamilyIncome]  = useState(1200000);

  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState('breakdown'); // breakdown | amortization | timeline

  // Auto-calculate with 400ms debounce on any slider change
  const fetchEmi = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getEmiCalculation({ loan_amount, interest_rate, duration_years });

      setResult(data);
    } catch (err) {
      const msg = err?.response?.data?.detail;
      const errText = Array.isArray(msg)
        ? msg.map((e) => e.msg).join(', ')
        : (typeof msg === 'object' && msg?.messages)
          ? msg.messages.join(', ')
          : 'Backend unavailable. Make sure the server is running on port 8000.';
      setError(errText);
      toast.error('EMI calculation failed.');
    } finally {
      setLoading(false);
    }
  }, [loan_amount, interest_rate, duration_years]);

  useEffect(() => {
    const t = setTimeout(fetchEmi, 400);
    return () => clearTimeout(t);
  }, [fetchEmi]);

  // Client-side eligibility (instant, no API needed)
  const eligibility = result
    ? computeEligibility(family_income, loan_amount, result.monthly_emi)
    : null;

  const fmt = (v) => v >= 10000000
    ? `₹${(v / 10000000).toFixed(1)}Cr`
    : `₹${(v / 100000).toFixed(1)}L`;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Loan Estimator</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Adjust the sliders to calculate your monthly EMI and full repayment schedule in real-time.
          {roiResult && (
            <span className="ml-2 text-primary-400 text-xs">
              ✦ Pre-filled from your ROI analysis
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

        {/* ── Left: Slider Control Panel ──────────────────────────────────── */}
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-7 sticky top-24">
            <h2 className="text-base font-semibold text-white border-b border-white/10 pb-3">
              Loan Parameters
            </h2>

            <SliderField
              label="Loan Amount"
              value={loan_amount}
              min={500000} max={15000000} step={100000}
              onChange={setLoanAmount}
              display={fmt(loan_amount)}
              hint={{ min: '₹5L', max: '₹150L' }}
            />

            <SliderField
              label="Interest Rate"
              value={interest_rate}
              min={7} max={18} step={0.5}
              onChange={setInterestRate}
              display={`${interest_rate}% p.a.`}
              hint={{ min: '7%', max: '18%' }}
            />

            <SliderField
              label="Loan Duration"
              value={duration_years}
              min={1} max={20} step={1}
              onChange={setDurationYears}
              display={`${duration_years} years`}
              hint={{ min: '1 yr', max: '20 yrs' }}
            />

            {/* Family Income */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Family Annual Income</label>
                <span className="text-sm font-bold text-white">{fmt(family_income)}</span>
              </div>
              <input
                type="range" min={200000} max={5000000} step={100000}
                value={family_income}
                onChange={(e) => setFamilyIncome(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>₹2L</span><span>₹50L</span>
              </div>
              <p className="text-[10px] text-gray-600">Used to calculate loan eligibility</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Live mini-summary */}
            {result && (
              <div className="border-t border-white/10 pt-5 space-y-3">
                {[
                  { label: 'Monthly EMI',     value: result.monthly_emi_fmt,     cls: 'text-primary-400' },
                  { label: 'Total Repayment', value: result.total_repayment_fmt, cls: 'text-white' },
                  { label: 'Total Interest',  value: result.total_interest_fmt,  cls: 'text-amber-400' },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{s.label}</span>
                    <span className={`font-bold ${s.cls}`}>
                      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : s.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Formula box */}
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p className="text-gray-400 font-medium mb-1">EMI Formula:</p>
              <p>EMI = [P × R × (1+R)^N]</p>
              <p className="pl-6">÷ [(1+R)^N − 1]</p>
              <p className="mt-1 text-gray-600">R = rate/12/100 · N = months</p>
            </div>
          </div>
        </div>

        {/* ── Right: Results ───────────────────────────────────────────────── */}
        <div className="space-y-6 min-w-0">

          {/* Initial loading spinner (no result yet) */}
          {!result && loading && (
            <div className="glass-card p-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-primary-400 animate-spin" />
              <p className="text-gray-400 text-sm">Calculating EMI…</p>
            </div>
          )}

          {/* ── EMI Hero Banner ───────────────────────────────────────────── */}
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  Monthly EMI
                  {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                </p>
                <p className="text-5xl font-black text-white">
                  {loading ? '…' : result.monthly_emi_fmt}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {result.loan_summary?.duration} @ {result.loan_summary?.interest_rate} p.a.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Principal</p>
                  <p className="font-bold text-white">{result.loan_amount_fmt}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Interest</p>
                  <p className="font-bold text-amber-400">{result.total_interest_fmt}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Summary Cards ─────────────────────────────────────────────── */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Monthly EMI"     value={result.monthly_emi_fmt}     cls="text-primary-400"  loading={loading} />
              <StatCard label="Total Repayment" value={result.total_repayment_fmt} loading={loading} />
              <StatCard label="Total Interest"  value={result.total_interest_fmt}  cls="text-amber-400"    loading={loading} sub="extra you pay" />
              <StatCard label="Interest Share"  value={result.loan_summary?.interest_pct} cls="text-red-400" loading={loading} sub="of loan amount" />
            </div>
          )}

          {/* ── Eligibility Panel ─────────────────────────────────────────── */}
          {result && <EligibilityPanel eligibility={eligibility} monthlyEmi={result.monthly_emi} />}

          {/* ── Chart Tab Bar ─────────────────────────────────────────────── */}
          {result && (
            <div className="flex gap-2 border-b border-white/10">
              {[
                { key: 'breakdown',    label: 'Principal vs Interest', icon: PieIcon },
                { key: 'amortization', label: 'Year-wise Breakdown',   icon: BarChart2 },
                { key: 'timeline',     label: 'Balance Over Time',     icon: TrendingUp },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px
                    ${activeTab === key
                      ? 'text-white border-primary-500 bg-white/5'
                      : 'text-gray-400 border-transparent hover:text-white'}`}
                >
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
          )}

          {/* ── Principal vs Interest Pie ──────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {result && activeTab === 'breakdown' && (
              <motion.div key="breakdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-base font-semibold text-white mb-1">Principal vs Interest</h3>
                <p className="text-xs text-gray-500 mb-6">How your total repayment is split</p>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-[220px] h-[220px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={result.repayment_breakdown} cx="50%" cy="50%"
                          innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {result.repayment_breakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4 flex-1 w-full">
                    {result.repayment_breakdown.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: PIE_COLORS[i] }} />
                            <span className="text-gray-300">{item.name}</span>
                          </div>
                          <span className="font-bold text-white">{item.label}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="h-full rounded-full" style={{ background: PIE_COLORS[i] }} />
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 text-right">{item.percentage}%</p>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-3 flex justify-between text-sm">
                      <span className="text-gray-400">Total Repayment</span>
                      <span className="font-bold text-primary-400">{result.total_repayment_fmt}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Year-wise Amortization Bar Chart ──────────────────────────── */}
            {result && activeTab === 'amortization' && result.amortization?.length > 0 && (
              <motion.div key="amortization" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-base font-semibold text-white mb-1">Year-wise Repayment Breakdown</h3>
                <p className="text-xs text-gray-500 mb-6">How your EMI is split between principal and interest each year</p>
                <div className="w-full h-72 min-h-[288px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.amortization} barSize={14} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                        tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Legend formatter={(v) => v} />
                      <Bar dataKey="Principal" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" />
                      <Bar dataKey="Interest"  fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* ── Remaining Balance Line Chart ───────────────────────────────── */}
            {result && activeTab === 'timeline' && result.repayment_timeline?.length > 0 && (
              <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-base font-semibold text-white mb-1">Remaining Balance Over Time</h3>
                <p className="text-xs text-gray-500 mb-6">How your outstanding loan balance reduces year by year</p>
                <div className="w-full h-64 min-h-[256px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.repayment_timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                        tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="balance" name="Balance" stroke="#6366f1"
                        strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="paid" name="Paid So Far" stroke="#10b981"
                        strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Purple = outstanding balance · Green dashed = total paid so far
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Smart Loan Insights ────────────────────────────────────────── */}
          {result?.loan_insights?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-4">Financial Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.loan_insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* ── Bank Recommendation Cards ──────────────────────────────────── */}
          {result?.bank_suggestions && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-primary-400" />
                  <div>
                    <h3 className="text-base font-semibold text-white">Bank Loan Options</h3>
                    <p className="text-xs text-gray-500">
                      Highlighted = matches your selected rate ±1.5%
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.bank_suggestions.map((bank, i) => {
                  const meta = BANK_META[bank.bank] ?? { abbr: '?', speed: 'Medium', speedColor: 'text-gray-400', fee: '—' };
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all
                        ${bank.recommended
                          ? 'border-primary-500/40 bg-primary-500/5'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5'}`}
                    >
                      {bank.recommended && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded-full border border-primary-500/30">
                          Best match
                        </span>
                      )}
                      {/* Bank avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0
                        ${bank.recommended ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-gray-400'}`}>
                        {meta.abbr}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{bank.bank}</p>
                        <p className="text-[11px] text-gray-500 truncate">{bank.note}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-gray-500">Fee: {meta.fee}</span>
                          <span className={`text-[10px] font-medium ${meta.speedColor}`}>
                            ● {meta.speed} approval
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${bank.recommended ? 'text-primary-400' : 'text-white'}`}>
                          {bank.rate}
                        </p>
                        <p className="text-[10px] text-gray-500">max {bank.max_loan}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoanEstimatorPage;
