import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Brain, Calculator, MapPin, GraduationCap,
  Sparkles, TrendingUp, ShieldCheck, Star, CheckCircle2,
} from 'lucide-react';

// ── Stat counter animation ────────────────────────────────────────────────────
const AnimatedStat = ({ target, suffix = '', label }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-white">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
};

// ── Feature card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, badge, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, delay }}
    whileHover={{ y: -4 }}
    className="glass-card p-6 flex flex-col h-full relative overflow-hidden group"
  >
    {badge && (
      <span className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
        {badge}
      </span>
    )}
    <div className="h-11 w-11 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 border border-primary-500/20 group-hover:bg-primary-500/20 transition-colors">
      <Icon className="h-5 w-5 text-primary-400" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed flex-grow">{description}</p>
  </motion.div>
);

// ── Testimonial card ──────────────────────────────────────────────────────────
const TestimonialCard = ({ name, uni, text, stars = 5 }) => (
  <div className="glass-card p-6 flex flex-col gap-3">
    <div className="flex gap-0.5">
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
    <p className="text-gray-300 text-sm leading-relaxed">"{text}"</p>
    <div className="mt-auto">
      <p className="text-white font-medium text-sm">{name}</p>
      <p className="text-gray-500 text-xs">{uni}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LandingPage
// ─────────────────────────────────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute top-[-15%] left-[-8%] w-[55%] h-[55%] rounded-full bg-primary-900/25 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-900/20 blur-[130px] pointer-events-none" />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-400 text-xs font-semibold mb-8 tracking-wide">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
            Trusted by 2,000+ Indian students planning to study abroad
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.08]">
            Your AI-Powered<br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
              Study Abroad Advisor
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get personalised university recommendations, ROI analysis, education loan guidance,
            and 24/7 AI mentorship — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/profile"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-background rounded-xl font-semibold text-lg shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              Start Free Analysis
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/ai-mentor"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-white font-semibold bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-primary-400" />
              Chat with AI Mentor
            </Link>
          </div>


        </motion.div>

        {/* ── Dashboard preview mock ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-16 relative max-w-5xl mx-auto"
        >
          {/* Fade gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

          <div className="glass-card p-2 border-white/10 shadow-2xl shadow-primary-500/5">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/20 rounded-t-xl">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <div className="flex-1 mx-3">
                <div className="h-4 bg-white/5 rounded-md w-48 mx-auto" />
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="bg-surface/80 rounded-b-xl p-5 grid grid-cols-12 gap-4 min-h-[220px]">
              {/* Sidebar mock */}
              <div className="col-span-2 space-y-2 hidden md:block">
                {[40, 80, 60, 70, 55, 65].map((w, i) => (
                  <div key={i} className="h-6 bg-white/5 rounded-lg" style={{ width: `${w}%` }} />
                ))}
              </div>
              {/* Main content mock */}
              <div className="col-span-12 md:col-span-10 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Top Match', value: 'Arizona State', color: 'text-blue-400' },
                    { label: 'ROI Rating', value: 'Excellent', color: 'text-emerald-400' },
                    { label: 'EMI / month', value: '₹33,746', color: 'text-purple-400' },
                    { label: 'AI Sessions', value: '14 Chats', color: 'text-amber-400' },
                  ].map((card) => (
                    <div key={card.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-[9px] text-gray-500">{card.label}</p>
                      <p className={`text-xs font-bold mt-0.5 ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 bg-primary-500/10 rounded-xl border border-primary-500/20 flex items-end p-3 gap-1">
                    {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary-400/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="h-24 bg-accent-500/10 rounded-xl border border-accent-500/20 flex items-center justify-center">
                    <div className="relative w-14 h-14">
                      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1A2235" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3"
                          strokeDasharray="88 12" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">88%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section className="relative z-20 py-14 border-y border-white/5 bg-surface/20">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat target={500}  suffix="+"   label="Universities tracked" />
          <AnimatedStat target={98}   suffix="%"   label="Recommendation accuracy" />
          <AnimatedStat target={2000} suffix="+"   label="Students helped" />
          <AnimatedStat target={24}   suffix="/7"  label="AI Mentor availability" />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Everything in one platform
            </motion.h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              Stop switching between 10 different websites. NextDegree AI gives you
              every tool you need to plan your study abroad journey with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={Brain}
              title="AI Recommendations"
              description="Our engine matches you with universities based on your CGPA, GRE, budget, and country preference."
              delay={0}
            />
            <FeatureCard
              icon={TrendingUp}
              title="ROI Calculator"
              description="Calculate your exact return on investment — tuition cost vs expected salary with break-even analysis."
              delay={0.08}
            />
            <FeatureCard
              icon={Calculator}
              title="Loan EMI Planner"
              description="Get EMI breakdown, amortization schedule, and bank-wise loan comparisons for top Indian banks."
              delay={0.16}
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Mentor Chat"
              description="Ask anything about GRE prep, visa process, SOP writing, or financial planning — available 24/7."
              badge="New"
              delay={0.24}
            />
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-20 relative z-20 bg-surface/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-gray-400 text-sm">From profile to decision in under 5 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Build Your Profile', desc: 'Enter your CGPA, GRE score, IELTS, budget and preferences.', icon: GraduationCap },
              { step: '02', title: 'Get Matches', desc: 'Our engine instantly ranks universities by fit score and ROI.', icon: Brain },
              { step: '03', title: 'Analyse Finances', desc: 'Calculate ROI and EMI — see your break-even year clearly.', icon: TrendingUp },
              { step: '04', title: 'Ask the AI', desc: 'Chat with our Gemini-powered mentor for personalised advice.', icon: Sparkles },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                )}
                <div className="glass-card p-6 relative z-10">
                  <p className="text-4xl font-black text-white/5 mb-3">{s.step}</p>
                  <s.icon className="h-5 w-5 text-primary-400 mb-3" />
                  <h3 className="text-white font-semibold mb-1.5">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ── CTA section ────────────────────────────────────────────────── */}
      <section className="py-20 relative z-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <ShieldCheck className="h-10 w-10 text-primary-400 mx-auto mb-5" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to plan your future?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of Indian students who used NextDegree AI to make smarter
                study abroad decisions — with real data, real AI, and zero guesswork.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-background font-semibold bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 shadow-lg shadow-primary-500/25 transition-all group"
              >
                Start Your Free Analysis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
