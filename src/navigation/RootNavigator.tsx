// ============================================================
// SewaMics — Root Navigator
// File: src/navigation/RootNavigator.tsx
//
// Handles app navigation flow depending on whether the user
// is authenticated or not.
// ============================================================

import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Stack = createNativeStackNavigator();

// Temporary Placeholder Screens (Will be replaced later)
const PlaceholderLoginScreen = () => <View style={{flex: 1, backgroundColor: 'white'}} />
const PlaceholderHomeScreen = () => <View style={{flex: 1, backgroundColor: 'white'}} />

export const RootNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // Show a loading spinner while Firebase initializes
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated Screens
          <Stack.Group>
            {/* TODO: Add Home, Profile, etc. */}
            <Stack.Screen name="Home" component={PlaceholderHomeScreen} />
          </Stack.Group>
        ) : (
          // Unauthenticated Screens
          <Stack.Group>
            {/* TODO: Add Login, Signup, etc. */}
            <Stack.Screen name="Login" component={PlaceholderLoginScreen} />
          </Stack.Group>
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
    backgroundColor: "#f5f5f5",
  },
});
