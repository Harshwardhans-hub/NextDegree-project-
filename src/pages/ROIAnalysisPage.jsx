import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend,
} from 'recharts';
import { getRoiAnalysis } from '../api/roiApi';
import { useApp } from '../context/AppContext';
import {
  TrendingUp, Loader2, AlertTriangle, ArrowLeft,
  Home, DollarSign, Zap, Clock, CheckCircle,
  GitCompare, X, RefreshCw, Info, BarChart2, PieChart as PieIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Colour Maps ───────────────────────────────────────────────────────────────
const PIE_COLORS = ['var(--chart-primary)', 'var(--chart-accent)', 'var(--chart-tertiary)'];

const CATEGORY_STYLE = {
  Excellent: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', bar: '#10B981' },
  Good:      { text: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',       bar: '#3B82F6' },
  Average:   { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     bar: '#F59E0B' },
  Low:       { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         bar: '#EF4444' },
};

const INSIGHT_ICON = {
  'trending-up':  TrendingUp,
  'clock':        Clock,
  'home':         Home,
  'dollar-sign':  DollarSign,
  'zap':          Zap,
  'alert-circle': AlertTriangle,
  'check':        CheckCircle,
};

const INSIGHT_COLOR = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  blue:    'text-blue-400    bg-blue-500/10    border-blue-500/20',
  amber:   'text-amber-400   bg-amber-500/10   border-amber-500/20',
  red:     'text-red-400     bg-red-500/10     border-red-500/20',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const defaultForm = (uni) => ({
  tuition_fees:    uni?.tuition_raw  ?? 2800000,
  living_cost:     uni?.salary_raw   ? 800000 : 800000,   // always default living
  visa_cost:       300000,
  expected_salary: uni?.salary_raw   ?? 8500000,
  label:           uni?.university_name ?? '',
});

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, unit = 'L' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl px-4 py-2 text-xs text-white shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: ₹{p.value}{unit}
        </p>
      ))}
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, cls = 'text-white', loading }) => (
  <div className="glass-card p-5">
    {loading ? (
      <div className="space-y-2">
        <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
        <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
        <div className="h-2 w-28 bg-white/5 rounded animate-pulse" />
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
  const Icon = INSIGHT_ICON[insight.icon] ?? Info;
  const colorCls = INSIGHT_COLOR[insight.color] ?? INSIGHT_COLOR.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
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

// ─── Compare Panel ─────────────────────────────────────────────────────────────
const CompareBar = ({ label, valA, valB, colorA = 'var(--chart-primary)', colorB = 'var(--chart-accent)' }) => {
  const max = Math.max(valA, valB, 1);
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(valA / max) * 100}%`, background: colorA }} />
        </div>
        <span className="text-xs font-bold text-white w-14 text-right">
          {valA >= 10000000 ? `₹${(valA/10000000).toFixed(1)}Cr` : `₹${(valA/100000).toFixed(0)}L`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(valB / max) * 100}%`, background: colorB }} />
        </div>
        <span className="text-xs font-bold text-white w-14 text-right">
          {valB >= 10000000 ? `₹${(valB/10000000).toFixed(1)}Cr` : `₹${(valB/100000).toFixed(0)}L`}
        </span>
      </div>
    </div>
  );
};

// ─── Input Field ───────────────────────────────────────────────────────────────
const FieldInput = ({ label, name, value, onChange, hint }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
    <input
      name={name}
      type="number"
      value={value}
      onChange={onChange}
      className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm
                 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
    />
    {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
  </div>
);

// ─── Skeleton Results ──────────────────────────────────────────────────────────
const SkeletonResults = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <StatCard key={i} loading />)}
    </div>
    <div className="glass-card p-6 h-64 animate-pulse bg-white/[0.02]" />
    <div className="glass-card p-6 h-72 animate-pulse bg-white/[0.02]" />
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ROIAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setRoiResult, recommendations } = useApp();

  // Pre-fill from recommendation card "Analyze ROI" click
  const preUni = location.state?.university ?? null;

  const [formA, setFormA] = useState(defaultForm(preUni));
  const [formB, setFormB] = useState({
    tuition_fees: 5500000, living_cost: 1500000, visa_cost: 300000,
    expected_salary: 10200000, label: 'Northeastern University',
  });

  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [error,    setError]    = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState('breakdown'); // breakdown | projection | recovery

  // Auto-run if pre-filled from recommendation
  useEffect(() => {
    if (preUni) {

      runAnalysis(defaultForm(preUni), 'A');
    }
  }, []);

  const handleChange = (side) => (e) => {
    const val = parseFloat(e.target.value) || 0;
    if (side === 'A') setFormA(p => ({ ...p, [e.target.name]: val }));
    else              setFormB(p => ({ ...p, [e.target.name]: val }));
  };

  const runAnalysis = async (form, side) => {
    const payload = {
      tuition_fees:    form.tuition_fees,
      living_cost:     form.living_cost,
      visa_cost:       form.visa_cost,
      expected_salary: form.expected_salary,
    };

    if (side === 'B' && !resultA) {
      toast.error('Please analyze University A first!');
      return;
    }

    if (side === 'A') { setLoadingA(true); setError(''); }
    else               { setLoadingB(true); }

    try {
      const data = await getRoiAnalysis(payload);

      if (side === 'A') { setResultA(data); setRoiResult(data); toast.success('ROI Analysis complete!'); }
      else               { setResultB(data); toast.success('Comparison loaded!'); }
    } catch (err) {
      const msg = err.userMessage || 'Backend offline. Start the FastAPI server on port 8000.';
      setError(msg);
      toast.error('ROI calculation failed.');
    } finally {
      if (side === 'A') setLoadingA(false);
      else               setLoadingB(false);
    }
  };

  const catStyle  = CATEGORY_STYLE[resultA?.roi_category] ?? CATEGORY_STYLE.Good;
  const catStyleB = CATEGORY_STYLE[resultB?.roi_category] ?? CATEGORY_STYLE.Good;

  // Comparison bar chart data
  const compareBarData = resultA && resultB ? [
    { name: 'Total Cost',  A: resultA.total_cost / 100000, B: resultB.total_cost / 100000 },
    { name: 'Salary',      A: resultA.total_cost ? formA.expected_salary / 100000 : 0, B: formB.expected_salary / 100000 },
    { name: 'Net 10yr',    A: Math.max(formA.expected_salary * 10 - resultA.total_cost, 0) / 100000,
                           B: Math.max(formB.expected_salary * 10 - resultB.total_cost, 0) / 100000 },
  ] : [];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          {preUni && (
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-3 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Recommendations
            </button>
          )}
          <h1 className="text-3xl font-bold text-white">ROI Analysis</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {preUni
              ? `Analyzing financial outcomes for ${preUni.university_name}`
              : 'Calculate your return on investment for studying abroad'}
          </p>
        </div>

        <button
          onClick={() => { setCompareMode(!compareMode); if (!compareMode && resultA) runAnalysis(formB, 'B'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all
            ${compareMode
              ? 'bg-primary-600 border-primary-500 text-white'
              : 'bg-surface border-white/10 text-gray-300 hover:text-white hover:bg-white/5'}`}
        >
          <GitCompare className="h-4 w-4" />
          {compareMode ? 'Exit Compare' : 'Compare Universities'}
        </button>
      </div>

      <div className={`grid gap-8 ${compareMode ? 'grid-cols-1 xl:grid-cols-[1fr_1fr_2fr]' : 'grid-cols-1 lg:grid-cols-[320px_1fr]'}`}>

        {/* ── Input Panel A ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-5 sticky top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {compareMode ? `University A${formA.label ? ` — ${formA.label.split(' ').slice(0, 2).join(' ')}` : ''}` : 'Study Abroad Costs'}
              </h2>
              {compareMode && <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />}
            </div>

            {/* Quick-fill from recommendations */}
            {recommendations?.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Quick-fill from recommendations</label>
                <select
                  onChange={(e) => {
                    const uni = recommendations.find(u => u.university_name === e.target.value);
                    if (uni) {
                      const f = defaultForm(uni);
                      setFormA(f);
                    }
                  }}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select a university…</option>
                  {recommendations.map(u => (
                    <option key={u.university_name} value={u.university_name}>{u.university_name}</option>
                  ))}
                </select>
              </div>
            )}

            <FieldInput label="Total Tuition Fees (₹)"    name="tuition_fees"    value={formA.tuition_fees}    onChange={handleChange('A')} />
            <FieldInput label="Total Living Cost (₹)"     name="living_cost"     value={formA.living_cost}     onChange={handleChange('A')} />
            <FieldInput label="Visa & Travel Cost (₹)"    name="visa_cost"       value={formA.visa_cost}       onChange={handleChange('A')} />
            <FieldInput label="Expected Annual Salary (₹)" name="expected_salary" value={formA.expected_salary} onChange={handleChange('A')}
              hint="Post-degree annual salary in INR" />

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={() => runAnalysis(formA, 'A')}
              disabled={loadingA}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-background rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
            >
              {loadingA
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculating…</>
                : <><TrendingUp className="h-4 w-4" /> Analyze ROI</>}
            </button>

            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p className="text-gray-400 font-medium mb-1">Formula:</p>
              <p>Total Cost = Tuition + Living + Visa</p>
              <p>ROI % = (Salary − Cost) / Cost × 100</p>
              <p>Break-even = Cost ÷ Salary</p>
            </div>
          </div>
        </div>

        {/* ── Input Panel B (compare mode only) ─────────────────────────── */}
        <AnimatePresence>
          {compareMode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="glass-card p-6 space-y-5 sticky top-24">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">
                    University B{formB.label ? ` — ${formB.label.split(' ').slice(0, 2).join(' ')}` : ''}
                  </h2>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                </div>

                {recommendations?.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Quick-fill</label>
                    <select
                      onChange={(e) => {
                        const uni = recommendations.find(u => u.university_name === e.target.value);
                        if (uni) setFormB(defaultForm(uni));
                      }}
                      className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value="">Select a university…</option>
                      {recommendations.map(u => (
                        <option key={u.university_name} value={u.university_name}>{u.university_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <FieldInput label="Total Tuition Fees (₹)"    name="tuition_fees"    value={formB.tuition_fees}    onChange={handleChange('B')} />
                <FieldInput label="Total Living Cost (₹)"     name="living_cost"     value={formB.living_cost}     onChange={handleChange('B')} />
                <FieldInput label="Visa & Travel Cost (₹)"    name="visa_cost"       value={formB.visa_cost}       onChange={handleChange('B')} />
                <FieldInput label="Expected Annual Salary (₹)" name="expected_salary" value={formB.expected_salary} onChange={handleChange('B')} />

                <button
                  onClick={() => runAnalysis(formB, 'B')}
                  disabled={loadingB || !resultA}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-background rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {loadingB
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculating…</>
                    : <><TrendingUp className="h-4 w-4" /> Analyze B</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results Panel ──────────────────────────────────────────────── */}
        <div className="space-y-6 min-w-0">

          {/* Empty state */}
          {!resultA && !loadingA && (
            <div className="glass-card p-16 flex flex-col items-center justify-center text-center gap-4">
              <BarChart2 className="h-12 w-12 text-gray-600" />
              <p className="text-gray-400">
                Fill in your cost details and click <strong className="text-white">Analyze ROI</strong> to see your financial projection.
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {loadingA && <SkeletonResults />}

          {/* Results */}
          {resultA && !loadingA && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

              {/* ── Summary Cards ─────────────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Cost"   value={resultA.total_cost_fmt}    sub="tuition + living + visa" />
                <StatCard label="ROI %"        value={`${resultA.roi_percentage}%`}
                          cls={catStyle.text}   sub="return on investment" />
                <StatCard label="Break-even"   value={`${resultA.break_even_years} yrs`} sub="to recover investment" />
                <div className={`glass-card p-5 border ${catStyle.bg}`}>
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">ROI Category</p>
                  <p className={`text-xl font-bold ${catStyle.text}`}>{resultA.roi_category}</p>
                  <p className="text-xs text-gray-500 mt-1">investment rating</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Expected Salary"  value={resultA.expected_salary_fmt} cls="text-emerald-400" sub="per year" />
                <StatCard label="Monthly Salary"   value={resultA.monthly_salary_fmt}  cls="text-blue-400"    sub="approx. per month" />
                <StatCard label="10-Year Net Gain" value={resultA.net_gain_10yr_fmt}   cls="text-purple-400"  sub="after all costs" />
              </div>

              {/* ── Side-by-side compare summary ──────────────────────── */}
              {compareMode && resultB && (
                <div className="glass-card p-6">
                  <h3 className="text-base font-semibold text-white mb-5">Side-by-Side Comparison</h3>
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    {[
                      { label: 'ROI %',        a: `${resultA.roi_percentage}%`,    b: `${resultB.roi_percentage}%`,    aGood: resultA.roi_percentage >= resultB.roi_percentage },
                      { label: 'Break-even',   a: `${resultA.break_even_years}y`,  b: `${resultB.break_even_years}y`,  aGood: resultA.break_even_years <= resultB.break_even_years },
                      { label: 'Total Cost',   a: resultA.total_cost_fmt,          b: resultB.total_cost_fmt,          aGood: resultA.total_cost <= resultB.total_cost },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <div className={`text-lg font-bold ${item.aGood ? 'text-indigo-400' : 'text-gray-300'}`}>{item.a}</div>
                        <div className="text-xs text-gray-500">vs</div>
                        <div className={`text-lg font-bold ${!item.aGood ? 'text-emerald-400' : 'text-gray-300'}`}>{item.b}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <CompareBar label="Total Investment" valA={resultA.total_cost} valB={resultB.total_cost} />
                    <CompareBar label="Expected Salary"  valA={formA.expected_salary} valB={formB.expected_salary} />
                  </div>
                  <div className="mt-6 h-56 min-h-[224px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={compareBarData} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} unit="L" />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Legend formatter={(v) => v === 'A' ? (formA.label || 'University A') : (formB.label || 'University B')} />
                        <Bar dataKey="A" fill="var(--chart-primary)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="B" fill="var(--chart-accent)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ── Chart Tab Bar ──────────────────────────────────────── */}
              <div className="flex gap-2 border-b border-white/10 pb-0">
                {[
                  { key: 'breakdown',  label: 'Cost Breakdown',   icon: PieIcon },
                  { key: 'projection', label: 'Salary Growth',    icon: TrendingUp },
                  { key: 'recovery',   label: 'Cost Recovery',    icon: BarChart2 },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px
                      ${activeTab === key
                        ? 'text-white border-primary-500 bg-white/5'
                        : 'text-gray-400 border-transparent hover:text-white'}`}
                  >
                    <Icon className="h-3.5 w-3.5" />{label}
                  </button>
                ))}
              </div>

              {/* ── Cost Breakdown Tab ─────────────────────────────────── */}
              {activeTab === 'breakdown' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h3 className="text-base font-semibold text-white mb-1">Cost Breakdown</h3>
                  <p className="text-xs text-gray-500 mb-6">How your total investment is distributed</p>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-[220px] h-[220px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={resultA.cost_breakdown} cx="50%" cy="50%"
                            innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                            {resultA.cost_breakdown.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 flex-1 w-full">
                      {resultA.cost_breakdown.map((item, i) => (
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
                        <span className="text-gray-400 font-medium">Total Investment</span>
                        <span className="font-bold text-primary-400">{resultA.total_cost_fmt}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Salary Projection Tab ──────────────────────────────── */}
              {activeTab === 'projection' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h3 className="text-base font-semibold text-white mb-1">10-Year Salary Projection</h3>
                  <p className="text-xs text-gray-500 mb-6">Projected growth at 3% annual raise</p>
                  <div className="h-64 min-h-[256px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={resultA.salary_projection}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                          tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip unit="" />} />
                        <Line type="monotone" dataKey="value" name="Salary" stroke="var(--chart-primary)"
                          strokeWidth={2.5} dot={{ fill: 'var(--chart-primary)', r: 3 }} activeDot={{ r: 5 }} />
                        {compareMode && resultB && (
                          <Line type="monotone" data={resultB.salary_projection} dataKey="value"
                            name="Salary B" stroke="var(--chart-accent)" strokeWidth={2} strokeDasharray="5 3"
                            dot={{ fill: 'var(--chart-accent)', r: 2 }} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* ── Cost Recovery Tab ──────────────────────────────────── */}
              {activeTab === 'recovery' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h3 className="text-base font-semibold text-white mb-1">Cumulative Salary vs Investment</h3>
                  <p className="text-xs text-gray-500 mb-6">See exactly when your salary recovers the total cost</p>
                  <div className="h-64 min-h-[256px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={resultA.recovery_chart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} unit="L" />
                        <Tooltip content={<ChartTooltip />} />
                        <ReferenceLine y={resultA.total_cost / 100000} stroke="#EF4444"
                          strokeDasharray="4 4" label={{ value: 'Break-even', fill: '#EF4444', fontSize: 10 }} />
                        <Line type="monotone" dataKey="cumulative_salary" name="Cumulative Salary"
                          stroke="var(--chart-primary)" strokeWidth={2.5} dot={{ fill: 'var(--chart-primary)', r: 3 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="total_cost" name="Total Cost"
                          stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Red dashed line = total investment. Green line = cumulative earnings. Crossover = break-even point.
                  </p>
                </motion.div>
              )}

              {/* ── Financial Insights ─────────────────────────────────── */}
              {resultA.financial_insights?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-base font-semibold text-white mb-4">Financial Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resultA.financial_insights.map((insight, i) => (
                      <InsightCard key={i} insight={insight} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Analytics Metadata ─────────────────────────────────── */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-4">Cost Distribution Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Tuition Share',   value: `${resultA.analytics.tuition_pct}%`,    cls: 'text-indigo-400' },
                    { label: 'Living Share',     value: `${resultA.analytics.living_pct}%`,     cls: 'text-purple-400' },
                    { label: 'Visa Share',       value: `${resultA.analytics.visa_pct}%`,       cls: 'text-violet-400' },
                    { label: 'Salary / Cost',    value: `${resultA.analytics.salary_vs_cost}×`, cls: 'text-emerald-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                      <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ROIAnalysisPage;
