// ─────────────────────────────────────────────────────────────────────────────
// src/utils/demoData.js — Realistic demo & fallback data for NextDegree AI
//
// Used for:
//   1. Pre-filling the Profile form in demo mode
//   2. Fallback university cards if API is offline
//   3. Dashboard stats
// ─────────────────────────────────────────────────────────────────────────────

// ── Demo student profile (pre-fills the form) ─────────────────────────────────
export const DEMO_PROFILE = {
  full_name:         'Arjun Mehta',
  email:             'arjun.mehta@gmail.com',
  cgpa:              8.4,
  gre_score:         318,
  ielts_score:       7.5,
  preferred_country: 'USA',
  course_interest:   'Computer Science',
  budget:            80000,       // USD
  family_income:     75000,       // USD annual
};

// ── Static university cards (shown if API is offline) ────────────────────────
export const FALLBACK_UNIVERSITIES = [
  {
    university_name:  'Arizona State University',
    country:          'USA',
    course:           'MS in Computer Science',
    match_score:       92,
    tuition_fees:     '₹28.5L / yr',
    avg_salary:       '₹85L / yr',
    roi_rating:       'Excellent',
    tuition_raw:      2850000,
    salary_raw:       8500000,
    recommendation_reason: 'Strong match for your CS profile with excellent OPT/CPT opportunities and affordable tuition compared to peer schools.',
  },
  {
    university_name:  'Purdue University',
    country:          'USA',
    course:           'MS in Computer Science',
    match_score:       88,
    tuition_fees:     '₹32L / yr',
    avg_salary:       '₹92L / yr',
    roi_rating:       'Excellent',
    tuition_raw:      3200000,
    salary_raw:       9200000,
    recommendation_reason: 'Top-ranked engineering school with strong industry placements and a vibrant Indian student community.',
  },
  {
    university_name:  'UT Dallas',
    country:          'USA',
    course:           'MS in Computer Science',
    match_score:       85,
    tuition_fees:     '₹25L / yr',
    avg_salary:       '₹80L / yr',
    roi_rating:       'Excellent',
    tuition_raw:      2500000,
    salary_raw:       8000000,
    recommendation_reason: 'Located in the heart of Dallas tech hub with excellent placement rates at major tech companies.',
  },
  {
    university_name:  'Northeastern University',
    country:          'USA',
    course:           'MS in Computer Science',
    match_score:       82,
    tuition_fees:     '₹38L / yr',
    avg_salary:       '₹90L / yr',
    roi_rating:       'High',
    tuition_raw:      3800000,
    salary_raw:       9000000,
    recommendation_reason: 'Known for its co-op program — you can earn while you study. Boston is a top-tier tech city.',
  },
  {
    university_name:  'NYU Tandon School of Engineering',
    country:          'USA',
    course:           'MS in Computer Science',
    match_score:       78,
    tuition_fees:     '₹42L / yr',
    avg_salary:       '₹95L / yr',
    roi_rating:       'High',
    tuition_raw:      4200000,
    salary_raw:       9500000,
    recommendation_reason: 'New York City location provides unparalleled networking opportunities with finance and tech companies.',
  },
  {
    university_name:  'University of Toronto',
    country:          'Canada',
    course:           'MEng in Computer Engineering',
    match_score:       80,
    tuition_fees:     '₹22L / yr',
    avg_salary:       '₹65L / yr',
    roi_rating:       'High',
    tuition_raw:      2200000,
    salary_raw:       6500000,
    recommendation_reason: 'Canada\'s top-ranked university with a straightforward pathway to permanent residency.',
  },
];

// ── Realistic ROI defaults ────────────────────────────────────────────────────
export const DEMO_ROI = {
  tuition_fees:    2800000,
  living_cost:      800000,
  visa_cost:        300000,
  expected_salary: 8500000,
};

// ── Realistic EMI defaults ────────────────────────────────────────────────────
export const DEMO_EMI = {
  loan_amount:    2500000,
  interest_rate:  10.5,
  duration_years: 10,
};

// ── Dashboard analytics fallback ──────────────────────────────────────────────
export const DEMO_EXPENSE_CHART = [
  { name: 'Tuition',    value: 2850000 },
  { name: 'Living',     value: 900000 },
  { name: 'Visa & Travel', value: 300000 },
  { name: 'Insurance', value: 150000 },
];

export const DEMO_SALARY_PROJECTION = [
  { year: 'Y1', salary: 8500000 },
  { year: 'Y2', salary: 9200000 },
  { year: 'Y3', salary: 10500000 },
  { year: 'Y4', salary: 12000000 },
  { year: 'Y5', salary: 13500000 },
];

// ── AI Mentor suggestion chips ─────────────────────────────────────────────────
export const CHAT_SUGGESTIONS = [
  'Best universities for MS in CS with GRE 315?',
  'Can I get a loan approval with 6 LPA family income?',
  'Which university offers better ROI — ASU or Purdue?',
  'What IELTS score do I need for Canada universities?',
  'How do I write a strong SOP for MS in Data Science?',
  'What is the OPT/CPT work visa process in the USA?',
];
