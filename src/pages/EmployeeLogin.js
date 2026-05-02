import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createLoginRateLimiter } from '../utils/security';

const EMPLOYEE_ROLES = [
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'account_manager', label: 'Account Manager' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'admin', label: 'Administrator' }
];

// Pre-configured employee demo credentials
const EMPLOYEE_CREDENTIALS = {
  customer_service: {
    email: 'cs.agent@oaitracker.com',
    password: 'CSPortal2026!',
    name: 'Jordan Rivera',
    id: 'EMP-CS-1042'
  },
  account_manager: {
    email: 'am.lead@oaitracker.com',
    password: 'AMPortal2026!',
    name: 'Taylor Morgan',
    id: 'EMP-AM-2085'
  },
  team_lead: {
    email: 'team.lead@oaitracker.com',
    password: 'TLPortal2026!',
    name: 'Alex Chen',
    id: 'EMP-TL-3011'
  },
  admin: {
    email: 'admin@oaitracker.com',
    password: 'AdminPortal2026!',
    name: 'Sam Patel',
    id: 'EMP-AD-0001'
  }
};

const EmployeeLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer_service');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signInWithGoogle, signInWithEmail, currentUser, demoLogin, employeeDemoLogin } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const rateLimiter = createLoginRateLimiter();

  // Redirect if already logged in
  if (currentUser) {
    navigate('/company-portal');
    return null;
  }

  // Auto-fill credentials when role changes
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const creds = EMPLOYEE_CREDENTIALS[role];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  // Quick sign-in with pre-configured employee credentials (demo mode)
  const handleQuickLogin = async (role) => {
    try {
      setLoading(true);
      setError('');
      await employeeDemoLogin(role);
      sessionStorage.setItem('employeeRole', role);
      sessionStorage.setItem('portalAccess', 'employee');
      const creds = EMPLOYEE_CREDENTIALS[role];
      success(`Welcome, ${creds.name}! Signed in as ${EMPLOYEE_ROLES.find(r => r.value === role)?.label}.`);
      navigate('/company-portal');
    } catch (err) {
      setError('Quick login failed. Please try manual sign-in.');
      showError('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!rateLimiter.isAllowed()) {
      const timeLeft = Math.ceil(rateLimiter.getTimeUntilReset() / 60000);
      setError(`Too many attempts. Try again in ${timeLeft} minute${timeLeft > 1 ? 's' : ''}.`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signInWithEmail(email, password);
      // Store employee role in sessionStorage for portal access
      sessionStorage.setItem('employeeRole', selectedRole);
      sessionStorage.setItem('portalAccess', 'employee');
      rateLimiter.reset();
      success('Welcome to the Employee Portal!');
      navigate('/company-portal');
    } catch (err) {
      rateLimiter.recordAttempt();
      setError('Invalid credentials. Please check your email and password.');
      showError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!rateLimiter.isAllowed()) {
      setError('Too many attempts. Please wait and try again.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      sessionStorage.setItem('employeeRole', selectedRole);
      sessionStorage.setItem('portalAccess', 'employee');
      rateLimiter.reset();
      success('Welcome to the Employee Portal!');
      navigate('/company-portal');
    } catch (err) {
      rateLimiter.recordAttempt();
      setError('Google sign-in failed: ' + err.message);
      showError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    try {
      setLoading(true);
      setError('');
      await employeeDemoLogin(selectedRole);
      sessionStorage.setItem('employeeRole', selectedRole);
      sessionStorage.setItem('portalAccess', 'employee');
      const creds = EMPLOYEE_CREDENTIALS[selectedRole];
      success(`Welcome to the Employee Portal, ${creds.name}!`);
      navigate('/company-portal');
    } catch (err) {
      setError('Demo login failed');
      showError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: '3s' }}></div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Employee Portal</h1>
          <p className="text-blue-200 text-sm">
            OA AI Tracker — Internal Access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-blue-200 text-sm font-semibold mb-1">
                Department / Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              >
                {EMPLOYEE_ROLES.map((role) => (
                  <option key={role.value} value={role.value} className="bg-slate-800 text-white">
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-blue-200 text-sm font-semibold mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-blue-200 text-sm font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing In...
                </span>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-3 text-blue-300 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Google SSO */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign In with Google (SSO)
          </button>

          {/* Demo Access */}
          <button
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300 font-semibold rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 transition-all duration-300"
          >
            🎮 Demo Access (Preview Portal)
          </button>
        </div>

        {/* Quick Sign-In with Employee Credentials */}
        <div className="mt-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            ⚡ Quick Sign-In — Employee Accounts
          </h3>
          <div className="space-y-2">
            {EMPLOYEE_ROLES.map((role) => {
              const creds = EMPLOYEE_CREDENTIALS[role.value];
              return (
                <button
                  key={role.value}
                  onClick={() => handleQuickLogin(role.value)}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all duration-200 disabled:opacity-50 group"
                >
                  <div>
                    <div className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">
                      {creds.name} <span className="text-blue-400 text-xs">({role.label})</span>
                    </div>
                    <div className="text-blue-300/70 text-xs mt-0.5">
                      {creds.email} · ID: {creds.id}
                    </div>
                  </div>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-sm">→</span>
                </button>
              );
            })}
          </div>
          <p className="text-blue-400/50 text-xs mt-3 text-center">
            Click any account above to instantly sign in
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-blue-300 text-sm">
            Need an account?{' '}
            <span className="text-white font-semibold">Contact your administrator</span>
          </p>
          <Link
            to="/"
            className="inline-block text-blue-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
