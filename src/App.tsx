// ============================================================
// SewaMics — Main App Entry Point
// File: src/App.tsx
//
// Ready for Phase 1: Auth Module and Navigation Setup.
// ============================================================

import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { validateEnvironment } from "./config/validateEnv";
import { AuthProvider } from "./context/AuthContext";
import { RootNavigator } from "./navigation/RootNavigator";

export default function App() {
  useEffect(() => {
    try {
      validateEnvironment();
      console.log("Firebase environment validated.");
    } catch (error) {
      console.error("Environment Validation Error:", error);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
