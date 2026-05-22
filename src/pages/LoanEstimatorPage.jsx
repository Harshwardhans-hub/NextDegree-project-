import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { getEmiCalculation } from '../api/emiApi';
import { useApp } from '../context/AppContext';
import { Calculator, Landmark, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Chart Colors ──────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#f59e0b'];

// ── Recharts Custom Tooltip ───────────────────────────────────────────────────
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

// ── Small Info Card ───────────────────────────────────────────────────────────
const InfoCard = ({ label, value, sub, cls = 'text-white' }) => (
  <div className="glass-card p-5">
    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{label}</p>
    <p className={`text-xl font-bold ${cls}`}>{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Loan Estimator Page
// ─────────────────────────────────────────────────────────────────────────────
const LoanEstimatorPage = () => {
  // Slider states — use new field names matching backend API
  const [loan_amount,    setLoanAmount]    = useState(2500000);
  const [interest_rate,  setInterestRate]  = useState(10.5);
  const [duration_years, setDurationYears] = useState(10);

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── Auto-calculate on any slider change (400ms debounce) ──────────────────
  const fetchEmi = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEmiCalculation({
        loan_amount,
        interest_rate,
        duration_years,
      });
      setResult(data);
    } catch (err) {
      const msg = err?.response?.data?.detail;
      if (Array.isArray(msg)) {
        setError(msg.map((e) => e.msg).join(', '));
      } else if (typeof msg === 'object' && msg?.messages) {
        setError(msg.messages.join(', '));
      } else {
        setError('Backend unavailable. Make sure the server is running on port 8000.');
      }
      toast.error('Failed to calculate loan EMI.');
    } finally {
      setLoading(false);
    }
  }, [loan_amount, interest_rate, duration_years]);

  useEffect(() => {
    const timer = setTimeout(fetchEmi, 400);
    return () => clearTimeout(timer);
  }, [fetchEmi]);

  const sliderCls = "w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-500";

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Loan Estimator</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Adjust the sliders to calculate your monthly EMI and full repayment schedule in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Slider Control Panel ─────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 space-y-8 sticky top-24">
            <h2 className="text-base font-semibold text-white border-b border-white/10 pb-3">
              Loan Parameters
            </h2>

            {/* Loan Amount Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Loan Amount</label>
                <span className="text-sm font-bold text-white">
                  ₹{(loan_amount / 100000).toFixed(1)}L
                </span>
              </div>
              <input
                type="range" min="500000" max="15000000" step="100000"
                value={loan_amount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className={sliderCls}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>₹5L</span><span>₹150L</span>
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Interest Rate</label>
                <span className="text-sm font-bold text-white">{interest_rate}% p.a.</span>
              </div>
              <input
                type="range" min="7" max="18" step="0.5"
                value={interest_rate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className={sliderCls}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>7%</span><span>18%</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Loan Duration</label>
                <span className="text-sm font-bold text-white">{duration_years} years</span>
              </div>
              <input
                type="range" min="1" max="20" step="1"
                value={duration_years}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                className={sliderCls}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1 yr</span><span>20 yrs</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Quick Summary inside slider panel */}
            {result && (
              <div className="border-t border-white/10 pt-5 space-y-3">
                {[
                  { label: 'Monthly EMI',      value: result.monthly_emi_fmt,     cls: 'text-primary-400' },
                  { label: 'Total Repayment',  value: result.total_repayment_fmt, cls: 'text-white' },
                  { label: 'Total Interest',   value: result.total_interest_fmt,  cls: 'text-amber-400' },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{s.label}</span>
                    <span className={`font-bold ${s.cls}`}>
                      {loading ? '…' : s.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* EMI Formula hint */}
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p className="text-gray-400 font-medium mb-2">Formula:</p>
              <p>EMI = [P × R × (1+R)^N]</p>
              <p className="pl-6">÷ [(1+R)^N − 1]</p>
              <p className="mt-1 text-gray-600">R = rate/12/100, N = months</p>
            </div>
          </div>
        </div>

        {/* ── Results Area ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Loading / Empty State */}
          {!result && loading && (
            <div className="glass-card p-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-primary-400 animate-spin" />
              <p className="text-gray-400 text-sm">Calculating EMI…</p>
            </div>
          )}

          {/* ── EMI Hero Banner ──────────────────────────────────────── */}
          {result && (
            <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Monthly EMI</p>
                <p className="text-5xl font-black text-white">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin text-primary-400 inline" /> : result.monthly_emi_fmt}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {result.loan_summary?.duration} @ {result.loan_summary?.interest_rate} per annum
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
            </div>
          )}

          {/* ── Summary Cards ────────────────────────────────────────── */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard label="Monthly EMI"     value={result.monthly_emi_fmt}     cls="text-primary-400" />
              <InfoCard label="Total Repayment" value={result.total_repayment_fmt} sub="full amount to pay" />
              <InfoCard label="Total Interest"  value={result.total_interest_fmt}  cls="text-amber-400" sub="extra you pay" />
              <InfoCard label="Interest Share"  value={result.loan_summary?.interest_pct} cls="text-red-400" sub="of loan amount" />
            </div>
          )}

          {/* ── Principal vs Interest Pie Chart ─────────────────────── */}
          {result?.repayment_breakdown && (
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-1">Principal vs Interest</h3>
              <p className="text-xs text-gray-500 mb-6">How your total repayment is split</p>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ResponsiveContainer width={240} height={240} className="min-h-[240px]">
                  <PieChart>
                    <Pie
                      data={result.repayment_breakdown}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {result.repayment_breakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4 flex-1">
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
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.percentage}%`, background: PIE_COLORS[i] }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 text-right">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Year-wise Amortization Bar Chart ────────────────────── */}
          {result?.amortization?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-1">Year-wise Repayment Breakdown</h3>
              <p className="text-xs text-gray-500 mb-6">
                How your EMI is split between principal and interest each year
              </p>
              <div className="w-full h-72 min-h-[288px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.amortization} barSize={16} barCategoryGap="20%">
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
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="Principal" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="Interest"  fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-3 h-3 rounded-sm bg-indigo-500" /> Principal
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-3 h-3 rounded-sm bg-amber-500" /> Interest
                </div>
              </div>
            </div>
          )}

          {/* ── Remaining Balance Line Chart ─────────────────────────── */}
          {result?.repayment_timeline?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-1">Remaining Balance Over Time</h3>
              <p className="text-xs text-gray-500 mb-6">
                How your outstanding loan balance reduces year by year
              </p>
              <div className="w-full h-56 min-h-[224px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.repayment_timeline}>
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
                      dataKey="balance"
                      name="Balance"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ fill: '#6366f1', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="paid"
                      name="Paid So Far"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
              </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Bank Suggestions Table ───────────────────────────────── */}
          {result?.bank_suggestions && (
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary-400" /> Bank Loan Options
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                Top Indian banks for education loans — highlighted ones match your interest rate
              </p>
              <div className="space-y-3">
                {result.bank_suggestions.map((bank, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                      bank.recommended
                        ? 'border-primary-500/40 bg-primary-500/5'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Landmark className={`h-5 w-5 shrink-0 ${bank.recommended ? 'text-primary-400' : 'text-gray-500'}`} />
                      <div>
                        <p className="text-sm font-semibold text-white">{bank.bank}</p>
                        <p className="text-xs text-gray-500">{bank.note}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${bank.recommended ? 'text-primary-400' : 'text-white'}`}>
                        {bank.rate}
                      </p>
                      <p className="text-xs text-gray-500">up to {bank.max_loan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoanEstimatorPage;
