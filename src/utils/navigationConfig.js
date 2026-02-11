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
 * Desktop: Home, Projects, Dashboard | Profile, System Status (user/system items)
 * Mobile: All items in sidebar menu
 */
export const AUTHENTICATED_NAV_ITEMS = [
  {
    path: NAV_ROUTES.HOME,
    label: 'Home',
    icon: '🏠',
    description: 'Return to homepage',
    section: 'main'
  },
  {
    path: NAV_ROUTES.PROJECTS,
    label: 'Projects',
    icon: '🚀',
    description: 'Manage and track all AI/automation projects',
    section: 'main'
  },
  {
    path: NAV_ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: '📊',
    description: 'View AI readiness metrics and project overview',
    section: 'main'
  },
  {
    path: NAV_ROUTES.PROFILE,
    label: 'Profile',
    icon: '👤',
    description: 'Manage your account settings and profile',
    section: 'user'
  },
  {
    path: NAV_ROUTES.SYSTEM_STATUS,
    label: 'System Status',
    icon: '⚙️',
    description: 'View system health and monitoring status',
    section: 'admin'
  }
];

export const UNAUTHENTICATED_NAV_ITEMS = [
  {
    path: NAV_ROUTES.HOME,
    label: 'Home',
    icon: '🏠',
    description: 'Return to homepage',
    section: 'main'
  }
];


