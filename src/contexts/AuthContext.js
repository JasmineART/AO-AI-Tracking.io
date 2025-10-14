import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, githubProvider, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Save user data to Firestore
  const saveUserToDatabase = async (user) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      // Only create/update if user doesn't exist or needs updating
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL || null,
        lastLogin: serverTimestamp(),
      };

      if (!userSnap.exists()) {
        // New user - add createdAt timestamp
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          projects: [],
          preferences: {
            theme: 'light',
            notifications: true
          }
        });
        console.log('✅ New user created in database:', user.email);
      } else {
        // Existing user - update last login
        await setDoc(userRef, userData, { merge: true });
        console.log('✅ User login updated in database:', user.email);
      }

      return userData;
    } catch (error) {
      console.error('❌ Error saving user to database:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToDatabase(result.user);
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await saveUserToDatabase(result.user);
      return result;
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToDatabase(result.user);
      return result;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName = null) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userWithName = {
        ...result.user,
        displayName: displayName || email.split('@')[0]
      };
      await saveUserToDatabase(userWithName);
      return result;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isDemo) {
        // Save/update user in database on auth state change
        await saveUserToDatabase(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
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
