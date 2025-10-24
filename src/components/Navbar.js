import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { success, error: showError } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // AuthContext logout() now handles all cleanup including demo state
      await logout();
      success('Successfully logged out. See you soon! 👋');
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
      showError('Failed to logout. Please try again.');
    }
  };

  // Close mobile menu when navigating (route change)
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open (helps on iOS Safari)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (menuOpen) {
      // Save scroll position to restore later
      const scrollY = window.scrollY || window.pageYOffset;
      document.body.style.top = `-${scrollY}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (top) {
        const scrollY = parseInt(top.replace('-', '').replace('px', '')) || 0;
        window.scrollTo(0, scrollY);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [menuOpen]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg sticky top-0 z-[100] border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🤖</span>
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              OA AI Tracker
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/projects"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/projects')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  🚀 Projects
                </Link>
                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/profile')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  👤 Profile
                </Link>
                
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="ml-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                  aria-label="Toggle theme"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="text-2xl">
                    {isDark ? '☀️' : '🌙'}
                  </span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="ml-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  🏠 Home
                </Link>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {currentUser ? (
              <button
                onClick={() => setMenuOpen(open => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation (overlay when open) */}
      {currentUser && menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 md:hidden bg-white dark:bg-gray-900 z-[9999]"
        >
          <div className="container mx-auto px-4 py-6 h-full overflow-auto" style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="space-y-3">
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-800'
                }`}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/projects"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/projects')
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-800'
                }`}
              >
                🚀 Projects
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-800'
                }`}
              >
                👤 Profile
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="block w-full text-left px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg transition-all duration-300"
              >
                🚪 Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
