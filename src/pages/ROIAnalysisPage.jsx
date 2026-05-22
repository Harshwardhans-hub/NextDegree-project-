import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { getRoiAnalysis } from '../api/roiApi';
import { useApp } from '../context/AppContext';
import { TrendingUp, Loader2, BadgeCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Chart Colors ──────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa'];

// ── ROI Category Badge Colors ─────────────────────────────────────────────────
const CATEGORY_STYLE = {
  Excellent: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  Good:      { text: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30' },
  Average:   { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  Low:       { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
};

// ── Recharts Custom Tooltip ───────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl px-4 py-2 text-xs text-white shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: ₹{(p.value / 100000).toFixed(1)}L
        </p>
      ))}
    </div>
  );
};

// ── Small Summary Card ────────────────────────────────────────────────────────
const Card = ({ label, value, sub, cls = 'text-white' }) => (
  <div className="glass-card p-5">
    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{label}</p>
    <p className={`text-xl font-bold ${cls}`}>{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROI Analysis Page
// ─────────────────────────────────────────────────────────────────────────────
const ROIAnalysisPage = () => {
  const { setRoiResult } = useApp();
  const [form, setForm] = useState({
    tuition_fees:    2800000,
    living_cost:      800000,
    visa_cost:        300000,
    expected_salary: 8500000,
  });

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Handle number inputs
  const handleChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setForm({ ...form, [e.target.name]: val });
  };

  // Call backend /api/roi
  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRoiAnalysis(form);
      setResult(data);
      setRoiResult(data);   // persist to global context for Dashboard
      toast.success('ROI Analysis completed successfully!');
    } catch (err) {
      const msg = err.userMessage || 'Could not connect to the backend. Make sure the server is running on port 8000.';
      setError(msg);
      toast.error('Failed to calculate ROI.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-surface border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all";
  const labelCls = "block text-xs font-medium text-gray-400 mb-1.5";

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">ROI Analysis</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Enter your study abroad details to calculate your financial return on investment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Input Panel ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 space-y-5 sticky top-24">
            <h2 className="text-base font-semibold text-white border-b border-white/10 pb-3">
              Study Abroad Costs
            </h2>

            {/* Tuition Fees */}
            <div>
              <label className={labelCls}>Total Tuition Fees (₹)</label>
              <input
                name="tuition_fees"
                type="number"
                value={form.tuition_fees}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 2800000"
              />
            </div>

            {/* Living Cost */}
            <div>
              <label className={labelCls}>Total Living Cost (₹)</label>
              <input
                name="living_cost"
                type="number"
                value={form.living_cost}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 800000"
              />
            </div>

            {/* Visa Cost */}
            <div>
              <label className={labelCls}>Visa & Travel Cost (₹)</label>
              <input
                name="visa_cost"
                type="number"
                value={form.visa_cost}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 300000"
              />
            </div>

            {/* Expected Salary */}
            <div>
              <label className={labelCls}>Expected Annual Salary (₹)</label>
              <input
                name="expected_salary"
                type="number"
                value={form.expected_salary}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 8500000"
              />
              <p className="text-xs text-gray-600 mt-1">Post-degree annual salary in INR</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-primary-500/20"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculating…</>
                : <><TrendingUp className="h-4 w-4" /> Analyze ROI</>}
            </button>

            {/* Formula hint */}
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p className="text-gray-400 font-medium mb-2">Formula Used:</p>
              <p>Total Cost = Tuition + Living + Visa</p>
              <p>ROI % = (Salary − Cost) / Cost × 100</p>
              <p>Break-even = Cost ÷ Salary</p>
            </div>
          </div>
        </div>

        {/* ── Results Panel ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Empty State */}
          {!result && !loading && (
            <div className="glass-card p-16 flex flex-col items-center justify-center text-center gap-4">
              <TrendingUp className="h-12 w-12 text-gray-600" />
              <p className="text-gray-400">
                Fill in your cost details and click <strong className="text-white">Analyze ROI</strong> to see your financial projection.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="glass-card p-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-primary-400 animate-spin" />
              <p className="text-gray-400 text-sm">Calculating your ROI…</p>
            </div>
          )}

          {/* ── Result Content ─────────────────────────────────────── */}
          {result && !loading && (
            <>
              {/* Summary Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                  label="Total Cost"
                  value={result.total_cost_fmt}
                  sub="tuition + living + visa"
                />
                <Card
                  label="ROI %"
                  value={`${result.roi_percentage}%`}
                  cls={CATEGORY_STYLE[result.roi_category]?.text || 'text-white'}
                  sub="return on investment"
                />
                <Card
                  label="Break-even"
                  value={`${result.break_even_years} yrs`}
                  sub="to recover investment"
                />
                <div className={`glass-card p-5 border ${CATEGORY_STYLE[result.roi_category]?.bg || 'border-white/10'}`}>
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">ROI Category</p>
                  <p className={`text-xl font-bold ${CATEGORY_STYLE[result.roi_category]?.text || 'text-white'}`}>
                    {result.roi_category}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">investment rating</p>
                </div>
              </div>

              {/* Secondary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card label="Expected Salary"  value={result.expected_salary_fmt} cls="text-emerald-400" sub="per year" />
                <Card label="Monthly Salary"   value={result.monthly_salary_fmt}  cls="text-blue-400"    sub="approx. per month" />
                <Card label="10-Year Net Gain" value={result.net_gain_10yr_fmt}   cls="text-purple-400"  sub="after costs" />
              </div>

              {/* Cost Breakdown Pie Chart */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-1">Cost Breakdown</h3>
                <p className="text-xs text-gray-500 mb-6">How your total investment is distributed</p>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width={220} height={220} className="min-h-[224px]">
                    <PieChart>
                      <Pie
                        data={result.cost_breakdown}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {result.cost_breakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-4 flex-1">
                    {result.cost_breakdown.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: PIE_COLORS[i] }} />
                            <span className="text-gray-300">{item.name}</span>
                          </div>
                          <span className="font-bold text-white">{item.label}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%`, background: PIE_COLORS[i] }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 text-right">{item.percentage}%</p>
                      </div>
                    ))}

                    <div className="border-t border-white/10 pt-3 flex justify-between text-sm mt-2">
                      <span className="text-gray-400 font-medium">Total Investment</span>
                      <span className="font-bold text-primary-400">{result.total_cost_fmt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Projection Line Chart */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-1">10-Year Salary Projection</h3>
                <p className="text-xs text-gray-500 mb-6">
                  Projected salary growth over 10 years (3% annual raise applied)
                </p>
                <ResponsiveContainer width="100%" height={260} className="min-h-[224px]">
                  <LineChart data={result.salary_projection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Salary"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ fill: '#10B981', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Analytics Metadata */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-4">Financial Insights</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/[0.03] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Tuition Share</p>
                    <p className="text-lg font-bold text-indigo-400">{result.analytics.tuition_pct}%</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Living Share</p>
                    <p className="text-lg font-bold text-purple-400">{result.analytics.living_pct}%</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Visa Share</p>
                    <p className="text-lg font-bold text-violet-400">{result.analytics.visa_pct}%</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Salary / Cost</p>
                    <p className="text-lg font-bold text-emerald-400">{result.analytics.salary_vs_cost}×</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ROIAnalysisPage;
