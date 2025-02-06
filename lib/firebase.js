// lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC-i5LEh9oRNKx9pwIqP_Je1GZYniYm5kQ",
    authDomain: "bemyvalentine-779d1.firebaseapp.com",
    projectId: "bemyvalentine-779d1",
    storageBucket: "bemyvalentine-779d1.firebasestorage.app",
    messagingSenderId: "55959568304",
    appId: "1:55959568304:web:6f8f3c12e6eb061096e075",
    measurementId: "G-SX7KKZYE0G"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };