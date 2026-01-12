/**
 * Firebase Configuration
 * This file initializes Firebase services for the Gallery Creator app
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Debug: Log config status on client
if (typeof window !== 'undefined') {
    console.log('🔥 Firebase Config:', {
        apiKey: firebaseConfig.apiKey ? '✅ Loaded from env' : '❌ Missing',
        projectId: firebaseConfig.projectId || 'Missing',
    });
}

// Initialize Firebase (prevent duplicate initialization in development)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
}

export { auth, db, storage };
export default app;
