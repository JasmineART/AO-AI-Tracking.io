import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase';
import { saveUserToRealtimeDb } from '../utils/realtimeDatabase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Network error handling helper
  const isNetworkError = (error) => {
    return (
      error.code === 'auth/network-request-failed' ||
      error.message?.includes('network') ||
      error.message?.includes('offline') ||
      !navigator.onLine
    );
  };

  // Retry mechanism for network failures
  const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (!isNetworkError(error) || i === maxRetries - 1) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  };

  // Save user data to Realtime Database
  const saveUserToDatabase = async (user) => {
    if (!user) return;

    try {
      await saveUserToRealtimeDb(user);
    } catch (error) {
      console.error('❌ Error saving user to database:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await retryOperation(async () => {
        return await signInWithPopup(auth, googleProvider);
      });
      await saveUserToDatabase(result.user);
      setAuthError(null);
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      if (isNetworkError(error)) {
        const networkError = new Error('Network connection failed. Please check your internet connection and try again.');
        networkError.code = 'auth/network-error';
        setAuthError(networkError);
        throw networkError;
      }
      setAuthError(error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      const result = await retryOperation(async () => {
        return await signInWithPopup(auth, githubProvider);
      });
      await saveUserToDatabase(result.user);
      setAuthError(null);
      return result;
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      if (isNetworkError(error)) {
        const networkError = new Error('Network connection failed. Please check your internet connection and try again.');
        networkError.code = 'auth/network-error';
        setAuthError(networkError);
        throw networkError;
      }
      setAuthError(error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await retryOperation(async () => {
        return await signInWithEmailAndPassword(auth, email, password);
      });
      await saveUserToDatabase(result.user);
      setAuthError(null);
      return result;
    } catch (error) {
      console.error('Error signing in with email:', error);
      if (isNetworkError(error)) {
        const networkError = new Error('Network connection failed. Please check your internet connection and try again.');
        networkError.code = 'auth/network-error';
        setAuthError(networkError);
        throw networkError;
      }
      setAuthError(error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName = null) => {
    try {
      const result = await retryOperation(async () => {
        return await createUserWithEmailAndPassword(auth, email, password);
      });
      const userWithName = {
        ...result.user,
        displayName: displayName || email.split('@')[0]
      };
      await saveUserToDatabase(userWithName);
      setAuthError(null);
      return result;
    } catch (error) {
      console.error('Error signing up with email:', error);
      if (isNetworkError(error)) {
        const networkError = new Error('Network connection failed. Please check your internet connection and try again.');
        networkError.code = 'auth/network-error';
        setAuthError(networkError);
        throw networkError;
      }
      setAuthError(error);
      throw error;
    }
  };

  const logout = async () => {
    // If the current user is a demo user we only need to clear local state
    if (currentUser && currentUser.isDemo) {
      try {
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoData'); // Clear all demo data
      } catch (err) {
        console.warn('Could not remove demo data from localStorage:', err);
      }
      setCurrentUser(null);
      return Promise.resolve();
    }

    // Otherwise perform a normal Firebase sign out and clear local state
    try {
      await signOut(auth);
      setCurrentUser(null);
      return Promise.resolve();
    } catch (error) {
      console.error('\u274c Error during sign out:', error);
      throw error;
    }
  };

  // Demo login function
  const demoLogin = () => {
    const demoUser = {
      uid: 'demo-user-123',
      email: 'demo@oaitracker.com',
      displayName: 'Demo User',
      photoURL: null,
      isDemo: true
    };
    setCurrentUser(demoUser);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    return Promise.resolve(demoUser);
  };

  useEffect(() => {
    // Check for demo user in localStorage
    const storedDemoUser = localStorage.getItem('demoUser');
    if (storedDemoUser) {
      setCurrentUser(JSON.parse(storedDemoUser));
      setLoading(false);
      return;
    }

    // Monitor network connectivity and attempt to recover auth state
    const handleOnline = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Network reconnected, auth state will be restored');
      }
      // Force auth state check when coming back online
      if (auth.currentUser) {
        setCurrentUser(auth.currentUser);
        saveUserToDatabase(auth.currentUser).catch(error => {
          console.error('Error saving user after reconnection:', error);
        });
      }
    };

    const handleOffline = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Network disconnected, auth state preserved locally');
      }
      setAuthError(new Error('You are currently offline. Some features may be limited.'));
    };

    // Add network event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isDemo) {
        try {
          // Save/update user in database on auth state change
          await saveUserToDatabase(user);
          setAuthError(null);
        } catch (error) {
          // Don't fail auth state update if database save fails
          console.error('Error saving user to database:', error);
          if (!isNetworkError(error)) {
            setAuthError(error);
          }
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    currentUser,
    authError,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
    demoLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
