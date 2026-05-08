// ============================================================
// SewaMics — Root Navigator
// File: src/navigation/RootNavigator.tsx
//
// Handles app navigation flow depending on whether the user
// is authenticated or not, splitting into AuthStack and AppStack.
// ============================================================

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Placeholder Screens (Will be replaced by real UI later) ---
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{name} Screen</Text>
  </View>
);

const LoginScreen = () => <PlaceholderScreen name="Login" />;
const SignupScreen = () => <PlaceholderScreen name="Signup" />;
const HomeScreen = () => <PlaceholderScreen name="Home" />;
const SearchScreen = () => <PlaceholderScreen name="Search" />;
const CartScreen = () => <PlaceholderScreen name="Cart" />;
const FavoritesScreen = () => <PlaceholderScreen name="Favorites" />;
const ProfileScreen = () => <PlaceholderScreen name="Profile" />;
// ----------------------------------------------------------------

// The main application with 5 bottom tabs
const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#9d174d",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          height: 60,
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: 5,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

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
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show a full-screen loading spinner with text while Firebase initializes
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9d174d" />
        <Text style={styles.loadingText}>Loading app...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      onUnhandledAction={(action) => {
        console.warn("Unhandled Navigation Action:", action);
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="AppRoot" component={AppStack} />
        ) : (
          <Stack.Screen name="AuthRoot" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
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
