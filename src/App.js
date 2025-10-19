import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import SystemStatus from './pages/SystemStatus';
import errorMonitor from './utils/errorMonitoring';
import healthCheck from './utils/healthCheck';

function App() {
  // Initialize error monitoring on app start
  useEffect(() => {
    errorMonitor.init();
    
    // Run initial health check in background
    healthCheck.runFullCheck().catch(error => {
      console.error('Initial health check failed:', error);
    });

    // Log app initialization
    console.log('✅ App initialized with monitoring enabled');
  }, []);

  // Use basename for GitHub Pages deployment. Only use the repo basename
  // if the current URL actually starts with it (this handles both GitHub Pages
  // production and local development cases correctly without relying on
  // NODE_ENV which can be misconfigured).
  const REPO_BASENAME = '/AO-AI-Tracking.io';
  let basename = '';
  
  // Check if the current pathname starts with the repo basename
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.pathname.startsWith(REPO_BASENAME)) {
      basename = REPO_BASENAME;
    }
    // Otherwise leave basename as empty string for local dev at root path
  }
  
  return (
    <ErrorBoundary>
      <Router basename={basename}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system-status"
                element={
                  <ProtectedRoute>
                    <SystemStatus />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
