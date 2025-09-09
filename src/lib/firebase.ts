
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
let app: FirebaseApp;
let auth: Auth;

// Check if all required environment variables are set
const firebaseKeysAreSet = firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId;

if (firebaseKeysAreSet) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
} else {
    // Provide mock instances if Firebase is not configured
    // This allows the app to run without crashing
    console.warn("Firebase config is missing or incomplete. Firebase services will be disabled.");
    app = {} as FirebaseApp;
    auth = {} as Auth;
}


export { app, auth };
