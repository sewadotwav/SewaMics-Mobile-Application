// ============================================================
// SewaMics — Main App Entry Point
// File: src/App.tsx
//
// Ready for Phase 1: Auth Module and Navigation Setup.
// ============================================================

import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { validateEnvironment } from "./config/validateEnv";
import { AuthProvider } from "./context/AuthContext";
import { RootNavigator } from "./navigation/RootNavigator";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Zalando-ExtraLight": require("../assets/Zalando_Sans_SemiExpanded/static/ZalandoSansSemiExpanded-ExtraLight.ttf"), // 200
    "Zalando-Light": require("../assets/Zalando_Sans_SemiExpanded/static/ZalandoSansSemiExpanded-Light.ttf"),           // 300
    "Zalando-Regular": require("../assets/Zalando_Sans_SemiExpanded/static/ZalandoSansSemiExpanded-Regular.ttf"),       // 400
    "Zalando-Medium": require("../assets/Zalando_Sans_SemiExpanded/static/ZalandoSansSemiExpanded-Medium.ttf"),         // 500
    "Zalando-SemiBold": require("../assets/Zalando_Sans_SemiExpanded/static/ZalandoSansSemiExpanded-SemiBold.ttf"),     // 600
    "Zalando-Bold": require("../assets/Zalando_Sans_SemiExpanded/static/ZalandoSansSemiExpanded-Bold.ttf"),             // 700
  });

  useEffect(() => {
    try {
      validateEnvironment();
      console.log("Firebase environment validated.");
    } catch (error) {
      console.error("Environment Validation Error:", error);
    }
  }, []);

  if (!fontsLoaded) {
    return null; // Return null (or a splash screen) until fonts are ready
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
