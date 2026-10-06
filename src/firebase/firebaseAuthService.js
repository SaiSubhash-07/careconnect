// CareConnect Firebase Authentication Service
// Supports Anonymous sign-in for emergency first responders and credential login

import { auth, isFirebaseConfigured } from './firebaseConfig';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// 1. Anonymous sign-in (ideal for quick first responder dispatch & hackathon judging)
export const signInAnonymouslyToFirebase = async () => {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: true,
      user: { uid: 'simulated-anon-' + Date.now(), isAnonymous: true, displayName: 'Responder (Demo)' },
      mode: 'simulator'
    };
  }

  try {
    const userCredential = await signInAnonymously(auth);
    return {
      success: true,
      user: userCredential.user,
      mode: 'live_cloud'
    };
  } catch (err) {
    console.warn('Anonymous Firebase auth error:', err);
    return { success: false, error: err.message };
  }
};

// 2. Email & Password sign-in
export const signInWithFirebaseEmail = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: true,
      user: { uid: 'simulated-user', email, displayName: email.split('@')[0] },
      mode: 'simulator'
    };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user,
      mode: 'live_cloud'
    };
  } catch (err) {
    console.warn('Firebase email auth error:', err);
    return { success: false, error: err.message };
  }
};

// 3. Sign out
export const signOutFromFirebase = async () => {
  if (!isFirebaseConfigured || !auth) return { success: true };
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    console.warn('Firebase signout error:', err);
    return { success: false, error: err.message };
  }
};

// 4. Subscribe to Auth State Changes
export const subscribeToFirebaseAuth = (callback) => {
  if (!isFirebaseConfigured || !auth) {
    callback({ uid: 'simulated-user', isAnonymous: true });
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// 5. Get current user
export const getCurrentFirebaseUser = () => {
  if (!isFirebaseConfigured || !auth) return null;
  return auth.currentUser;
};
