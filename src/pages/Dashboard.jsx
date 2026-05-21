import React from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Target, TrendingUp, Landmark, Sparkles, ChevronRight,
  UserCircle, Settings, Calendar, Calculator, Brain,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_EXPENSE_CHART, DEMO_SALARY_PROJECTION } from '../utils/demoData';

// ── Chart config ──────────────────────────────────────────────────────────────
const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1A2235', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' },
  itemStyle:    { color: '#fff' },
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, subtitle, colorClass, to }) => {
  const inner = (
    <div className="glass-card p-5 hover:bg-white/5 transition-all cursor-pointer group h-full">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-xl font-bold text-white mt-1.5 truncate">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ml-3 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

// ── Sidebar nav link ──────────────────────────────────────────────────────────
const NavLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
      active
        ? 'bg-primary-500/15 text-white font-medium border border-primary-500/20'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon className={`h-4 w-4 ${active ? 'text-primary-400' : ''}`} />
    {label}
  </Link>
);

// ── AI Insights panel ─────────────────────────────────────────────────────────
const AI_INSIGHTS = [
  { text: 'ASU has the best ROI for your CS profile — 117% return in 3 years.', tag: 'ROI' },
  { text: 'Your GRE 318 qualifies you for 12 target universities in the USA.', tag: 'Admissions' },
  { text: 'Consider SBI Global Ed-Vantage loan at 10.05% for best EMI terms.', tag: 'Loan' },
  { text: 'Apply by Jan 15 for Spring intake — 4 universities still open.', tag: 'Deadline' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { userProfile, recommendations, roiResult } = useApp();

  const firstName = userProfile?.full_name?.split(' ')[0] || 'there';
  const topUni    = recommendations?.[0];
  const topMatch  = topUni?.university_name || 'Arizona State';
  const topScore  = topUni?.match_score     || 88;
  const roiRating = roiResult?.roi_category || 'Excellent';
  const breakEven = roiResult?.break_even_years != null
    ? `${roiResult.break_even_years} yrs`
    : '2.5 yrs';

  // Use real ROI cost breakdown if available, else demo
  const expenseData = roiResult?.cost_breakdown?.map((b) => ({
    name:  b.name,
    value: b.value,
  })) || DEMO_EXPENSE_CHART;

  // Salary projection
  const salaryData = roiResult?.salary_projection?.map((p) => ({
    year:   `Y${p.year}`,
    salary: p.cumulative_salary / 100000,  // convert to ₹L
  })) || DEMO_SALARY_PROJECTION.map((p) => ({
    year:   p.year,
    salary: p.salary / 100000,
  }));

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col shrink-0 border-r border-white/5 bg-surface/30 p-5 gap-1">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 px-2">
          Navigation
        </p>

        <NavLink to="/dashboard"     icon={Target}     label="Dashboard"        active />
        <NavLink to="/universities"  icon={Landmark}   label="Universities" />
        <NavLink to="/roi-analysis"  icon={TrendingUp} label="ROI Analysis" />
        <NavLink to="/loan-estimator" icon={Calculator} label="Loan Estimator" />
        <NavLink to="/ai-mentor"     icon={Sparkles}   label="AI Mentor" />
        <NavLink to="/timeline"      icon={Calendar}   label="Timeline" />

        <div className="mt-auto space-y-1 border-t border-white/5 pt-4">
          <NavLink to="/profile"     icon={UserCircle} label="My Profile" />
          <NavLink to="/ai-mentor"   icon={Brain}      label="AI Advisor" />
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}! 👋</h1>
              <p className="text-gray-400 text-sm mt-1">
                {recommendations?.length
                  ? `${recommendations.length} universities matched · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : 'Complete your profile to get personalised recommendations.'}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                to="/profile"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
              >
                Update Profile
              </Link>
              <Link
                to="/ai-mentor"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm text-white transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20"
              >
                <Sparkles className="h-4 w-4" />
                Chat with AI
              </Link>
            </div>
          </header>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              to="/universities"
              icon={Target}
              title="Top Match"
              value={topMatch.split(' ').slice(0, 2).join(' ')}
              subtitle={`${topScore}% fit score`}
              colorClass="bg-blue-500/10 text-blue-400"
            />
            <StatCard
              to="/roi-analysis"
              icon={TrendingUp}
              title="ROI Rating"
              value={roiRating}
              subtitle={`Break-even: ${breakEven}`}
              colorClass="bg-emerald-500/10 text-emerald-400"
            />
            <StatCard
              to="/loan-estimator"
              icon={Calculator}
              title="EMI Planner"
              value="Calculate"
              subtitle="Education loan EMI"
              colorClass="bg-purple-500/10 text-purple-400"
            />
            <StatCard
              to="/ai-mentor"
              icon={Sparkles}
              title="AI Mentor"
              value="Ask Anything"
              subtitle="Powered by Gemini"
              colorClass="bg-amber-500/10 text-amber-400"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense pie */}
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-1">Cost Breakdown</h3>
              <p className="text-xs text-gray-500 mb-5">Tuition + living + visa (Year 1)</p>
              {/* min-h prevents Recharts width(-1) warning */}
              <div className="h-56 min-h-[224px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {expenseData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Salary line chart */}
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-1">Projected Salary Growth</h3>
              <p className="text-xs text-gray-500 mb-5">Post-graduation salary trajectory (₹L)</p>
              <div className="h-56 min-h-[224px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salaryData} margin={{ right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} unit="L" width={36} />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v) => [`₹${v.toFixed(1)}L`, 'Salary']}
                    />
                    <Line
                      type="monotone"
                      dataKey="salary"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ fill: '#6366f1', r: 3.5, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom row: Top universities + AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Top recommendations list */}
            <div className="glass-card p-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Top University Matches</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Based on your profile</p>
                </div>
                <Link
                  to="/universities"
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {(recommendations?.slice(0, 4) || [
                  { university_name: 'Arizona State University', match_score: 92, country: 'USA' },
                  { university_name: 'Purdue University',         match_score: 88, country: 'USA' },
                  { university_name: 'UT Dallas',                 match_score: 85, country: 'USA' },
                  { university_name: 'Northeastern University',   match_score: 82, country: 'USA' },
                ]).map((uni, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <span className="text-xs font-bold text-gray-600 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-primary-300 transition-colors">
                        {uni.university_name}
                      </p>
                      <p className="text-xs text-gray-500">{uni.country}</p>
                    </div>
                    {/* Mini score bar */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                          style={{ width: `${uni.match_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-8 text-right">{uni.match_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights panel */}
            <div className="glass-card p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Insights</h3>
                  <p className="text-xs text-gray-500">Powered by Gemini</p>
                </div>
              </div>
              <div className="space-y-3">
                {AI_INSIGHTS.map((insight, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="inline-flex shrink-0 mt-0.5 items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      {insight.tag}
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/ai-mentor"
                className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/20 text-sm text-primary-300 font-medium transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Ask AI Mentor
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Find Universities', to: '/universities', icon: Landmark },
                { label: 'Calculate ROI',     to: '/roi-analysis', icon: TrendingUp },
                { label: 'Loan Estimator',    to: '/loan-estimator', icon: Calculator },
                { label: 'Timeline Planner',  to: '/timeline', icon: Calendar },
              ].map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="glass-card p-4 hover:bg-white/5 transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-500 group-hover:text-primary-400 transition-colors" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
