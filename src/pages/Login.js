import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { initializeDemoData } from '../utils/demoData';
import { 
  validateAndSanitize, 
  createLoginRateLimiter,
  isValidEmail 
} from '../utils/security';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, demoLogin } = useAuth();
  const { success, error: showError, warning } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const loginRateLimiter = createLoginRateLimiter();

  useEffect(() => {
    // Check if demo mode is requested
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === 'true') {
      handleDemoLogin();
    }
  }, [location]);

  const checkRateLimit = () => {
    if (!loginRateLimiter.isAllowed()) {
      const timeLeft = Math.ceil(loginRateLimiter.getTimeUntilReset() / 60000);
      setRateLimitError(`Too many login attempts. Please try again in ${timeLeft} minute${timeLeft > 1 ? 's' : ''}.`);
      return false;
    }
    setRateLimitError('');
    return true;
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      initializeDemoData(); // Initialize demo data
      await demoLogin();
      success('Welcome to Demo Mode! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login with demo account');
      showError('Failed to login with demo account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!checkRateLimit()) return;
    
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      loginRateLimiter.reset(); // Reset on successful login
      success('Successfully signed in with Google! 🎉');
      navigate('/dashboard');
    } catch (err) {
      loginRateLimiter.recordAttempt();
      setError('Failed to sign in with Google: ' + err.message);
      showError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    if (!checkRateLimit()) return;
    
    try {
      setLoading(true);
      setError('');
      await signInWithGithub();
      loginRateLimiter.reset(); // Reset on successful login
      success('Successfully signed in with GitHub! 🎉');
      navigate('/dashboard');
    } catch (err) {
      loginRateLimiter.recordAttempt();
      setError('Failed to sign in with GitHub: ' + err.message);
      showError('Failed to sign in with GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkRateLimit()) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Validate email
      const emailValidation = validateAndSanitize(email, {
        type: 'email',
        required: true,
        maxLength: 254
      });
      
      if (!emailValidation.valid) {
        setError(emailValidation.error);
        setLoading(false);
        return;
      }
      
      // Validate password
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long');
        warning('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      
      // Sanitize email
      const sanitizedEmail = emailValidation.sanitized;
      
      if (isSignUp) {
        await signUpWithEmail(sanitizedEmail, password);
        success('Account created successfully! Welcome! 🎉');
      } else {
        await signInWithEmail(sanitizedEmail, password);
        success('Successfully signed in! 🎉');
      }
      
      loginRateLimiter.reset(); // Reset on successful login
      navigate('/dashboard');
    } catch (err) {
      loginRateLimiter.recordAttempt();
      setError(err.message);
      showError(isSignUp ? 'Failed to create account' : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/50 animate-scaleIn">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
            <span className="text-4xl">🤖</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">{isSignUp ? 'Create Account' : 'Welcome Back'}</span>
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Join the AI revolution today' : 'Continue your AI journey'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fadeInDown shadow-md">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        {rateLimitError && (
          <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 px-4 py-3 rounded-lg mb-4 animate-fadeInDown shadow-md">
            <p className="font-medium">🔒 {rateLimitError}</p>
          </div>
        )}

        {/* Demo Login Button */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold mb-4 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-1 transform flex items-center justify-center gap-2"
        >
          <span className="text-xl">🎮</span> Try Demo Account
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-1"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign {isSignUp ? 'up' : 'in'} with Google
          </button>

          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-800 hover:shadow-lg transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
            Sign {isSignUp ? 'up' : 'in'} with GitHub
          </button>
        </div>

        {/* Database Info Notice */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Your Data is Secure</p>
              <p className="text-sm text-blue-700">
                All account information is automatically saved to our secure Firebase Realtime Database and protected by Google Cloud security.
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or use email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white pr-12"
                placeholder="••••••••"
                id="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm5.31-7.78l3.15 3.15.02-.02c.68-.52 1.21-1.17 1.56-1.9zM20.97 11.56c.05.21.08.42.08.64 0 1.66-1.34 3-3 3-.22 0-.43-.03-.64-.08l-6-6c.05-.21.08-.42.08-.64 0-1.66-1.34-3-3-3-.22 0-.43.03-.64.08l6 6z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
          >
            {loading ? '⏳ Please wait...' : (isSignUp ? '🚀 Create Account' : '🔓 Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-all duration-300"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
