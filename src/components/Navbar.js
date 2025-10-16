import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // AuthContext logout() now handles all cleanup including demo state
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-200">
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
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/projects"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/projects')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  🚀 Projects
                </Link>
                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    isActive('/profile')
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  👤 Profile
                </Link>
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
              <Link
                to="/profile"
                className="text-gray-700 hover:text-indigo-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-indigo-600 font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {currentUser && (
        <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/dashboard"
              className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-indigo-50'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/projects"
              className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/projects')
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-indigo-50'
              }`}
            >
              🚀 Projects
            </Link>
            <Link
              to="/profile"
              className={`block px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isActive('/profile')
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-indigo-50'
              }`}
            >
              👤 Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg transition-all duration-300"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
