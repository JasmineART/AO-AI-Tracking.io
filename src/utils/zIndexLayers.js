/**
 * Centralized Z-Index Management
 * Prevents stacking context collisions across the application
 * 
 * Hierarchy (lowest to highest):
 * - Base content: no z-index specified
 * - Modals & backdrops: 40-41
 * - Navbar: 100
 * - Mobile Menu Overlay: 9999 (covers all content including modals)
 * - Toast notifications: 9999+ (highest, should float above everything)
 */

export const Z_INDEX = {
  // Modal and overlay layers
  MODAL_BACKDROP: 40,
  MODAL: 41,
  
  // Navigation (sticky header)
  NAVBAR: 100,
  
  // Mobile menu overlay (must be above modals and content)
  MOBILE_MENU: 9999,
  
  // Notifications (highest priority - always visible)
  TOAST: 10000,
};

export default Z_INDEX;
