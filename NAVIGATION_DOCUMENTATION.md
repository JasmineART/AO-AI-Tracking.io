# Navigation System Documentation

## Overview
The application uses React Router v6 for client-side routing with role-based access control.

## Navigation Structure

### Public Routes (No Authentication Required)
| Route | Page | Component | Purpose |
|-------|------|-----------|---------|
| `/` | Home | `pages/Home.js` | Landing page with feature overview |
| `/login` | Login | `pages/Login.js` | Authentication (email, Google, GitHub, demo) |

### Protected Routes (Authentication Required)
| Route | Page | Component | Purpose |
|-------|------|-----------|---------|
| `/dashboard` | Dashboard | `pages/Dashboard.js` | AI readiness metrics & analytics |
| `/projects` | Projects | `pages/Projects.js` | Project management & creation |
| `/project/:projectId` | Project Detail | `pages/ProjectDetail.js` | Individual project details |
| `/profile` | Profile | `pages/Profile.js` | User account settings |
| `/system-status` | System Status | `pages/SystemStatus.js` | System health & diagnostics |

## Navigation Buttons

### Desktop Navigation (Navbar.js)
**When Logged Out:**
- 🏠 Home
- Login (button)

**When Logged In:**
- 📊 Dashboard
- 🚀 Projects
- 👤 Profile
- ☀️/🌙 Theme Toggle
- Logout (button)

### Mobile Navigation
- Hamburger menu button
- Same items as desktop in slide-out menu
- Auto-closes on route change

## Active State Highlighting
Navigation items highlight when their route is active. Example:
- `/dashboard` → "📊 Dashboard" button highlighted
- `/projects` → "🚀 Projects" button highlighted

## Protected Routes
The `<ProtectedRoute>` component wraps authenticated pages. If a non-authenticated user tries to access:
1. They're redirected to `/login`
2. After login, they're redirected back to the requested page

## Authentication Methods in Login
1. **Email/Password** - Traditional credentials
2. **Google OAuth** - Sign in with Google account
3. **GitHub OAuth** - Sign in with GitHub account
4. **Demo Mode** - Try the app without creating account

## Code Organization
- **Config**: `src/utils/navigationConfig.js` - Route constants and menu items
- **Component**: `src/components/Navbar.js` - Navigation UI
- **Pages**: `src/pages/*.js` - Page components
- **Protection**: `src/components/ProtectedRoute.js` - Access control
- **Auth**: `src/contexts/AuthContext.js` - User state management

## Quick Navigation Flow
```
User starts at /
  ├─→ Not logged in? Show Home with Login button
  │   └─→ Click Login → Go to /login page
  │       ├─→ Sign up/in successfully
  │       └─→ Redirected to /dashboard
  │
  └─→ Already logged in? Show Dashboard nav items
      ├─→ 📊 Dashboard: View analytics
      ├─→ 🚀 Projects: Manage projects
      │   └─→ Click project → /project/:id (detail view)
      └─→ 👤 Profile: View settings
```
