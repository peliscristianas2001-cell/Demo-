
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth;

// Check if all required environment variables are set
const firebaseKeysAreSet = firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId;

if (firebaseKeysAreSet) {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
} else {
    console.warn("Firebase config is missing or incomplete. Firebase services will be disabled.");
}

// Initialize auth only if the app was successfully initialized
if (app) {
    auth = getAuth(app);
} else {
    // Provide a mock instance if Firebase is not configured
    auth = {} as Auth;
}


export { app, auth };
