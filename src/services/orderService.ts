// ============================================================
// SewaMics — Order Service
// File: src/services/orderService.ts
//
// Manages order documents in Firestore.
// Collection: orders/{orderId}
//
// Orders are append-only — once created, only status can be
// updated. Core fields (items, amounts, address) are immutable
// to preserve the audit trail.
// ============================================================

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebaseConfig";
import {
  COLLECTIONS,
  OrderDocument,
  OrderStatus,
  CartItem,
  Address,
  ShippingAddress,
} from "../config/firestoreSchema";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// ─────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Creates a new order document in Firestore.
 *
 * Generates a Firestore auto-ID for the orderId, writes it back
 * into the document, and returns it to the caller for navigation
 * to the order confirmation screen.
 *
 * @param userId          - Firebase Auth UID of the user placing the order
 * @param items           - Array of CartItems from the user's cart
 * @param totalAmount     - Final total including shipping (must be > 0)
 * @param shippingAddress - Delivery address selected at checkout
 * @returns The auto-generated orderId string
 * @throws If any validation fails or on Firestore write failure
 */
export async function createOrder(
  userId: string,
  items: CartItem[],
  totalAmount: number,
  shippingAddress: Address
): Promise<string> {
  try {
    // ── Validate inputs ────────────────────────────────────
    if (!userId || userId.trim() === "") {
      throw new Error("[orderService] userId must not be empty.");
    }
    if (!items || items.length === 0) {
      throw new Error("[orderService] Order must contain at least one item.");
    }
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      throw new Error("[orderService] totalAmount must be a positive number.");
    }
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.province
    ) {
      throw new Error(
        "[orderService] Invalid shipping address — street, city, and province are required."
      );
    }

    // ── Map CartItem[] → OrderItem snapshot ───────────────
    // Snapshot preserves price/name at time of purchase,
    // decoupling the order from future product changes.
    const orderItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    // ── Map Address → ShippingAddress snapshot ─────────────
    // Strip identity fields (id, type, isDefault) — only
    // the delivery location is relevant to the order.
    const snapshotAddress: ShippingAddress = {
      street: shippingAddress.street,
      city: shippingAddress.city,
      province: shippingAddress.province,
    };

    // ── Generate auto-ID and write order ───────────────────
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const newOrderRef = doc(ordersRef); // Firestore-generated ID
    const now = Timestamp.now();

    const orderData: OrderDocument = {
      orderId: newOrderRef.id,
      userId,
      items: orderItems,
      subtotal: totalAmount,     // caller is responsible for pre-calc
      shippingFee: 0,            // included in totalAmount from caller
      totalAmount,
      currency: "PHP",
      status: "pending",
      shippingAddress: snapshotAddress,
      paymentMethod: "credit_card", // default — updated post-payment
      paymentStatus: "pending",
      createdAt: now,
      shippedAt: null,
      deliveredAt: null,
      notes: "",
    };

    await setDoc(newOrderRef, orderData);

    return newOrderRef.id;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[orderService]")) {
      throw error;
    }
    throw new Error(
      `[orderService] Failed to create order for user ${userId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Fetches a single order by its Firestore document ID.
 *
 * Returns null if the order doesn't exist — no error thrown,
 * since a missing order may be a valid state (e.g. stale link).
 *
 * @param orderId - Auto-generated Firestore document ID of the order
 * @returns The OrderDocument, or null if not found
 * @throws On Firestore read failure
 */
export async function getOrderById(
  orderId: string
): Promise<OrderDocument | null> {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) {
      return null;
    }

    return snap.data() as OrderDocument;
  } catch (error) {
    throw new Error(
      `[orderService] Failed to fetch order ${orderId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Fetches all orders belonging to a specific user.
 *
 * Results are sorted by createdAt descending (newest first).
 * Returns an empty array if the user has placed no orders.
 *
 * @param userId - Firebase Auth UID of the user
 * @returns Array of OrderDocuments sorted newest-first
 * @throws On Firestore read failure
 */
export async function getUserOrders(userId: string): Promise<OrderDocument[]> {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const userOrdersQuery = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(userOrdersQuery);

    if (snap.empty) {
      return [];
    }

    return snap.docs.map((d) => d.data() as OrderDocument);
  } catch (error) {
    throw new Error(
      `[orderService] Failed to fetch orders for user ${userId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Updates the status of an existing order.
 *
 * Validates that the new status is one of the allowed values
 * before writing. Core order fields are not affected.
 *
 * @param orderId - Firestore document ID of the order to update
 * @param status  - New order status (must be a valid OrderStatus value)
 * @throws If the order does not exist
 * @throws If the status value is not in the allowed list
 * @throws On Firestore write failure
 *
 * TODO: Add admin check before allowing status update
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  try {
    // Validate status value
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error(
        `[orderService] Invalid status "${status}". ` +
          `Allowed values: ${ALLOWED_STATUSES.join(", ")}`
      );
    }

    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) {
      throw new Error(
        `[orderService] Cannot update status — no order found with ID: ${orderId}`
      );
    }

    await setDoc(orderRef, { status }, { merge: true });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[orderService]")) {
      throw error;
    }
    throw new Error(
      `[orderService] Failed to update status for order ${orderId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// ─────────────────────────────────────────────

/**
 * Cancels an order by setting its status to 'cancelled'.
 *
 * Only orders currently in 'pending' status can be cancelled.
 * Orders that are already processing, shipped, or delivered
 * cannot be cancelled through the app.
 *
 * @param orderId - Firestore document ID of the order to cancel
 * @throws If the order does not exist
 * @throws If the order status is not 'pending'
 * @throws On Firestore write failure
 *
 * TODO: Check userId matches auth user before allowing cancel
 */
export async function cancelOrder(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) {
      throw new Error(
        `[orderService] Cannot cancel — no order found with ID: ${orderId}`
      );
    }

    const order = snap.data() as OrderDocument;

    if (order.status !== "pending") {
      throw new Error(
        `[orderService] Cannot cancel — order status is "${order.status}". ` +
          `Only orders with status "pending" can be cancelled.`
      );
    }

    await setDoc(orderRef, { status: "cancelled" }, { merge: true });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[orderService]")) {
      throw error;
    }
    throw new Error(
      `[orderService] Failed to cancel order ${orderId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
