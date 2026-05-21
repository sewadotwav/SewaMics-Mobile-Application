import { Timestamp } from "firebase/firestore";

// ─────────────────────────────────────────────
// COLLECTION NAME CONSTANTS
// ─────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  CARTS: "carts",
  ORDERS: "orders",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// ─────────────────────────────────────────────
// ENUMS / UNION TYPES
// ─────────────────────────────────────────────

export type AddressType = "home" | "work" | "other";

export type ThemePreference = "light" | "dark";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "e_wallet";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type Currency = "₱" | "PHP";

// ─────────────────────────────────────────────
// SUB-DOCUMENT INTERFACES
// ─────────────────────────────────────────────

export interface Address {
  id: string;
  type: AddressType;
  street: string;
  city: string;
  province: string;
  isDefault: boolean;
}

export interface UserPreferences {
  notifications: boolean;
  theme: ThemePreference;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  imageKey?: string;
  selectedSize?: string;
  subtotal: number;
  addedAt: Timestamp;
}

export interface OrderItem {
  productID: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageKey: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  province: string;
}

// ─────────────────────────────────────────────
// COLLECTION DOCUMENT INTERFACES
// ─────────────────────────────────────────────

/**
 * users/{uid}
 * Created on sign-up (Email or Google).
 */
export interface UserDocument {
  uid: string;
  email: string;
  name: string;
  phone: string;
  profilePicture?: string;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * products/{productId}
 * Managed via the Admin Dashboard.
 * 10 ceramic mug SKUs.
 */
export interface ProductDocument {
  productId: string;
  name: string;
  category: string;
  price: number;
  currency: Currency;
  images: string[];
  description: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  rating: number;
  reviews: number;
  specifications?: Record<string, string>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * carts/{uid}
 * One cart document per authenticated user.
 * Keyed by the same UID as users/{uid}.
 */
export interface CartDocument {
  uid: string;
  items: CartItem[];
  lastUpdated: Timestamp;
  cartTotal: number;
  itemCount: number;
}

/**
 * orders/{orderId}
 * Snapshot of cart at time of purchase.
 * Shipping address is copied — not referenced — to preserve history.
 */
export interface OrderDocument {
  orderId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: "PHP";
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Timestamp;
  shippedAt: Timestamp | null;
  deliveredAt: Timestamp | null;
  notes: string;
}

// ─────────────────────────────────────────────
// SCHEMA REGISTRY
// Maps each collection name to its document type.
// Useful for generic service utilities.
// ─────────────────────────────────────────────

export interface FirestoreSchema {
  [COLLECTIONS.USERS]: UserDocument;
  [COLLECTIONS.PRODUCTS]: ProductDocument;
  [COLLECTIONS.CARTS]: CartDocument;
  [COLLECTIONS.ORDERS]: OrderDocument;
}

// ─────────────────────────────────────────────
// INITIALIZER (structure-only, no Firebase writes)
// Call this to validate the schema is correctly
// imported and all types resolve without error.
// ─────────────────────────────────────────────

export function initializeFirestoreSchema(): {
  collections: typeof COLLECTIONS;
  description: string;
} {
  return {
    collections: COLLECTIONS,
    description:
      "SewaMics Firestore schema loaded. Collections: users, products, carts, orders.",
  };
}
