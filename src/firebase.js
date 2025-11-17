import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration using environment variables
// Note: Firebase API keys are safe to expose in client-side code
// as they only identify your Firebase project. Security is enforced
// through Firebase Security Rules on the backend.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCzyBwFrRvqoMcspj7lIYpiR3nRa7Bcy00",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "oa-ai-dash.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://oa-ai-dash-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "oa-ai-dash",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "oa-ai-dash.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1036320496271",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1036320496271:web:ef72456abd7bcf3f02aefa",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GKETS43FTH"
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete. Check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics only if enabled
let analytics = null;
if (process.env.REACT_APP_ENABLE_ANALYTICS !== 'false' && typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization skipped:', error.message);
  }
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set auth persistence to LOCAL (persists even when browser is closed)
// This prevents users from being logged out after closing/refreshing the browser
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Firebase Auth persistence set to LOCAL');
    }
  })
  .catch((error) => {
    console.error('❌ Error setting auth persistence:', error);
  });

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure OAuth providers for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

githubProvider.setCustomParameters({
  allow_signup: 'true'
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Realtime Database and get a reference to the service
export const realtimeDb = getDatabase(app);

export { analytics };
export default app;
