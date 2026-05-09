// ============================================================
// SewaMics — Bottom Tab Navigator
// File: src/navigation/BottomTabNavigator.tsx
//
// Implements the exact UI matching the prototype for the
// main application tabs, including custom badges.
// ============================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { HomeScreen } from "../screens/home/HomeScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { EditProfileScreen } from "../screens/profile/EditProfileScreen";
import { WishlistScreen } from "../screens/profile/WishlistScreen";
import { HelpSupportScreen } from "../screens/profile/HelpSupportScreen";

// ----------------------------------------------------------------
// TEMPORARY PLACEHOLDER SCREENS
// ----------------------------------------------------------------
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{name} Screen</Text>
  </View>
);

const SearchScreen = () => <PlaceholderScreen name="Search" />;
const CartScreen = () => <PlaceholderScreen name="Cart" />;
const OrdersScreen = () => <PlaceholderScreen name="Orders" />;

// ----------------------------------------------------------------
// STACK NAVIGATORS FOR EACH TAB
// ----------------------------------------------------------------
const Stack = createNativeStackNavigator();

// Shared header configuration matching prototypes
const defaultHeaderOptions = {
  headerShown: true,
  headerTitleStyle: { fontSize: 18, fontWeight: "600" as const, color: "#1f2937" },
  headerTintColor: "#9d174d",
  headerStyle: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
  },
  headerShadowVisible: false,
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ ...defaultHeaderOptions, headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator screenOptions={defaultHeaderOptions}>
    <Stack.Screen name="SearchMain" component={SearchScreen} options={{ headerTitle: "Search" }} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={defaultHeaderOptions}>
    <Stack.Screen name="CartMain" component={CartScreen} options={{ headerTitle: "Your Cart" }} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={defaultHeaderOptions}>
    <Stack.Screen name="OrdersMain" component={OrdersScreen} options={{ headerTitle: "Your Orders" }} />
  </Stack.Navigator>
);

// Profile Stack — includes sub-screens
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
  </Stack.Navigator>
);

// ----------------------------------------------------------------
// BOTTOM TAB NAVIGATOR
// ----------------------------------------------------------------
const Tab = createBottomTabNavigator();

// Temporary mock data for cart count
const CART_ITEM_COUNT = 2;

import { useSafeAreaInsets } from "react-native-safe-area-context";

// ... skipping to the component ...
export const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#9d174d",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          height: 60 + Math.max(insets.bottom, 16), // Dynamic height based on OS bottom buttons
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16), // Prevents OS buttons from overlapping
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarItemStyle: {
          paddingVertical: 4, // Helps create the 4px Icon-to-Label Spacing implicitly
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: React.ComponentProps<typeof Feather>["name"] = "home";

          if (route.name === "HomeTab") iconName = "home";
          else if (route.name === "SearchTab") iconName = "search";
          else if (route.name === "CartTab") iconName = "shopping-cart";
          else if (route.name === "OrdersTab") iconName = "package";
          else if (route.name === "ProfileTab") iconName = "user";

          return (
            <View>
              <Feather name={iconName} size={24} color={color} />
              {/* Custom exact badge implementation for Cart */}
              {route.name === "CartTab" && CART_ITEM_COUNT > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{CART_ITEM_COUNT}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="SearchTab" component={SearchStack} options={{ tabBarLabel: "Search" }} />
      <Tab.Screen name="CartTab" component={CartStack} options={{ tabBarLabel: "Cart" }} />
      <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ tabBarLabel: "Orders" }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: "Profile" }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6", // Using your Light Gray token
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b7280", // Medium Gray
  },
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#ea580c",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff", // Creates a nice cutout effect around the badge
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10, // Adjusted slightly to fit the 18px circle perfectly
    fontWeight: "700",
    textAlign: "center",
  },
});
