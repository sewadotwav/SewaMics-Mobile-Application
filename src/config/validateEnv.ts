// ============================================================
// SewaMics — Environment Validation (Mobile App)
// File: src/config/validateEnv.ts
//
// Validates that all required EXPO_PUBLIC_ Firebase environment
// variables are present before the mobile app initializes.
//
// NOTE: REACT_APP_ prefixed vars are for the future React
// web admin dashboard — not validated here.
// ============================================================

export function validateEnvironment(): void {
  const requiredVars: Record<string, string | undefined> = {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value || value.trim() === "")
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `[validateEnv] Missing env vars: ${missingVars.join(", ")}`
    );
  }

  console.log("✓ Environment validation passed");
}
