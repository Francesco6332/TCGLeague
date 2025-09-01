import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 

// Firebase configuration - these will be environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdefghijk',
};

// Check if we're in development mode without Firebase config
const isDevelopmentMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
                         import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Show warning in development mode
if (isDevelopmentMode && typeof window !== 'undefined') {
  console.warn('⚠️  Running in development mode with demo Firebase config');
  console.warn('📝  Please set up your Firebase configuration in .env file for full functionality');
  console.warn('🔗  See env.example for required environment variables');
}

export default app;
