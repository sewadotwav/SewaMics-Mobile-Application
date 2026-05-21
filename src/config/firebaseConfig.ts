import { initializeApp, getApps, FirebaseApp } from "firebase/app";
// @ts-ignore - TS sometimes fails to find this export in Firebase v10 depending on tsconfig, but it works at runtime
import { initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// ─────────────────────────────────────────────
// ENVIRONMENT VARIABLE HELPERS
// Supports both React (REACT_APP_) and
// Expo (EXPO_PUBLIC_) prefixes automatically.
// ─────────────────────────────────────────────

function getEnvVar(reactKey: string, expoKey: string): string {

  const reactValue =
    typeof process !== "undefined" ? process.env[reactKey] : undefined;


  const expoValue =
    typeof process !== "undefined" ? process.env[expoKey] : undefined;

  const value = reactValue ?? expoValue;

  if (!value) {
    throw new Error(
      `[SewaMics] Missing environment variable.\n` +
        `  React key : ${reactKey}\n` +
        `  Expo key  : ${expoKey}\n` +
        `  Add one of these to your .env.local file.`
    );
  }
  return value;
}

// ─────────────────────────────────────────────
// FIREBASE CONFIG
// Reads from environment variables at runtime.
// ─────────────────────────────────────────────

function buildFirebaseConfig() {
  try {
    return {
      apiKey: getEnvVar(
        "REACT_APP_FIREBASE_API_KEY",
        "EXPO_PUBLIC_FIREBASE_API_KEY"
      ),
      authDomain: getEnvVar(
        "REACT_APP_FIREBASE_AUTH_DOMAIN",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"
      ),
      projectId: getEnvVar(
        "REACT_APP_FIREBASE_PROJECT_ID",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID"
      ),
      storageBucket: getEnvVar(
        "REACT_APP_FIREBASE_STORAGE_BUCKET",
        "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"
      ),
      messagingSenderId: getEnvVar(
        "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
        "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
      ),
      appId: getEnvVar(
        "REACT_APP_FIREBASE_APP_ID",
        "EXPO_PUBLIC_FIREBASE_APP_ID"
      ),

      measurementId:
        process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ??
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ??
        undefined,
    };
  } catch (error) {

    console.error("[SewaMics] Firebase configuration error:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────
// FIREBASE APP INITIALIZATION
// Guards against duplicate initialization
// (common in hot-reload / SSR environments).
// ─────────────────────────────────────────────

function initializeFirebase(): FirebaseApp {

  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    const config = buildFirebaseConfig();
    const app = initializeApp(config);
    console.log("[SewaMics] Firebase initialized successfully.");
    return app;
  } catch (error) {
    console.error("[SewaMics] Failed to initialize Firebase:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────
// EXPORTED FIREBASE INSTANCES
// Import these throughout the app — do NOT
// call initializeApp() anywhere else.
// ─────────────────────────────────────────────

/** Initialized Firebase app instance */
export const app: FirebaseApp = initializeFirebase();

/** Firebase Authentication instance (with AsyncStorage persistence) */
export const auth: Auth = (() => {
  const { getAuth } = require("firebase/auth");
  const existingApp = getApps().length > 0 ? getApps()[0] : app;
  

  try {
    return initializeAuth(existingApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {

    return getAuth(existingApp);
  }
})();

/** Firestore database instance */
export const db: Firestore = getFirestore(app);

/** Firebase Storage instance */
export const storage: FirebaseStorage = getStorage(app);

// ─────────────────────────────────────────────
// NAMED FUNCTION EXPORTS
// Use these if you need to get instances lazily.
// ─────────────────────────────────────────────

/** Returns the Firestore instance */
export { getFirestore } from "firebase/firestore";

/** Returns the Firebase Storage instance */
export { getStorage } from "firebase/storage";
