/**
 * Navbar Component
 * 
 * Navigation bar with:
 * - Responsive design (desktop & mobile)
 * - Authentication-aware menu items
 * - User dropdown menu (Profile)
 * - Dark/light theme toggle
 * - Mobile slide-out menu with organized sections
 * 
 * Desktop Navigation: Home, Projects, Dashboard | Profile Dropdown | Theme | Logout
 * Mobile Navigation: Full sidebar with all pages organized by section
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import Z_INDEX from '../utils/zIndexLayers';
import { AUTHENTICATED_NAV_ITEMS, UNAUTHENTICATED_NAV_ITEMS } from '../utils/navigationConfig';

const Navbar = () => {
  // ============ Contexts & Hooks ============
  const { currentUser, logout } = useAuth();
  const { success, error: showError } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // ============ Local State ============
  /** Controls mobile menu visibility */
  const [menuOpen, setMenuOpen] = useState(false);
  /** Controls user dropdown menu on desktop */
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ============ Event Handlers ============
  /**
   * Handles user logout
   * - Clears authentication state
   * - Shows success message
   * - Redirects to home page
   */
  const handleLogout = async () => {
    try {
      // AuthContext logout() handles all cleanup including demo state
      await logout();
      success('Successfully logged out. See you soon! 👋');
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
      showError('Failed to logout. Please try again.');
    }
  };

  // ============ Effects ============
  /**
   * Close mobile menu and user dropdown when route changes
   */
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  /**
   * Lock body scroll when mobile menu is open
   * Prevents background scrolling on mobile devices (especially iOS Safari)
   * Restores scroll position on menu close
   */
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

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('[data-user-menu]')) {
        setUserMenuOpen(false);
      }
    };
    
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  /**
   * Check if a path matches current location
   * Used to highlight active navigation items
   * @param {string} path - Route path to check
   * @returns {boolean} True if path is active
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Desktop nav link styling
  const navLinkClass = (path) => {
    const isActiveLink = isActive(path);
    return `px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
      isActiveLink
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
        : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
    }`;
  };

  // Mobile nav link styling (for sidebar menu)
  const mobileNavLinkClass = (path) => {
    const isActiveLink = isActive(path);
    return `block w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${
      isActiveLink
        ? 'bg-indigo-600 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;
  };

  // ============ Render ============
  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg sticky top-0 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300" style={{ zIndex: Z_INDEX.NAVBAR }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* ========== Logo / Branding ========== */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🤖</span>
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              OA AI Tracker
            </span>
          </Link>

          {/* ========== Desktop Navigation ========== */}
          {/* Shows full nav items on desktop, hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                {/* Main Navigation Items (Home, Projects, Dashboard) */}
                <div className="flex items-center gap-1">
                  {AUTHENTICATED_NAV_ITEMS.filter(item => item.section === 'main').map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={navLinkClass(item.path)}
                      title={item.description}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>
                
                {/* User Dropdown Menu */}
                <div className="relative" data-user-menu>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="ml-2 px-3 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                    title="User menu"
                    data-user-menu
                  >
                    👤
                    <span className="text-sm">Account</span>
                  </button>
                  
                  {/* Dropdown Content */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className={`block w-full text-left px-4 py-3 font-semibold transition-colors ${
                          isActive('/profile')
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        👤 Profile
                      </Link>
                      <Link
                        to="/system-status"
                        onClick={() => setUserMenuOpen(false)}
                        className={`block w-full text-left px-4 py-3 font-semibold border-t border-gray-200 dark:border-gray-700 transition-colors ${
                          isActive('/system-status')
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        ⚙️ System Status
                      </Link>
                    </div>
                  )}
                </div>
                
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
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="ml-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Unauthenticated Navigation */}
                {UNAUTHENTICATED_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={navLinkClass(item.path)}
                    title={item.description}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
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
          <div className="md:hidden flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => setMenuOpen(open => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title={menuOpen ? 'Close menu' : 'Open menu'}
                type="button"
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
              <>
                <Link
                  to="/"
                  className={navLinkClass('/')}
                >
                  🏠 Home
                </Link>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation (overlay when open) */}
      {currentUser && menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 md:hidden bg-black/50"
            onClick={() => setMenuOpen(false)}
            style={{ zIndex: Number(Z_INDEX.MOBILE_MENU) - 1 }}
            aria-hidden="true"
          />
          
          {/* Menu Container */}
          <div
            id="mobile-menu"
            className="fixed top-[64px] left-0 right-0 bottom-0 md:hidden bg-white dark:bg-gray-900 flex flex-col shadow-2xl"
            style={{ zIndex: Z_INDEX.MOBILE_MENU }}
            role="navigation"
            aria-label="Mobile menu"
          >
            {/* Close Button Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close menu"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Menu Items */}
            <nav className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-3">
                {/* Main Section */}
                <div>
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Main</h3>
                  {AUTHENTICATED_NAV_ITEMS.filter(item => item.section === 'main').map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={mobileNavLinkClass(item.path)}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      title={item.description}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>

                {/* User Section */}
                <div>
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">Account</h3>
                  {AUTHENTICATED_NAV_ITEMS.filter(item => item.section === 'user').map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={mobileNavLinkClass(item.path)}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      title={item.description}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>

                {/* Admin Section */}
                <div>
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">System</h3>
                  {AUTHENTICATED_NAV_ITEMS.filter(item => item.section === 'admin').map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={mobileNavLinkClass(item.path)}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      title={item.description}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                <div className="my-2 h-px bg-gray-200 dark:bg-gray-700" />

                {/* Theme Toggle */}
                <button
                  onClick={() => toggleTheme()}
                  className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  type="button"
                  role="menuitem"
                >
                  {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </nav>

            {/* Logout Button - Bottom */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg transition-all duration-300"
                type="button"
                role="menuitem"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
