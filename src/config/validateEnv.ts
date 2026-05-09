/**
 * SewaMics — Environment Validation
 * File: src/config/validateEnv.ts
 * 
 * Ensures all required EXPO_PUBLIC_ Firebase environment variables 
 * are defined before the app initializes.
 */

export function validateEnvironment(): void {
  const requiredVars = [
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "EXPO_PUBLIC_FIREBASE_APP_ID",
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName] || process.env[varName]?.trim() === ""
  );

  if (missingVars.length > 0) {
    const errorMsg = `[Environment Error] The following required variables are missing: \n${missingVars.join("\n")}`;
    throw new Error(errorMsg);
  }

  console.log("✓ Environment validation passed");
}
