import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children, requireProfile = false }) => {
  const { isAuthenticated } = useAuth();
  const { hasProfile } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce profile completion for pages that require it
  if (requireProfile && !hasProfile) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
