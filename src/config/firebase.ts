// src/config/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDJXpJUSZcrsT0tUWim82cXxmpN3k0gLqM",
    authDomain: "golf-buddy-2f4c3.firebaseapp.com",
    projectId: "golf-buddy-2f4c3",
    storageBucket: "golf-buddy-2f4c3.appspot.com",
    messagingSenderId: "573466180340",
    appId: "1:573466180340:web:ceff29133716d62a3a7ca1",
    measurementId: "G-CS80M213ZG"
};

// Initialize Firebase only if an instance doesn't exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;