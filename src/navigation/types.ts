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

// ── 2. Home Stack ─────────────────────────────────────────────
export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
};

// ── 3. Catalog Stack ──────────────────────────────────────────
export type CatalogStackParamList = {
  Catalog: undefined;
  ProductDetail: { productId: string };
};

// ── 4. Bottom Tab Stack ───────────────────────────────────────
export type BottomTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CatalogTab: NavigatorScreenParams<CatalogStackParamList>;
  CartTab: undefined;
  OrdersStack: NavigatorScreenParams<OrdersStackParamList>;
  ProfileTab: undefined;
};

// ── 5. App Stack (Authenticated) ──────────────────────────────
export type AppStackParamList = {
  BottomTabs: NavigatorScreenParams<BottomTabParamList>;
  ProductDetail: { productId: string };
  Profile: undefined;
  EditProfile: undefined;
  CheckoutStack: NavigatorScreenParams<CheckoutStackParamList>;
};

// ── 6. Root Stack (Top-level) ─────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

// ── Navigation Hook Types ─────────────────────────────────────
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<BottomTabParamList>;
export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type CatalogNavigationProp = NativeStackNavigationProp<CatalogStackParamList>;

// ── Route Prop Types ──────────────────────────────────────────
export type ProductDetailRouteProp = RouteProp<AppStackParamList, "ProductDetail">;
export type HomeProductDetailRouteProp = RouteProp<HomeStackParamList, "ProductDetail">;
export type CatalogProductDetailRouteProp = RouteProp<CatalogStackParamList, "ProductDetail">;

// ── 7. Checkout Stack ─────────────────────────────────────────
export type CheckoutStackParamList = {
  Checkout: { step: 'shipping' | 'payment' | 'review' };
  OrderConfirmation: { orderId: string };
};

// ── 8. Orders Stack ───────────────────────────────────────────
export type OrdersStackParamList = {
  Orders: undefined;
  OrderDetail: { orderId: string };
};

export type CheckoutNavigationProp = NativeStackNavigationProp<CheckoutStackParamList>;
export type OrdersNavigationProp = NativeStackNavigationProp<OrdersStackParamList>;
