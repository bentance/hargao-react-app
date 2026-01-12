/**
 * Firebase Authentication Service
 * Handles user registration and authentication
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    deleteUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, DEFAULT_USER } from '@/types/firebase';

/**
 * Check if username is available
 * Uses a separate 'usernames' collection for fast lookup
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
    try {
        const normalizedUsername = username.toLowerCase().trim();
        const usernameDoc = await getDoc(doc(db, 'usernames', normalizedUsername));
        return !usernameDoc.exists();
    } catch (error: any) {
        console.error('❌ Error checking username:', error.message);
        throw error;
    }
}

/**
 * Reserve a username (called during registration)
 */
async function reserveUsername(username: string, uid: string): Promise<void> {
    const normalizedUsername = username.toLowerCase().trim();
    await setDoc(doc(db, 'usernames', normalizedUsername), {
        uid: uid,
        createdAt: serverTimestamp(),
    });
}

/**
 * Register a new user with email and password
 * Creates both Firebase Auth user and Firestore user document
 */
export async function registerUser(
    email: string,
    password: string,
    username: string,
    displayName: string,
    photoURL?: string | null,
    bio?: string,
    links?: { website?: string; instagram?: string }
): Promise<{ user: FirebaseUser; userData: User }> {
    const normalizedUsername = username.toLowerCase().trim();

    try {
        // 1. Check if username is available FIRST
        const usernameAvailable = await isUsernameAvailable(normalizedUsername);
        if (!usernameAvailable) {
            throw { code: 'auth/username-taken', message: 'This username is already taken. Please choose another.' };
        }

        // 2. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        try {
            // 3. Reserve the username
            await reserveUsername(normalizedUsername, firebaseUser.uid);

            // 4. Create user document in Firestore
            const userData: User = {
                ...DEFAULT_USER,
                uid: firebaseUser.uid,
                email: email,
                username: normalizedUsername,
                displayName: displayName || username,
                photoURL: photoURL || null,
                bio: bio || '',
                links: {
                    website: links?.website || null,
                    instagram: links?.instagram || null,
                    twitter: null,
                    youtube: null,
                },
                tier: 'free',
                maxGalleries: 3,
                galleriesCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // 5. Save user to Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...userData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            console.log('✅ User registered successfully:', firebaseUser.uid);
            return { user: firebaseUser, userData };
        } catch (innerError) {
            // If anything fails after Auth user creation, clean up
            console.error('❌ Registration cleanup - deleting auth user');
            await deleteUser(firebaseUser);
            throw innerError;
        }
    } catch (error: any) {
        console.error('❌ Registration error:', error.code, error.message);
        throw error;
    }
}

/**
 * Sign in an existing user
 */
export async function signInUser(email: string, password: string): Promise<FirebaseUser> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ User signed in:', userCredential.user.uid);
        return userCredential.user;
    } catch (error: any) {
        console.error('❌ Sign in error:', error.code, error.message);
        throw error;
    }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
    try {
        await signOut(auth);
        console.log('✅ User signed out');
    } catch (error: any) {
        console.error('❌ Sign out error:', error.code, error.message);
        throw error;
    }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<User | null> {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        }
        return null;
    } catch (error: any) {
        console.error('❌ Error fetching user data:', error.message);
        throw error;
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}
