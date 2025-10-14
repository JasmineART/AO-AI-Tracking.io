import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzyBwFrRvqoMcspj7lIYpiR3nRa7Bcy00",
  authDomain: "oa-ai-dash.firebaseapp.com",
  projectId: "oa-ai-dash",
  storageBucket: "oa-ai-dash.firebasestorage.app",
  messagingSenderId: "1036320496271",
  appId: "1:1036320496271:web:ef72456abd7bcf3f02aefa",
  measurementId: "G-GKETS43FTH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
