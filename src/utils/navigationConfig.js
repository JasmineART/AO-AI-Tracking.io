/**
 * Navigation Configuration
 * Centralized navigation routes and menu items for consistency
 * This makes it easier to maintain nav items across the app
 */

export const NAV_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/project/:projectId',
  PROFILE: '/profile',
  SYSTEM_STATUS: '/system-status'
};

/**
 * Main navigation menu items
 * Includes: path, label, emoji icon, and protection status
 */
export const AUTHENTICATED_NAV_ITEMS = [
  {
    path: NAV_ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: '📊',
    description: 'View AI readiness metrics and project overview',
    protected: true
  },
  {
    path: NAV_ROUTES.PROJECTS,
    label: 'Projects',
    icon: '🚀',
    description: 'Manage and track all AI/automation projects',
    protected: true
  },
  {
    path: NAV_ROUTES.PROFILE,
    label: 'Profile',
    icon: '👤',
    description: 'View and manage your account settings',
    protected: true
  }
];

export const UNAUTHENTICATED_NAV_ITEMS = [
  {
    path: NAV_ROUTES.HOME,
    label: 'Home',
    icon: '🏠',
    description: 'Return to homepage',
    protected: false
  }
];

/**
 * Get full button text with icon
 * @param {string} icon - Emoji icon
 * @param {string} label - Button label
 * @returns {string} Full button text
 */
export const getButtonText = (icon, label) => `${icon} ${label}`;
