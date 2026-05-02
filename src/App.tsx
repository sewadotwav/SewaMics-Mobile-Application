// ============================================================
// SewaMics — Main App Entry Point
// File: src/App.tsx
//
// Ready for Phase 1: Auth Module and Navigation Setup.
// ============================================================

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { validateEnvironment } from "./config/validateEnv";

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
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>SewaMics</Text>
          <Text style={styles.subtitle}>Phase 1: Ready for Auth Setup</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
