import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
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
const FULL_SCREEN_ROUTES = ['/login'];

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
            
            {/* Protected Routes */}
            <Route path="/dashboard"     element={<ProtectedRoute requireProfile><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/profile"       element={<ProtectedRoute><PageTransition><ProfileFormPage /></PageTransition></ProtectedRoute>} />
            <Route path="/universities"  element={<ProtectedRoute requireProfile><PageTransition><UniversityRecommendationPage /></PageTransition></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute requireProfile><PageTransition><UniversityRecommendationPage /></PageTransition></ProtectedRoute>} />
            <Route path="/roi-analysis"  element={<ProtectedRoute requireProfile><PageTransition><ROIAnalysisPage /></PageTransition></ProtectedRoute>} />
            <Route path="/loan-estimator" element={<ProtectedRoute requireProfile><PageTransition><LoanEstimatorPage /></PageTransition></ProtectedRoute>} />
            <Route path="/ai-mentor"     element={<ProtectedRoute requireProfile><AIMentorChatPage /></ProtectedRoute>} />
            <Route path="/timeline"      element={<ProtectedRoute requireProfile><PageTransition><TimelinePlannerPage /></PageTransition></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
