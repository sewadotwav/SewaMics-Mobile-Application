// ============================================================
// SewaMics — Bottom Tab Navigator
// File: src/navigation/BottomTabNavigator.tsx
//
// Implements the exact UI matching the prototype for the
// main application tabs, including custom badges.
// ============================================================

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../services/cartService";

import { HomeScreen } from "../screens/home/HomeScreen";
import { CatalogScreen } from "../screens/catalog/CatalogScreen";
import { CartScreen } from "../screens/cart/CartScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { EditProfileScreen } from "../screens/profile/EditProfileScreen";
import { WishlistScreen } from "../screens/profile/WishlistScreen";
import { HelpSupportScreen } from "../screens/profile/HelpSupportScreen";
import { ProductDetailScreen } from "../screens/product/ProductDetailScreen";
import { OrdersScreen } from "../screens/orders/OrdersScreen";
import { OrderDetailScreen } from "../screens/orders/OrderDetailScreen";

// ----------------------------------------------------------------
// TEMPORARY PLACEHOLDER SCREENS
// ----------------------------------------------------------------
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{name} Screen</Text>
  </View>
);

// const CartScreen = () => <PlaceholderScreen name="Cart" />;
// const CartScreen = () => <PlaceholderScreen name="Cart" />;

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
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

const CatalogStack = () => (
  <Stack.Navigator screenOptions={defaultHeaderOptions}>
    <Stack.Screen name="CatalogMain" component={CatalogScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={defaultHeaderOptions}>
    <Stack.Screen name="CartMain" component={CartScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ ...defaultHeaderOptions, headerShown: false }}>
    <Stack.Screen name="OrdersMain" component={OrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

// Profile Stack — includes sub-screens
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

// ----------------------------------------------------------------
// BOTTOM TAB NAVIGATOR
// ----------------------------------------------------------------
const Tab = createBottomTabNavigator();

import { useSafeAreaInsets } from "react-native-safe-area-context";

export const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // Fetch live cart count on mount and periodically
  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const cart = await getCart(user.uid);
        if (isMounted) setCartCount(cart?.itemCount ?? 0);
      } catch {}
    };
    fetchCount();
    // Poll every 3 seconds so badge stays fresh after add-to-cart
    const interval = setInterval(fetchCount, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [user?.uid]);
  
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
          else if (route.name === "CatalogTab") iconName = "grid";
          else if (route.name === "CartTab") iconName = "shopping-cart";
          else if (route.name === "OrdersTab") iconName = "package";
          else if (route.name === "ProfileTab") iconName = "user";

          return (
            <View>
              <Feather name={iconName} size={24} color={color} />
              {route.name === "CartTab" && cartCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="CatalogTab" component={CatalogStack} options={{ tabBarLabel: "Catalog" }} />
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
    backgroundColor: "#ff914d",
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
