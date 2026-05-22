import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session storage on mount
    const savedUser = sessionStorage.getItem('nd_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Simulated login - in a real app, verify with backend
    const mockUser = { email, name: email.split('@')[0], id: Date.now() };
    setUser(mockUser);
    sessionStorage.setItem('nd_user', JSON.stringify(mockUser));
    return true;
  };

  const signup = (email, password, name) => {
    // Simulated signup
    const mockUser = { email, name, id: Date.now() };
    setUser(mockUser);
    sessionStorage.setItem('nd_user', JSON.stringify(mockUser));
    return true;
  };

  const googleLogin = (decodedToken) => {
    // Extract info from Google JWT
    const mockUser = { 
      email: decodedToken.email, 
      name: decodedToken.name, 
      id: decodedToken.sub || Date.now(),
      picture: decodedToken.picture
    };
    setUser(mockUser);
    sessionStorage.setItem('nd_user', JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('nd_user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    googleLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
