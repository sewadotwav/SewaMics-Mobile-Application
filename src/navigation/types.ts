/**
 * SewaMics — Navigation Types
 * File: src/navigation/types.ts
 * 
 * Centralized type definitions for all app screens to ensure 
 * type-safety when navigating between screens.
 */

import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";

// ── 1. Auth Stack ─────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// ── 2. Bottom Tab Stack ───────────────────────────────────────
export type BottomTabParamList = {
  Home: undefined;
  Catalog: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

// ── 3. App Stack (Authenticated) ──────────────────────────────
export type AppStackParamList = {
  BottomTabs: NavigatorScreenParams<BottomTabParamList>;
  ProductDetail: { productId: string };
};

// ── 4. Root Stack (Top-level) ─────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

// ── Navigation Hook Types ─────────────────────────────────────
// Use these with useNavigation() in your components
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<BottomTabParamList>;

// ── Route Prop Types ──────────────────────────────────────────
// Use these with useRoute() in your components
export type ProductDetailRouteProp = RouteProp<AppStackParamList, "ProductDetail">;
