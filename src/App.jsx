import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage                from './pages/LandingPage';
import LoginPage                  from './pages/LoginPage';
import Dashboard                  from './pages/Dashboard';
import ProfileFormPage            from './pages/ProfileFormPage';
import UniversityRecommendationPage from './pages/UniversityRecommendationPage';
import ROIAnalysisPage            from './pages/ROIAnalysisPage';
import LoanEstimatorPage          from './pages/LoanEstimatorPage';
import AIMentorChatPage           from './pages/AIMentorChatPage';
import TimelinePlannerPage        from './pages/TimelinePlannerPage';

// ── Smooth fade transition wrapper for each page ──────────────────────────────
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

// ── Pages that should hide the Navbar + Footer ────────────────────────────────
const FULL_SCREEN_ROUTES = ['/login', '/ai-mentor'];

const AppContent = () => {
  const location = useLocation();
  const hideChrome = FULL_SCREEN_ROUTES.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Toast notifications — dark theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1A2235',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1A2235' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#1A2235' } },
        }}
      />

      {!hideChrome && <Navbar />}

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"              element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/login"         element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/dashboard"     element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/profile"       element={<PageTransition><ProfileFormPage /></PageTransition>} />
            <Route path="/universities"  element={<PageTransition><UniversityRecommendationPage /></PageTransition>} />
            <Route path="/recommendations" element={<PageTransition><UniversityRecommendationPage /></PageTransition>} />
            <Route path="/roi-analysis"  element={<PageTransition><ROIAnalysisPage /></PageTransition>} />
            <Route path="/loan-estimator" element={<PageTransition><LoanEstimatorPage /></PageTransition>} />
            <Route path="/ai-mentor"     element={<AIMentorChatPage />} />
            <Route path="/timeline"      element={<PageTransition><TimelinePlannerPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
