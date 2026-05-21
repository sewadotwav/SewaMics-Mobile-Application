import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { View, StyleSheet } from "react-native";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { useAuth } from "../context/AuthContext";

import { BottomTabNavigator } from "./BottomTabNavigator";
import { CheckoutStackNavigator } from "./CheckoutStackNavigator";
import { ChatbotScreen } from "../screens/profile/ChatbotScreen";

const Stack = createNativeStackNavigator();

import { SignupScreen } from "../screens/auth/SignupScreen";
import { SplashScreen } from "../screens/auth/SplashScreen";
import { OTPVerificationScreen } from "../screens/auth/OTPVerificationScreen";

// The authentication flow
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

// The main authenticated app flow
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CheckoutStack" component={CheckoutStackNavigator} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
    </Stack.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated, isFullyVerified, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      {isAuthenticated && !isFullyVerified ? (
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      ) : (
        <>
          <Stack.Screen name="AppRoot" component={AppStack} />
          <Stack.Screen name="AuthRoot" component={AuthStack} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
});
