import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Live Firebase configuration object for 619 db-5ec0b app
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC8zuPvM5L84n2dQ8o0KyEN04qNRANSIZc',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'db-5ec0b.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'db-5ec0b',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'db-5ec0b.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '345834042555',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:345834042555:web:fde7fd051a6e6ea040659e',
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Get Auth instance — on native we use inMemoryPersistence since firebase/auth/react-native
// was removed in firebase v12. Our AuthContext uses AsyncStorage independently for session persistence.
export const auth = getAuth(app);

// On native, switch to inMemoryPersistence so Firebase Auth does not try to
// access localStorage (which doesn't exist on Android/iOS and causes crash on open)
if (Platform.OS !== 'web') {
  setPersistence(auth, inMemoryPersistence).catch(() => {});
}

export const db = getFirestore(app);
export default app;
