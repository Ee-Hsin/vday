import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
const db = getFirestore(app);
const storage = getStorage(app);

let analytics: Analytics | undefined = undefined;

// Analytics should only run in browser
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });

  // App check debug token can be seen in console during local dev
  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // need a try catch for development as Next.js hot-reloading can try to init App Check twice
  try {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (siteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
      // console.log("App Check initialized successfully.");
    } else {
      // console.warn("App Check skipped: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is missing.");
    }
  } catch (err) {
    // for during development hot-reloads, so we just ignore it
    // console.log("App Check already initialized.");
  }
}

export { app, analytics, db, storage };