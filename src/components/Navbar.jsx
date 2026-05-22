import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LogOut, User, Sun, Moon } from 'lucide-react';
import BackendStatus from './BackendStatus';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Universities', path: '/universities' },
    { name: 'ROI Analysis', path: '/roi-analysis' },
    { name: 'Loan Estimator', path: '/loan-estimator' },
    { name: 'AI Mentor', path: '/ai-mentor' },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
              <div className="bg-primary-500/20 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-primary-500" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                NextDegree <span className="text-primary-500">AI</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-white bg-white/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-medium text-background bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 rounded-xl shadow-lg shadow-primary-500/25 transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4 ml-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                    <User className="h-4 w-4 text-primary-400" />
                  </div>
                  <span className="font-medium hidden lg:block">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2 rounded-md focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden glass absolute top-16 left-0 right-0 border-b border-white/10 shadow-2xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'text-white bg-white/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-4 pt-4 pb-2 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
              >
                {theme === 'dark' ? <><Sun className="h-5 w-5" /> Light Mode</> : <><Moon className="h-5 w-5" /> Dark Mode</>}
              </button>
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block w-full text-center px-5 py-3 text-base font-medium text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block w-full text-center px-5 py-3 text-base font-medium text-background bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 rounded-xl transition-all"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => { logout(); closeMenu(); }}
                  className="block w-full text-center px-5 py-3 text-base font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-xl transition-colors border border-red-400/10"
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
