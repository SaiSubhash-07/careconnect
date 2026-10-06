// CareConnect Firebase Cloud Configuration & Initialization
// Supports both Vite environment variables and dynamic in-app configuration via localStorage.
// Includes a graceful fallback/simulator mode so the app functions seamlessly even without live credentials.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const STORAGE_KEY = 'careconnect_custom_firebase_config';

// Default / fallback configuration reading from Vite env
const getDefaultConfig = () => {
  return {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || ''
  };
};

// Retrieve active configuration (stored in localStorage or from env)
export const getActiveFirebaseConfig = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.apiKey && parsed.projectId) {
          return { ...parsed, isCustom: true };
        }
      } catch (e) {
        console.warn('Failed to parse custom firebase config:', e);
      }
    }
  }
  return { ...getDefaultConfig(), isCustom: false };
};

// Validate if config has required keys and is not a placeholder
export const isValidFirebaseConfig = (cfg) => {
  if (!cfg) return false;
  const { apiKey, projectId, appId } = cfg;
  if (!apiKey || !projectId) return false;
  if (apiKey.includes('your_') || projectId.includes('your_')) return false;
  if (apiKey.length < 10) return false;
  return true;
};

// Initialize Firebase App & Services safely
let app = null;
let firestore = null;
let auth = null;
let isConfigured = false;
let initError = null;

try {
  const config = getActiveFirebaseConfig();
  if (isValidFirebaseConfig(config)) {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    firestore = getFirestore(app);
    auth = getAuth(app);
    isConfigured = true;
  } else {
    isConfigured = false;
  }
} catch (err) {
  console.warn('Firebase initialization note (using simulator/demo mode):', err.message);
  initError = err.message;
  isConfigured = false;
}

export const isFirebaseConfigured = isConfigured;
export const firebaseInitError = initError;
export { app, firestore, auth };

// Save custom configuration from the in-app UI
export const saveCustomFirebaseConfig = (configObj) => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configObj));
    return true;
  } catch (err) {
    console.error('Failed to save Firebase config:', err);
    return false;
  }
};

// Reset custom config back to default env
export const resetFirebaseConfig = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};
