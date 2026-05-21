
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

const ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/** Creates an order and returns its auto-generated Firestore ID. */
export async function createOrder(
  userId: string,
  items: CartItem[],
  totalAmount: number,
  shippingAddress: Address
): Promise<string> {
  try {

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


    const orderItems = items.map((item) => ({
      productID: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
      imageKey: item.imageKey ?? "",
    }));


    const snapshotAddress: ShippingAddress = {
      street: shippingAddress.street,
      city: shippingAddress.city,
      province: shippingAddress.province,
    };

    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const newOrderRef = doc(ordersRef);
    const now = Timestamp.now();

    const orderData: OrderDocument = {
      orderId: newOrderRef.id,
      userId,
      items: orderItems,
      subtotal: totalAmount,
      shippingFee: 0,
      totalAmount,
      currency: "PHP",
      status: "pending",
      shippingAddress: snapshotAddress,
      paymentMethod: "credit_card",
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

// TODO: Add admin auth check before allowing status update
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  try {
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

// TODO: Verify userId matches auth user before allowing cancel
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
